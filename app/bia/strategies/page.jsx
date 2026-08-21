"use client"

import { useEffect, useState } from 'react'
import BiaShell, { badgeToneForStatus } from '@/components/bia/BiaShell'
import { strategyTypes } from '@/lib/bia-data'
import { biaApi } from '@/lib/bia-api'

const emptyForm = { name: '', type: strategyTypes[0], status: 'Planifié', processId: '' }

const typeIcons = {
  'Site de secours': 'domain',
  'Télétravail': 'laptop_mac',
  'Redondance': 'sync',
  'Sauvegardes': 'backup',
  'Externalisation': 'outbound',
  'PCA': 'shield',
  'PRA': 'restore',
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState([])
  const [processes, setProcesses] = useState([])
  const [error, setError] = useState('')
  const [isModalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { Promise.all([biaApi('/strategies'), biaApi('/processes')]).then(([items, processRows]) => { setStrategies(items); setProcesses(processRows); setForm((v) => ({ ...v, processId: processRows[0]?.id || '' })) }).catch((e) => setError(e.message)) }, [])
  const getProcessById = (id) => processes.find((item) => item.id === id)

  async function handleSubmit(event) {
    event.preventDefault()
    try { const saved = await biaApi('/strategies', { method: 'POST', body: JSON.stringify(form) }); setStrategies((current) => [...current, saved]); setModalOpen(false); setForm({ ...emptyForm, processId: processes[0]?.id || '' }) } catch (e) { setError(e.message) }
  }

  return (
    <BiaShell
      active="strategies"
      title="Stratégies de reprise"
      subtitle="Dispositifs de continuité associés aux analyses BIA, organisés par type."
      actions={(
        <button
          className="flex items-center gap-2 rounded-lg bg-[#00236f] px-5 py-2.5 font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined">add</span>
          Nouvelle stratégie
        </button>
      )}
    >
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {strategyTypes.map((type) => {
          const items = strategies.filter((strategy) => strategy.type === type)
          return (
            <div key={type} className="flex flex-col rounded-xl border border-[#c5c5d3] bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00236f]">{typeIcons[type] ?? 'shield'}</span>
                <h3 className="text-[15px] font-bold">{type}</h3>
                <span className="ml-auto rounded-full bg-[#e6e8ea] px-2 py-0.5 text-[11px] font-bold text-[#444651]">{items.length}</span>
              </div>
              <div className="flex-1 space-y-2">
                {items.length === 0 && <p className="text-[13px] text-[#757682]">Aucune stratégie de ce type.</p>}
                {items.map((strategy) => {
                  const process = getProcessById(strategy.processId)
                  return (
                    <div key={strategy.id} className="rounded-lg border border-[#e6e8ea] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[13px] font-semibold leading-5">{strategy.name}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeToneForStatus(strategy.status)}`}>
                          {strategy.status}
                        </span>
                      </div>
                      {process && <p className="mt-1 text-[11px] text-[#757682]">{process.name}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg animate-fadeIn">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[18px] font-semibold leading-7">Nouvelle stratégie de reprise</h3>
              <button onClick={() => setModalOpen(false)} type="button">
                <span className="material-symbols-outlined text-[#757682]">close</span>
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Nom de la stratégie
                <input
                  className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                  value={form.name}
                />
              </label>
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Processus
                <select className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm" onChange={(event) => setForm({ ...form, processId: event.target.value })} required value={form.processId}>
                  {processes.map((process) => <option key={process.id} value={process.id}>{process.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Type
                <select
                  className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                  value={form.type}
                >
                  {strategyTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Statut
                <select
                  className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                  value={form.status}
                >
                  <option>Planifié</option>
                  <option>En test</option>
                  <option>En place</option>
                </select>
              </label>
              <div className="flex justify-end gap-3 border-t border-[#e6e8ea] pt-4">
                <button
                  className="rounded-lg px-4 py-2 text-[14px] font-semibold text-[#444651] hover:bg-[#e6e8ea]"
                  onClick={() => setModalOpen(false)}
                  type="button"
                >
                  Annuler
                </button>
                <button className="rounded-lg bg-[#00236f] px-4 py-2 text-[14px] font-bold text-white hover:shadow-md" type="submit">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </BiaShell>
  )
}
