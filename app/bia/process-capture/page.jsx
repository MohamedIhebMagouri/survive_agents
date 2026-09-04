'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import BiaShell from '@/components/bia/BiaShell'
import { biaApi } from '@/lib/bia-api'

const emptyDraft = { name: '', description: '', department: '', owner: '', location: '', impact: '', criticality: '', rto: 24, rpo: 4, mtpd: 72, mbco: 50, factoryId: '', category: '', status: 'Actif' }
const criticalityLabels = { low: 'Mineur', medium: 'Modéré', high: 'Majeur', critical: 'Critique', Mineur: 'Mineur', Modéré: 'Modéré', Majeur: 'Majeur', Critique: 'Critique' }

function apiPayload(draft) {
  return { ...draft, criticality: criticalityLabels[draft.criticality] || draft.criticality, mbco: `${draft.mbco}%` }
}

function sourceLabel(source) {
  return { user_explicit: 'déclaré', form_explicit: 'saisi', inferred: 'inféré', default: 'par défaut', unresolved: 'à préciser' }[source] || 'extrait'
}

export default function ProcessCapturePage() {
  const [factories, setFactories] = useState([])
  const [text, setText] = useState('')
  const [draft, setDraft] = useState(emptyDraft)
  const [metadata, setMetadata] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState('')

  useEffect(() => { biaApi('/factories').then(setFactories).catch((e) => setError(e.message)) }, [])

  function update(field, value) { setDraft((current) => ({ ...current, [field]: field === 'rto' || field === 'rpo' || field === 'mtpd' || field === 'mbco' ? Number(value) : value })) }

  async function capture(event) {
    event.preventDefault(); setBusy(true); setError(''); setSaved('')
    try {
      const body = new FormData()
      body.append('text', text)
      body.append('formData', JSON.stringify(draft))
      const response = await fetch('/api/ai/process-capture', { method: 'POST', body })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error?.message || payload.error || 'Capture impossible')
      const suggested = payload.data.recoveryMetrics?.proposal
      const capturedProcess = suggested ? { ...payload.data.process, rto: Math.max(1, Math.round(suggested.rtoMinutes / 60)), rpo: Math.round(suggested.rpoMinutes / 60), mtpd: Math.max(1, Math.round(suggested.mtpdMinutes / 60)) } : payload.data.process
      const capturedMetadata = { ...(payload.data.fieldMetadata || {}) }
      if (suggested) {
        capturedMetadata.rto = { source: 'inferred', confidence: payload.data.recoveryMetrics.confidence, evidence: 'Suggestion Recovery Metrics Agent à confirmer.' }
        capturedMetadata.rpo = { source: 'inferred', confidence: payload.data.recoveryMetrics.confidence, evidence: 'Suggestion Recovery Metrics Agent à confirmer.' }
        capturedMetadata.mtpd = { source: 'inferred', confidence: payload.data.recoveryMetrics.confidence, evidence: 'Suggestion Recovery Metrics Agent à confirmer.' }
      }
      setResult(payload.data); setDraft(capturedProcess); setMetadata(capturedMetadata)
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function confirmCreation() {
    setBusy(true); setError(''); setSaved('')
    if (!draft.name.trim() || !draft.factoryId || draft.rpo > draft.rto || draft.rto > draft.mtpd) { setError('Complétez le nom, l’usine et des objectifs cohérents avant de créer.'); setBusy(false); return }
    try {
      const created = await biaApi('/processes', { method: 'POST', body: JSON.stringify(apiPayload(draft)) })
      setSaved(`Processus « ${created.name} » créé avec ses objectifs de récupération.`); setResult(null)
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  return (
    <BiaShell active="processes" title="Capture guidée d’un processus" subtitle="Décrivez le processus, vérifiez les faits extraits, puis confirmez la création." actions={<Link className="rounded-lg border border-[#c5c5d3] px-4 py-2.5 text-sm font-semibold text-[#444651]" href="/bia/processes">Retour aux processus</Link>}>
      <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]" onSubmit={capture}>
        <section className="space-y-5 rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
          <div><h2 className="text-lg font-bold text-[#00236f]">1. Décrire</h2><p className="mt-1 text-sm text-[#757682]">Le texte reste une donnée utilisateur. L’agent ne crée rien à cette étape.</p></div>
          <label className="flex flex-col gap-2 text-sm font-semibold">Description naturelle<textarea className="min-h-40 rounded-lg border border-[#c5c5d3] p-3 font-normal outline-none focus:ring-2 focus:ring-[#00236f]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex. Le traitement des commandes B2B est piloté par le service commercial..." /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Usine<select className="rounded-lg border border-[#c5c5d3] px-3 py-2 font-normal" value={draft.factoryId || ''} onChange={(e) => update('factoryId', e.target.value)} required><option value="">À sélectionner</option>{factories.map((factory, index) => <option key={factory.id || `${factory.code || 'factory'}-${index}`} value={factory.id}>{factory.name} ({factory.code})</option>)}</select></label>
          <p className="rounded-lg bg-[#f2f4f6] p-3 text-sm text-[#444651]">Sélectionnez uniquement l’usine, puis décrivez le processus en langage naturel. Le nom et les autres informations métier seront extraits automatiquement.</p>
          <button className="flex items-center justify-center gap-2 rounded-lg bg-[#00236f] px-5 py-3 font-bold text-white disabled:opacity-50" disabled={busy} type="submit"><span className="material-symbols-outlined">auto_awesome</span>{busy ? 'Analyse en cours...' : 'Analyser et préparer le brouillon'}</button>
        </section>

        <aside className="space-y-4"><div className="rounded-xl border border-[#c5c5d3] bg-[#eef6f5] p-5"><h2 className="font-bold text-[#006b5f]">État de la capture</h2><p className="mt-2 text-sm leading-6 text-[#444651]">{result ? `Statut : ${result.status}` : 'Saisissez une description ou complétez directement les champs.'}</p>{error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{saved && <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">{saved}</p>}</div>{result?.recoveryMetrics && <div className="rounded-xl border border-[#6df5e1] bg-white p-5"><div className="flex items-center justify-between"><h3 className="font-bold text-[#00236f]">Objectifs suggérés</h3><span className="rounded-full bg-[#eef6f5] px-2 py-1 text-xs font-bold text-[#006b5f]">{Math.round(result.recoveryMetrics.confidence * 100)}%</span></div><div className="mt-3 grid grid-cols-3 gap-2 text-center">{[['RTO', result.recoveryMetrics.proposal.rtoMinutes], ['RPO', result.recoveryMetrics.proposal.rpoMinutes], ['MTPD', result.recoveryMetrics.proposal.mtpdMinutes]].map(([label, value]) => <div key={label} className="rounded-lg bg-[#f2f4f6] p-2"><p className="text-xs font-bold text-[#757682]">{label}</p><p className="font-bold text-[#00236f]">{value} min</p></div>)}</div><ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[#444651]">{result.recoveryMetrics.rationale.map((item, index) => <li key={index}>{item}</li>)}</ul><p className="mt-3 text-xs text-[#9a5a00]">Proposition du Recovery Metrics Agent à valider avant création.</p></div>}{result?.questions?.length > 0 && <div className="rounded-xl border border-[#c5c5d3] bg-white p-5"><h3 className="font-bold">Questions à préciser</h3><ul className="mt-3 space-y-2 text-sm text-[#444651]">{result.questions.map((question, index) => { const text = question.question || question.reason || (question.field ? `Précisez le champ « ${question.field} ».` : 'Information complémentaire requise.'); return <li key={question.id || `${question.field || 'question'}-${index}`}>• {text}</li> })}</ul></div>}{result?.duplicateCandidates?.length > 0 && <div className="rounded-xl border border-[#e2bd75] bg-[#fff8e8] p-5"><h3 className="font-bold text-[#9a5a00]">Processus similaires</h3><ul className="mt-3 space-y-2 text-sm">{result.duplicateCandidates.map((candidate, index) => <li key={candidate.id || `${candidate.name || 'candidate'}-${index}`}>{candidate.name} ({Math.round(candidate.similarity * 100)}%)</li>)}</ul></div>}</aside>
      </form>

      <section className="mt-6 rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-[#00236f]">2. Vérifier et confirmer</h2><p className="mt-1 text-sm text-[#757682]">Tous les champs restent modifiables. Les badges indiquent leur provenance.</p></div><button className="rounded-lg bg-[#006b5f] px-5 py-3 font-bold text-white disabled:opacity-50" disabled={!result || result.status === 'needs_questions' || busy} onClick={confirmCreation} type="button">Créer le processus</button></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{['name', 'department', 'owner', 'location', 'category', 'impact', 'criticality', 'rto', 'rpo', 'mtpd', 'mbco', 'description'].map((field) => <label className="flex flex-col gap-1 text-sm font-semibold" key={field}>{field.toUpperCase()}<input className="rounded-lg border border-[#c5c5d3] px-3 py-2 font-normal" value={draft[field] ?? ''} onChange={(e) => update(field, e.target.value)} /><span className="text-[11px] font-normal text-[#757682]">{sourceLabel(metadata[field]?.source)}</span></label>)}</div>
      </section>
    </BiaShell>
  )
}
