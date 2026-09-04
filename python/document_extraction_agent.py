import json
import os
import re
import sys
from typing import Any

from google import genai
from google.genai import types

if hasattr(sys.stdin, "reconfigure"):
    sys.stdin.reconfigure(encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")

FIELDS = ("name", "description", "department", "owner", "location", "impact", "criticality", "rto", "rpo", "mtpd", "mbco", "category", "status")
ENUMS = {"criticality": {"Mineur", "Modéré", "Majeur", "Critique"}, "category": {"Support", "Coeur de métier", "Pilotage"}, "status": {"Actif", "Inactif"}}
CHUNK_SIZE = 18000
CHUNK_OVERLAP = 1000
MAX_CHUNKS = 7


def fail(code: str, message: str) -> None:
    print(json.dumps({"ok": False, "code": code, "message": message}, ensure_ascii=False))
    raise SystemExit(0)


def extraction_prompt(payload: dict[str, Any], latex_document: str) -> str:
    instructions = ("Extrais uniquement les faits présents dans le document vers les champs demandés. "
                    "Réponds en JSON valide, en français pour les textes, avec null si absent. "
                     "N'invente aucun nom, responsable, site, durée ou impact. Convertis RTO, RPO et MTPD en heures entières et MBCO en entier de 0 à 100. Interprète les variantes d'accents et de formulation (Coeur/Cœur de métier, En activité/Actif) et renseigne le champ correspondant. "
                    "Les valeurs autorisées sont : criticité Mineur/Modéré/Majeur/Critique, catégorie Support/Coeur de métier/Pilotage, statut Actif/Inactif. ")
    return instructions + "\nChamps : " + json.dumps(FIELDS, ensure_ascii=False) + "\nContexte usine fiable : " + json.dumps(payload.get("factory"), ensure_ascii=False) + "\nDocument LaTeX structuré :\n" + latex_document


def split_text(text: str) -> list[str]:
    if len(text) <= CHUNK_SIZE:
        return [text]
    chunks = []
    start = 0
    while start < len(text) and len(chunks) < MAX_CHUNKS:
        end = min(len(text), start + CHUNK_SIZE)
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = end - CHUNK_OVERLAP
    if chunks and start < len(text) and not chunks[-1].endswith(text[-1000:]):
        chunks[-1] = text[-CHUNK_SIZE:]
    return chunks


def latex_prompt(chunk: str, index: int, total: int) -> str:
    return (f"Transforme la section {index}/{total} de ce document métier en LaTeX structuré. "
            "Préserve tous les faits, tableaux, libellés et valeurs, notamment processus, responsables, sites, impacts, "
            "criticité, RTO, RPO, MTPD et MBCO. N'invente rien. Retourne uniquement le contenu LaTeX, sans commentaire.\n\n" + chunk)


def as_int(value: Any) -> int | None:
    if value is None or value == "":
        return None
    match = re.search(r"-?\d+(?:[.,]\d+)?", str(value))
    if not match:
        return None
    return round(float(match.group().replace(",", ".")))


def normalize(raw: Any) -> dict[str, Any]:
    source = raw if isinstance(raw, dict) else {}
    result = {field: source.get(field) for field in FIELDS}
    for field in ("rto", "rpo", "mtpd", "mbco"):
        result[field] = as_int(result[field])
    aliases = {'criticality': {'mineure': 'Mineur', 'majeure': 'Majeur', 'modere': 'Modéré'}, 'category': {'coeur de metier': 'Coeur de métier', 'cœur de métier': 'Coeur de métier'}, 'status': {'en activité': 'Actif', 'en activite': 'Actif', 'active': 'Actif'}}
    for field, values in ENUMS.items():
        if result[field] not in values and result[field] is not None:
            result[field] = aliases.get(field, {}).get(str(result[field]).strip().lower())
    for field in FIELDS:
        if field not in ("rto", "rpo", "mtpd", "mbco", "criticality", "category", "status") and result[field] is not None:
            result[field] = str(result[field]).strip() or None
    return result


def main() -> None:
    payload = json.load(sys.stdin)
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        fail("GEMINI_CONFIG_ERROR", "GEMINI_API_KEY is not configured")
    try:
        client = genai.Client(api_key=key)
        model = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
        source_text = str(payload.get("input", {}).get("text", ""))
        chunks = split_text(source_text)
        latex_sections = []
        for index, chunk in enumerate(chunks, 1):
            converted = client.models.generate_content(
                model=model,
                contents=latex_prompt(chunk, index, len(chunks)),
                config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=5000),
            )
            if converted.text:
                latex_sections.append(converted.text)
        if not latex_sections:
            fail("GEMINI_OUTPUT_ERROR", "Gemini n'a produit aucune section LaTeX")
        latex_document = "\n\n".join(latex_sections)
        response = client.models.generate_content(
            model=model,
            contents=extraction_prompt(payload, latex_document),
            config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.1, max_output_tokens=1500),
        )
        if not response.text:
            fail("GEMINI_OUTPUT_ERROR", "Gemini returned an empty response")
        print(json.dumps({"ok": True, "result": normalize(json.loads(response.text))}, ensure_ascii=False))
    except SystemExit:
        raise
    except json.JSONDecodeError:
        fail("GEMINI_OUTPUT_ERROR", "Gemini returned invalid JSON")
    except Exception:
        fail("GEMINI_PROVIDER_ERROR", "Gemini request failed")


if __name__ == "__main__":
    main()
