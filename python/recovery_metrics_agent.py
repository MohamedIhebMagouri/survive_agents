import json, os, re, sys

from google import genai
from google.genai import types

if hasattr(sys.stdin, "reconfigure"):
    sys.stdin.reconfigure(encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

RANGES = {'critical': (60,240), 'high': (240,720), 'medium': (720,1440), 'low': (1440,4320)}
CRITICALITY_INPUT = {'critique':'critical','majeur':'high','modéré':'medium','modere':'medium','mineur':'low','critical':'critical','high':'high','medium':'medium','low':'low'}
CRITICALITY_FR = {'critical':'Critique','high':'Majeur','medium':'Modéré','low':'Mineur'}
LANGUAGE_POLICY = (
    "Comprendre les données source quelle que soit leur langue, notamment le français, l'anglais, l'arabe standard, "
    "le dialecte tunisien/Derja en alphabet arabe ou en Arabizi latin (3, 5, 7, 9), ainsi que les phrases mixtes. "
    "Toutes les justifications, preuves, hypothèses, questions et alertes produites doivent être rédigées en français professionnel."
)
def fail(code, message): print(json.dumps({'ok':False,'code':code,'message':message}, ensure_ascii=False)); raise SystemExit
SYSTEM_PROMPT = """Tu es un consultant senior en continuité d'activité, spécialisé en BIA et ISO 22301.
Analyse le processus fourni avec tout son contexte métier : description, impacts, criticité déclarée,
activités critiques, dépendances, systèmes, fournisseurs, ressources et rapports BIA disponibles.
Retourne uniquement un objet JSON valide. Toutes les explications doivent être en français professionnel.
Tu dois proposer des métriques de récupération en minutes : RTO, RPO et MTPD, ainsi qu'un MBCO en pourcentage.
Ne te contente pas de recopier les valeurs existantes : utilise-les comme contraintes ou comme preuves,
et explique dans rationale les valeurs conservées ou modifiées. Respecte impérativement RPO <= RTO <= MTPD,
avec des valeurs positives sauf RPO qui peut être nul. Adapte les valeurs à la criticité et aux impacts du processus ;
ne réutilise pas systématiquement les mêmes nombres pour tous les processus. RPO, RTO et MTPD sont des concepts
différents : sauf justification explicite, propose RPO < RTO < MTPD et des valeurs adaptées au contexte. Ne fabrique pas de faits absents : signale les informations
manquantes dans missingInformation et les hypothèses dans assumptions. Une proposition critique ou incertaine
doit être soumise à une revue humaine. Le score de criticité est compris entre 0 et 100.

Réponds avec exactement les clés : status, processId, proposal, metricMetadata, criticality, confidence,
rationale, assumptions, evidence, warnings, missingInformation, questions, constraints.
Dans proposal, utilise rtoMinutes, rpoMinutes, mtpdMinutes et mbcoPercent.
Dans metricMetadata, indique pour chaque métrique value, unit='minutes', source, confidence et evidence.
Les statuts autorisés sont PROPOSED, NEEDS_CLARIFICATION, HUMAN_REVIEW et ERROR.
"""


def build_prompt(data: dict) -> str:
    return "Analyse ce dossier de processus et calcule les métriques de récupération demandées.\n" + json.dumps(data, ensure_ascii=False, default=str)


def number(value, default=0):
    try:
        return int(round(float(str(value).replace('%', '').replace(',', '.'))))
    except (TypeError, ValueError):
        return default


def confidence_value(value, default=0.6):
    if isinstance(value, str):
        normalized = value.strip().lower()
        qualitative = {'very low': 0.2, 'low': 0.4, 'medium': 0.6, 'moderate': 0.6, 'high': 0.8, 'very high': 0.95}
        if normalized in qualitative:
            return qualitative[normalized]
        normalized = normalized.replace('%', '').replace(',', '.')
        try:
            numeric = float(normalized)
            return max(0.0, min(1.0, numeric / 100 if numeric > 1 else numeric))
        except ValueError:
            return default
    try:
        numeric = float(value)
        return max(0.0, min(1.0, numeric / 100 if numeric > 1 else numeric))
    except (TypeError, ValueError):
        return default


def contextual_confidence(data, raw):
    process = data.get('process') or {}
    fields = ('name', 'description', 'department', 'impact', 'criticality')
    completeness = sum(bool(process.get(field)) for field in fields) / len(fields)
    metrics = raw.get('proposal') if isinstance(raw.get('proposal'), dict) else {}
    metrics_complete = all(metrics.get(field) is not None for field in ('rtoMinutes', 'rpoMinutes', 'mtpdMinutes', 'mbcoPercent'))
    confidence = 0.35 + (0.35 * completeness) + (0.15 if metrics_complete else 0) + (0.15 if data.get('biaReports') else 0)
    return round(max(0.0, min(0.95, confidence)), 2)


def normalize_missing_information(value):
    normalized = []
    for index, item in enumerate(value if isinstance(value, list) else []):
        if isinstance(item, dict):
            normalized.append({
                'field': str(item.get('field') or f'information_{index + 1}'),
                'reason': str(item.get('reason') or 'Information nécessaire à confirmer.'),
                'blocking': bool(item.get('blocking', False)),
            })
        elif item:
            normalized.append({
                'field': f'information_{index + 1}',
                'reason': str(item),
                'blocking': False,
            })
    return normalized


def normalize_questions(value):
    normalized = []
    for index, item in enumerate(value if isinstance(value, list) else []):
        if isinstance(item, dict):
            question_type = item.get('type') if item.get('type') in {'text', 'number', 'single_choice', 'confirmation'} else 'text'
            normalized.append({
                'id': str(item.get('id') or f'question_{index + 1}'),
                'field': str(item.get('field') or 'information'),
                'question': str(item.get('question') or item.get('reason') or 'Pouvez-vous préciser cette information ?'),
                'type': question_type,
                'options': [str(option) for option in item.get('options', [])] if isinstance(item.get('options', []), list) else [],
            })
        elif item:
            normalized.append({
                'id': f'question_{index + 1}',
                'field': 'information',
                'question': str(item),
                'type': 'text',
                'options': [],
            })
    return normalized[:5]


def normalize_evidence(value):
    normalized = []
    for index, item in enumerate(value if isinstance(value, list) else []):
        if isinstance(item, dict):
            normalized.append(item)
        elif item:
            normalized.append({
                'source': 'gemini',
                'field': f'evidence_{index + 1}',
                'value': str(item),
                'interpretation': 'Élément fourni par Gemini comme preuve à confirmer.',
            })
    return normalized


def readable_items(value):
    normalized = []
    for item in value if isinstance(value, list) else []:
        if isinstance(item, dict):
            parts = [f'{key}: {val}' for key, val in item.items() if val not in (None, '', [])]
            if parts:
                normalized.append(' | '.join(parts))
        elif item:
            normalized.append(str(item).strip())
    return normalized


def normalize_metric_values(process, proposal, level_key):
    """Apply deterministic bounds so identical/default model outputs do not erase context."""
    low, high = RANGES[level_key]
    raw_rpo = number(proposal.get('rpoMinutes'), 0)
    raw_rto = number(proposal.get('rtoMinutes'), 0)
    raw_mtpd = number(proposal.get('mtpdMinutes'), 0)

    # Keep model values when credible, but use the criticality range for missing/outlier values.
    rto = raw_rto if raw_rto > 0 else low
    rto = min(max(rto, low), high)
    rpo = min(max(raw_rpo, 0), rto)
    mtpd = raw_mtpd if raw_mtpd > 0 else min(high * 2, 4320)
    mtpd = min(max(mtpd, rto), max(high * 2, rto))

    # Avoid the common degenerate answer (all metrics equal) while preserving ordering.
    if rto <= rpo:
        rpo = max(0, rto // 2)
    if mtpd <= rto:
        mtpd = min(max(high, rto + max(30, rto // 2)), 4320)
    return rpo, rto, mtpd


def normalize(data: dict, raw: dict) -> dict:
    process = data.get('process') or {}
    proposal = raw.get('proposal') if isinstance(raw.get('proposal'), dict) else {}
    criticality = raw.get('criticality') if isinstance(raw.get('criticality'), dict) else {}
    level_hint = str(criticality.get('level') or process.get('criticality') or 'Modéré')
    level_key = CRITICALITY_INPUT.get(level_hint.lower(), 'medium')
    rpo, rto, mtpd = normalize_metric_values(process, proposal, level_key)
    mbco = max(0, min(100, number(proposal.get('mbcoPercent'), number(process.get('mbco'), 50))))
    if rpo > rto:
        rpo = rto
    if mtpd < rto:
        mtpd = rto
    level = level_hint
    raw_confidence = raw.get('confidence')
    confidence = confidence_value(raw_confidence) if isinstance(raw_confidence, (int, float)) and not isinstance(raw_confidence, bool) else contextual_confidence(data, raw)
    status = raw.get('status') if raw.get('status') in {'PROPOSED', 'NEEDS_CLARIFICATION', 'HUMAN_REVIEW', 'ERROR'} else 'HUMAN_REVIEW'
    if confidence < 0.8 and status == 'PROPOSED':
        status = 'HUMAN_REVIEW'
    warnings = [str(item) for item in raw.get('warnings') or [] if item]
    if not isinstance(raw_confidence, (int, float)) or isinstance(raw_confidence, bool):
        warnings.append('Le niveau de confiance Gemini a été normalisé en valeur numérique et doit être revu par un humain.')
    if (rpo, rto, mtpd) != (number(proposal.get('rpoMinutes')), number(proposal.get('rtoMinutes')), number(proposal.get('mtpdMinutes'))):
        warnings.append('Les métriques Gemini ont été bornées pour respecter RPO ≤ RTO ≤ MTPD et les unités attendues.')
    metric_metadata = {}
    for name, value in [('rto', rto), ('rpo', rpo), ('mtpd', mtpd)]:
        source = raw.get('metricMetadata', {}).get(name, {}) if isinstance(raw.get('metricMetadata'), dict) else {}
        metric_metadata[name] = {'value': value, 'unit': 'minutes', 'source': str(source.get('source') or 'gemini'), 'confidence': confidence, 'evidence': str(source.get('evidence') or 'Proposition calculée par Gemini à partir du contexte du processus.')}
    score = number(criticality.get('score'), {'low': 25, 'medium': 50, 'high': 75, 'critical': 90}[level_key])
    return {'status': status, 'processId': process.get('id'), 'proposal': {'rtoMinutes': rto, 'rpoMinutes': rpo, 'mtpdMinutes': mtpd, 'mbcoPercent': mbco}, 'metricMetadata': metric_metadata, 'criticality': {'level': level, 'score': max(0, min(100, score)), 'factors': criticality.get('factors') if isinstance(criticality.get('factors'), list) else []}, 'confidence': round(confidence, 2), 'rationale': readable_items(raw.get('rationale')), 'assumptions': readable_items(raw.get('assumptions')), 'evidence': normalize_evidence(raw.get('evidence')), 'warnings': warnings, 'missingInformation': normalize_missing_information(raw.get('missingInformation')), 'questions': normalize_questions(raw.get('questions')), 'constraints': {'rpoLessOrEqualRto': rpo <= rto, 'rtoLessOrEqualMtpd': rto <= mtpd, 'allValuesPositive': rto > 0 and mtpd > 0 and rpo >= 0}, 'inputSnapshot': process, 'impactSnapshot': data.get('biaReports', []), 'dependencySnapshot': process.get('activitesCritiques') or {}}


def main():
    try:
        data = json.load(sys.stdin)
        api_key = os.getenv('GEMINI_API_KEY', '').strip()
        if not api_key:
            fail('GEMINI_CONFIG_ERROR', "GEMINI_API_KEY n'est pas configurée")
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(model=os.getenv('GEMINI_MODEL', 'gemini-2.5-flash'), contents=build_prompt(data), config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT, response_mime_type='application/json', temperature=0.1, max_output_tokens=3500))
        if not response.text:
            fail('GEMINI_OUTPUT_ERROR', 'Gemini a renvoyé une réponse vide')
        result = normalize(data, json.loads(response.text))
        print(json.dumps({'ok': True, 'result': result}, ensure_ascii=False))
    except SystemExit: raise
    except json.JSONDecodeError: fail('GEMINI_OUTPUT_ERROR', 'Gemini a renvoyé un JSON invalide')
    except Exception as error: fail('GEMINI_PROVIDER_ERROR', str(error))
if __name__=='__main__': main()
