import json, re, sys

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
def main():
    try:
        data=json.load(sys.stdin); p=data.get('process') or {}; text=' '.join(str(p.get(key) or '') for key in ('description','impact','name','department')).lower()
        declared=str(p.get('criticality') or '').lower(); level=CRITICALITY_INPUT.get(declared, 'medium')
        critical_terms=r'critique|vital|sécurité|securite|réglement|reglement|arrêt total|arret total|perte majeure|production bloquée|production bloquee'
        high_terms=r'financier|client|livraison|fournisseur|contrat|réputation|reputation|opérationnel|operationnel|indisponibilité|indisponibilite'
        if re.search(critical_terms, text): level='critical'
        elif re.search(high_terms, text) and level in ('low','medium'): level='high'
        score={'low':25,'medium':50,'high':75,'critical':90}[level]; lo,hi=RANGES[level]
        current_mtpd=int(p.get('mtpd') or (hi//60)*2*60); mtpd=max(hi, current_mtpd*60 if current_mtpd < 100 else current_mtpd)
        rto=max(lo, min(hi, mtpd//2)); rpo=max(0, min(rto, rto//4)); missing=[]; warnings=[]
        if not p.get('impact'): missing.append({'field':'impact','reason':'Impact métier non renseigné','blocking':False})
        if not data.get('biaReports'): warnings.append('Aucun rapport BIA détaillé fourni; proposition fondée sur la criticité et les valeurs existantes.')
        confidence=0.76 - (0.12 if missing else 0) - (0.08 if not data.get('biaReports') else 0)
        status='HUMAN_REVIEW' if level in ('critical','high') or confidence < .8 else 'PROPOSED'
        result={'status':status,'processId':p.get('id'),'proposal':{'rtoMinutes':rto,'rpoMinutes':rpo,'mtpdMinutes':mtpd,'mbcoPercent':int(str(p.get('mbco','50')).replace('%',''))},'metricMetadata':{},'criticality':{'level':CRITICALITY_FR[level],'score':score,'factors':[{'name':'description_et_impact','score':score,'evidence':text[:300] or 'Criticité déclarée du processus'}]},'confidence':round(confidence,2),'rationale':[f'La description et l’impact conduisent à une criticité {CRITICALITY_FR[level]}; le RTO est borné entre {lo} et {hi} minutes.','Le RPO est limité à un quart du RTO et le MTPD reste supérieur au RTO.'],'assumptions':[LANGUAGE_POLICY],'evidence':[{'source':'process','field':'description,impact,criticité','value':text[:500],'interpretation':'Informations multilingues interprétées et normalisées en français par le Process Capture Agent'}],'warnings':warnings,'missingInformation':missing,'questions':[],'constraints':{'rpoLessOrEqualRto':True,'rtoLessOrEqualMtpd':True,'allValuesPositive':True},'inputSnapshot':p,'impactSnapshot':data.get('biaReports',[]),'dependencySnapshot':p.get('activitesCritiques') or {}}
        for name,val in [('rto',rto),('rpo',rpo),('mtpd',mtpd)]: result['metricMetadata'][name]={'value':val,'unit':'minutes','source':'business_rule','confidence':result['confidence'],'evidence':'Règle déterministe basée sur la criticité et les contraintes de cohérence.'}
        print(json.dumps({'ok':True,'result':result}, ensure_ascii=False))
    except SystemExit: raise
    except Exception as e: fail('RECOVERY_METRICS_OUTPUT_ERROR', str(e))
if __name__=='__main__': main()
