'use client'

import { useEffect, useState } from 'react'
import { biaApi } from '@/lib/bia-api'

const fields = [
  ['name', 'Nom du processus'], ['description', 'Description'], ['department', 'Département'], ['owner', 'Responsable'],
  ['location', 'Localisation'], ['impact', 'Impact métier'], ['criticality', 'Criticité'], ['rto', 'RTO (heures)'],
  ['rpo', 'RPO (heures)'], ['mtpd', 'MTPD (heures)'], ['mbco', 'MBCO (%)'], ['category', 'Catégorie'], ['status', 'Statut'],
]

export default function DocumentExtractionForm() {
  const [factories, setFactories] = useState([])
  const [factoryId, setFactoryId] = useState('')
  const [file, setFile] = useState(null)
  const [values, setValues] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    biaApi('/factories').then(setFactories).catch((requestError) => setError(requestError.message))
  }, [])

  function selectFile(event) {
    setFile(event.target.files?.[0] || null)
    setError('')
    setMessage('')
  }

  async function extract(event) {
    event.preventDefault()
    if (!file) { setError('Sélectionnez un fichier PDF, DOCX ou XLSX.'); return }
    if (!factoryId) { setError('Sélectionnez une usine avant de lancer l’extraction.'); return }
    setBusy(true); setError(''); setMessage('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('factoryId', factoryId)
      const response = await fetch('/api/extract', { method: 'POST', body })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error?.message || 'Extraction impossible.')
      setValues(payload.data.fields)
      setMessage(`Extraction terminée : ${payload.data.fileName}`)
    } catch (requestError) { setError(requestError.message) } finally { setBusy(false) }
  }

  async function addProcess() {
    setBusy(true); setError(''); setMessage('')
    try {
      const created = await biaApi('/processes', {
        method: 'POST',
        body: JSON.stringify({ ...values, factoryId, mbco: `${values.mbco ?? 50}%` }),
      })
      setMessage(`Processus « ${created.name} » ajouté avec succès.`)
    } catch (requestError) { setError(requestError.message) } finally { setBusy(false) }
  }


  function update(field, value) { setValues((current) => ({ ...current, [field]: value === '' ? null : ['rto', 'rpo', 'mtpd', 'mbco'].includes(field) ? Number(value) : value })) }

  return (
    <form className="space-y-6" onSubmit={extract}>
      <section className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#00236f]">Document source</h2>
        <p className="mt-1 text-sm text-[#757682]">Le PDF est analysé directement par Gemini, y compris lorsqu’il est numérisé. DOCX et XLSX sont préparés côté serveur.</p>
        <input className="mt-5 w-full rounded-lg border border-[#c5c5d3] p-3" type="file" accept=".pdf,.docx,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={selectFile} />
        <p className="mt-2 text-xs text-[#757682]">PDF, DOCX ou XLSX, 15 Mo maximum.</p>
        <label className="mt-4 flex flex-col gap-1 text-sm font-semibold">Usine<select className="rounded-lg border border-[#c5c5d3] px-3 py-2 font-normal" value={factoryId} onChange={(event) => setFactoryId(event.target.value)} required><option value="">À sélectionner</option>{factories.map((factory) => <option key={factory.id} value={factory.id}>{factory.name} ({factory.code})</option>)}</select><span className="text-xs font-normal text-[#757682]">L’usine sélectionnée sera fournie comme contexte fiable à l’extraction.</span></label>
        <button className="mt-5 flex items-center gap-2 rounded-lg bg-[#00236f] px-5 py-3 font-bold text-white disabled:opacity-50" disabled={busy} type="submit"><span className="material-symbols-outlined">{busy ? 'progress_activity' : 'auto_awesome'}</span>{busy ? 'Extraction en cours...' : 'Extraire les champs'}</button>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      </section>
      <section className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-[#00236f]">Champs extraits</h2><p className="mt-1 text-sm text-[#757682]">Chaque valeur reste éditable avant son utilisation.</p></div><div className="flex flex-wrap gap-2"><button className="rounded-lg border border-[#006b5f] px-4 py-2 font-semibold text-[#006b5f]" type="button" onClick={() => setValues({})}>Réinitialiser</button><button className="flex items-center gap-2 rounded-lg bg-[#006b5f] px-4 py-2 font-bold text-white disabled:opacity-50" type="button" disabled={busy || !Object.keys(values).length} onClick={addProcess}><span className="material-symbols-outlined">add_circle</span>{busy ? 'Enregistrement...' : 'Ajouter le processus'}</button></div></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{fields.map(([field, label]) => <label className="flex flex-col gap-1 text-sm font-semibold" key={field}>{label}{field === 'description' || field === 'impact' ? <textarea className="min-h-24 rounded-lg border border-[#c5c5d3] px-3 py-2 font-normal" value={values[field] ?? ''} onChange={(event) => update(field, event.target.value)} /> : <input className="rounded-lg border border-[#c5c5d3] px-3 py-2 font-normal" type={['rto', 'rpo', 'mtpd', 'mbco'].includes(field) ? 'number' : 'text'} value={values[field] ?? ''} onChange={(event) => update(field, event.target.value)} />}</label>)}</div>
      </section>
    </form>
  )
}
