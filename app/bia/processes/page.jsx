"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import BiaShell, { badgeToneForCriticality, badgeToneForStatus } from '@/components/bia/BiaShell'
import {
  criticalityLevels,
  departments,
  processCategories,
} from '@/lib/bia-data'
import { biaApi } from '@/lib/bia-api'

const emptyForm = {
  name: '',
  factoryId: '',
  department: departments[0],
  owner: '',
  category: processCategories[0],
  criticality: 'Modéré',
  status: 'Actif',
  description: '',
}

export default function ProcessesPage() {
  const [processes, setProcesses] = useState([])
  const [factories, setFactories] = useState([])
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [factoryFilter, setFactoryFilter] = useState('all')
  const [criticalityFilter, setCriticalityFilter] = useState('all')
  const [isModalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const getFactoryById = (id) => factories.find((factory) => factory.id === id)

  useEffect(() => {
    Promise.all([biaApi('/processes'), biaApi('/factories')]).then(([processRows, factoryRows]) => {
      setProcesses(processRows); setFactories(factoryRows); setForm((value) => ({ ...value, factoryId: value.factoryId || factoryRows[0]?.id || '' }))
    }).catch((e) => setError(e.message))
  }, [])

  const filtered = useMemo(() => {
    return processes.filter((process) => {
      const matchesSearch = `${process.name} ${process.owner}`.toLowerCase().includes(search.toLowerCase())
      const matchesFactory = factoryFilter === 'all' || process.factoryId === factoryFilter
      const matchesCriticality = criticalityFilter === 'all' || process.criticality === criticalityFilter
      return matchesSearch && matchesFactory && matchesCriticality && process.status !== 'Supprimé'
    })
  }, [processes, search, factoryFilter, criticalityFilter])

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, factoryId: factories[0]?.id || '' })
    setModalOpen(true)
  }

  function openEdit(process) {
    setEditingId(process.id)
    setForm(process)
    setModalOpen(true)
  }

  async function archiveProcess(id) {
    const current = processes.find((item) => item.id === id)
    try { const saved = await biaApi(`/processes/${id}`, { method: 'PATCH', body: JSON.stringify({ ...current, status: 'Archivé' }) }); setProcesses((rows) => rows.map((item) => item.id === id ? saved : item)) } catch (e) { setError(e.message) }
  }

  async function deleteProcess(id) {
    try { await biaApi(`/processes/${id}`, { method: 'DELETE' }); setProcesses((rows) => rows.filter((item) => item.id !== id)) } catch (e) { setError(e.message) }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      const payload = { ...form, factoryId: form.factoryId || factories[0]?.id || '' }
      const saved = await biaApi(editingId ? `/processes/${editingId}` : '/processes', { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      setProcesses((rows) => editingId ? rows.map((item) => item.id === editingId ? saved : item) : [...rows, saved])
      setModalOpen(false)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <BiaShell
      active="processes"
      title="Processus métier"
      subtitle="Cartographie des processus rattachés à chaque usine, support des analyses BIA."
      actions={(
        <button
          className="flex items-center gap-2 rounded-lg bg-[#00236f] px-5 py-2.5 font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
          onClick={openCreate}
          type="button"
        >
          <span className="material-symbols-outlined">add</span>
          Nouveau processus
        </button>
      )}
    >
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="flex flex-wrap items-center gap-3">
        <div className="group relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]">search</span>
          <input
            className="w-full rounded-full border border-[#c5c5d3] bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un processus, un propriétaire..."
            type="text"
            value={search}
          />
        </div>
        <select
          className="rounded-full border border-[#c5c5d3] bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
          onChange={(event) => setFactoryFilter(event.target.value)}
          value={factoryFilter}
        >
          <option value="all">Toutes les usines</option>
          {factories.map((factory) => (
            <option key={factory.id} value={factory.id}>{factory.name}</option>
          ))}
        </select>
        <select
          className="rounded-full border border-[#c5c5d3] bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
          onChange={(event) => setCriticalityFilter(event.target.value)}
          value={criticalityFilter}
        >
          <option value="all">Toutes criticités</option>
          {criticalityLevels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        <span className="text-[13px] font-semibold text-[#757682]">{filtered.length} processus</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#c5c5d3] bg-white shadow-sm">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#c5c5d3] text-[12px] uppercase tracking-wide text-[#757682]">
              <th className="px-6 py-3 font-semibold">Processus</th>
              <th className="px-6 py-3 font-semibold">Usine</th>
              <th className="px-6 py-3 font-semibold">Département</th>
              <th className="px-6 py-3 font-semibold">Propriétaire</th>
              <th className="px-6 py-3 font-semibold">Criticité</th>
              <th className="px-6 py-3 font-semibold">Statut</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((process) => (
              <tr key={process.id} className="border-b border-[#e6e8ea] last:border-0 hover:bg-[#f2f4f6]">
                <td className="px-6 py-4 font-medium">{process.name}</td>
                <td className="px-6 py-4 text-[#444651]">{getFactoryById(process.factoryId)?.name ?? '—'}</td>
                <td className="px-6 py-4 text-[#444651]">{process.department}</td>
                <td className="px-6 py-4 text-[#444651]">{process.owner}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${badgeToneForCriticality(process.criticality)}`}>
                    {process.criticality}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${badgeToneForStatus(process.status)}`}>
                    {process.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3 text-[13px] font-semibold">
                    <Link className="text-[#00236f] hover:underline" href={`/bia/new?processId=${process.id}`}>
                      Lancer BIA
                    </Link>
                    <button className="text-[#444651] hover:underline" onClick={() => openEdit(process)} type="button">
                      Modifier
                    </button>
                    <button className="text-[#9a5a00] hover:underline" onClick={() => archiveProcess(process.id)} type="button">
                      Archiver
                    </button>
                    <button className="text-[#ba1a1a] hover:underline" onClick={() => deleteProcess(process.id)} type="button">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg animate-fadeIn">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[18px] font-semibold leading-7">{editingId ? 'Modifier le processus' : 'Nouveau processus'}</h3>
              <button onClick={() => setModalOpen(false)} type="button">
                <span className="material-symbols-outlined text-[#757682]">close</span>
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <label className="col-span-2 flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Nom du processus
                  <input
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                    value={form.name}
                  />
                </label>
                <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Usine
                  <select
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, factoryId: event.target.value })}
                    value={form.factoryId}
                    required
                  >
                    <option value="" disabled>Sélectionner une usine</option>
                    {factories.map((factory) => (
                      <option key={factory.id} value={factory.id}>{factory.name}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Département
                  <select
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, department: event.target.value })}
                    value={form.department}
                  >
                    {departments.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Propriétaire
                  <input
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, owner: event.target.value })}
                    value={form.owner}
                  />
                </label>
                <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Catégorie
                  <select
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    value={form.category}
                  >
                    {processCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Criticité
                  <select
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, criticality: event.target.value })}
                    value={form.criticality}
                  >
                    {criticalityLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </label>
                <label className="col-span-2 flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Description
                  <textarea
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    rows={3}
                    value={form.description}
                  />
                </label>
              </div>
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
