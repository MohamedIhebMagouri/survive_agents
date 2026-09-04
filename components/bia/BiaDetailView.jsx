"use client"

import { useState } from 'react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import BiaShell, { badgeToneForCriticality, badgeToneForStatus } from '@/components/bia/BiaShell'
import { getCriticality, impactCategories, resourceCategories } from '@/lib/bia-data'

const tabs = [
  { key: 'synthese', label: 'Synthèse' },
  { key: 'impacts', label: 'Impacts' },
  { key: 'ressources', label: 'Ressources & dépendances' },
  { key: 'objectifs', label: 'Objectifs de reprise' },
  { key: 'recommandations', label: 'Recommandations' },
]

function exportReport(format, bia) {
  const payload = JSON.stringify(bia, null, 2)
  if (format === 'json') {
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bia-${bia.id}.json`
    link.click()
    URL.revokeObjectURL(url)
    return
  }
}

export default function BiaDetailView({ bia, process }) {
  const [activeTab, setActiveTab] = useState('synthese')
  const [pdfBusy, setPdfBusy] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const factory = process?.factory || null
  const criticality = getCriticality(bia.globalScore)

  const radarData = impactCategories.map((category) => ({
    category: category.label,
    score: bia.impactScores?.[category.key] ?? 0,
  }))

  async function generatePdf() {
    setPdfBusy(true)
    setPdfError('')
    try {
      const response = await fetch(`/api/bia/reports/${bia.id}/pdf`, { method: 'POST' })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error?.message || 'Impossible de générer le rapport PDF.')
      }
      const blob = await response.blob()
      const disposition = response.headers.get('content-disposition') || ''
      const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || `bia-${bia.id}.pdf`
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setPdfError(error.message)
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <BiaShell
      active="dashboard"
      title={process?.name ?? 'Analyse BIA'}
      subtitle={`Version ${bia.version} · Analysé par ${bia.analyst} le ${bia.date}`}
      actions={(
        <>
          <button
            className="flex items-center gap-2 rounded-lg border border-[#c5c5d3] px-4 py-2.5 text-[14px] font-semibold text-[#444651] hover:bg-[#e6e8ea]"
            onClick={() => exportReport('json', bia)}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">data_object</span>
            Export JSON
          </button>
          <button
            className="flex items-center gap-2 rounded-lg bg-[#00236f] px-4 py-2.5 text-[14px] font-bold text-white shadow-sm hover:shadow-md"
            disabled={pdfBusy}
            onClick={generatePdf}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            {pdfBusy ? 'Génération Gemini...' : 'Générer le rapport PDF'}
          </button>
        </>
      )}
    >
      {pdfError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{pdfError}</div>}
      <div className="flex flex-wrap items-center gap-4">
        <span className={`rounded-full px-4 py-1.5 text-[13px] font-bold ${badgeToneForCriticality(criticality)}`}>
          Criticité : {criticality}
        </span>
        <span className={`rounded-full px-4 py-1.5 text-[13px] font-bold ${badgeToneForStatus(bia.status)}`}>
          {bia.status}
        </span>
        {factory && (
          <span className="flex items-center gap-1 text-[13px] font-semibold text-[#757682]">
            <span className="material-symbols-outlined text-[16px]">factory</span>
            {factory.name}
          </span>
        )}
      </div>

      <div className="border-b border-[#c5c5d3]">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-[14px] font-semibold transition-colors ${
                activeTab === tab.key ? 'border-[#00236f] text-[#00236f]' : 'border-transparent text-[#757682] hover:text-[#00236f]'
              }`}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'synthese' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="mb-4 text-[16px] font-bold">Objectif de l'analyse</h3>
            <p className="text-[14px] leading-6 text-[#444651]">{process?.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-[#f2f4f6] p-4 text-center">
                <div className="text-lg font-bold text-[#00236f]">{bia.rto}</div>
                <div className="text-[10px] font-semibold uppercase text-[#757682]">RTO</div>
              </div>
              <div className="rounded-lg bg-[#f2f4f6] p-4 text-center">
                <div className="text-lg font-bold text-[#00236f]">{bia.rpo}</div>
                <div className="text-[10px] font-semibold uppercase text-[#757682]">RPO</div>
              </div>
              <div className="rounded-lg bg-[#f2f4f6] p-4 text-center">
                <div className="text-lg font-bold text-[#00236f]">{bia.mtpd}</div>
                <div className="text-[10px] font-semibold uppercase text-[#757682]">MTPD</div>
              </div>
              <div className="rounded-lg bg-[#f2f4f6] p-4 text-center">
                <div className="text-lg font-bold text-[#00236f]">{bia.mbco}</div>
                <div className="text-[10px] font-semibold uppercase text-[#757682]">MBCO</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-[16px] font-bold">Score global</h3>
            <div className="flex items-center justify-center py-4">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle className="text-[#e6e8ea]" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8" />
                  <circle
                    className="text-[#00236f] transition-all duration-1000"
                    cx="64"
                    cy="64"
                    fill="transparent"
                    r="58"
                    stroke="currentColor"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * bia.globalScore) / 100}
                    strokeWidth="8"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{bia.globalScore}</span>
                  <span className="text-[10px] font-bold uppercase text-[#757682]">{criticality}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'impacts' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-[16px] font-bold">Cartographie des impacts</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer height="100%" width="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#e6e8ea" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#444651' }} />
                  <Radar dataKey="score" fill="#00236f" fillOpacity={0.25} stroke="#00236f" strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-[16px] font-bold">Conséquences de l'interruption</h3>
            <p className="text-[14px] leading-6 text-[#444651]">{bia.consequences}</p>
            <h3 className="mb-2 mt-6 text-[16px] font-bold">Mesures existantes</h3>
            <p className="text-[14px] leading-6 text-[#444651]">{bia.existingMeasures}</p>
          </div>
        </div>
      )}

      {activeTab === 'ressources' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-[16px] font-bold">Ressources critiques</h3>
            <div className="flex flex-wrap gap-2">
              {bia.resources.map((key) => {
                const resource = resourceCategories.find((item) => item.key === key)
                return (
                  <span key={key} className="flex items-center gap-2 rounded-full bg-[#00236f]/10 px-3 py-1.5 text-[13px] font-semibold text-[#00236f]">
                    <span className="material-symbols-outlined text-[16px]">{resource?.icon ?? 'inventory_2'}</span>
                    {resource?.label ?? key}
                  </span>
                )
              })}
            </div>
            <h3 className="mb-2 mt-6 text-[16px] font-bold">Activités minimales</h3>
            <p className="text-[14px] leading-6 text-[#444651]">{bia.minimalActivities}</p>
            <div className="mt-3 h-2 w-full rounded-full bg-[#e6e8ea]">
              <div className="h-full rounded-full bg-[#006b5f]" style={{ width: `${bia.minimalLevel}%` }} />
            </div>
            <span className="text-[12px] font-semibold text-[#757682]">Niveau minimal : {bia.minimalLevel}%</span>
          </div>
          <div className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-[16px] font-bold">Dépendances</h3>
            {Object.entries(bia.dependencies).map(([key, values]) => (
              <div key={key} className="mb-4">
                <div className="text-[12px] font-bold uppercase text-[#757682]">{key}</div>
                {values.length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {values.map((value) => (
                      <li key={value} className="flex items-center gap-2 text-[14px] text-[#444651]">
                        <span className="material-symbols-outlined text-[14px] text-[#00236f]">chevron_right</span>
                        {value}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] text-[#757682]">Aucune donnée renseignée.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'objectifs' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'RTO', value: bia.rto, hint: 'Delai maximal de reprise' },
            { label: 'RPO', value: bia.rpo, hint: 'Perte de données maximale tolérée' },
            { label: 'MTPD', value: bia.mtpd, hint: "Durée d'interruption maximale tolérable" },
            { label: 'MBCO', value: bia.mbco, hint: 'Niveau minimal de continuité' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[#c5c5d3] bg-white p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-[#00236f]">{item.value}</div>
              <div className="text-[12px] font-bold uppercase text-[#757682]">{item.label}</div>
              <p className="mt-2 text-[12px] text-[#444651]">{item.hint}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'recommandations' && (
        <div className="overflow-x-auto rounded-xl border border-[#c5c5d3] bg-white shadow-sm">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#c5c5d3] text-[12px] uppercase tracking-wide text-[#757682]">
                <th className="px-6 py-3 font-semibold">Recommandation</th>
                <th className="px-6 py-3 font-semibold">Priorité</th>
                <th className="px-6 py-3 font-semibold">Responsable</th>
              </tr>
            </thead>
            <tbody>
              {(bia.recommendations || []).map((recommendation, index) => (
                <tr key={recommendation.id || `${recommendation.text}-${index}`} className="border-b border-[#e6e8ea] last:border-0 hover:bg-[#f2f4f6]">
                  <td className="px-6 py-4">{recommendation.text}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${badgeToneForCriticality(
                      recommendation.priority === 'Haute' ? 'Critique' : recommendation.priority === 'Moyenne' ? 'Majeur' : 'Mineur',
                    )}`}>
                      {recommendation.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#444651]">{recommendation.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BiaShell>
  )
}
