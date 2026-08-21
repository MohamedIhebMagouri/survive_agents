"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import BiaShell, { badgeToneForCriticality } from '@/components/bia/BiaShell'
import { biaApi } from '@/lib/bia-api'

function gapTone(gap) {
  if (gap >= 30) return 'Critique'
  if (gap >= 15) return 'Majeur'
  if (gap >= 5) return 'Modéré'
  return 'Mineur'
}

export default function GapAnalysisPage() {
  const [gapAnalyses, setGapAnalyses] = useState([])
  const [processes, setProcesses] = useState([])
  const [factories, setFactories] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { Promise.all([biaApi('/gaps'), biaApi('/processes'), biaApi('/factories')]).then(([gaps, processRows, factoryRows]) => { setGapAnalyses(gaps); setProcesses(processRows); setFactories(factoryRows) }).catch((e) => setError(e.message)) }, [])
  const getProcessById = (id) => processes.find((item) => item.id === id)
  const getFactoryById = (id) => factories.find((item) => item.id === id)
  return (
    <BiaShell
      active="gap"
      title="Gap Analysis"
      subtitle="Comparaison entre la situation actuelle et le niveau de résilience attendu."
    >
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="space-y-6">
        {gapAnalyses.map((gap) => {
          const process = getProcessById(gap.processId)
          const factory = process ? getFactoryById(process.factoryId) : null
          const delta = gap.expectedLevel - gap.currentLevel
          const tone = gapTone(delta)

          return (
            <div key={gap.id} className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-[16px] font-bold">{process?.name ?? '—'}</h3>
                  <p className="text-[12px] font-semibold text-[#757682]">{factory?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${badgeToneForCriticality(tone)}`}>
                    Écart : {delta} pts
                  </span>
                  <Link className="text-[13px] font-semibold text-[#00236f] hover:underline" href={`/bia/new?processId=${gap.processId}`}>
                    Voir le BIA
                  </Link>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-[12px] font-semibold text-[#444651]">
                    <span>Situation actuelle</span>
                    <span>{gap.currentLevel}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#e6e8ea]">
                    <div className="h-full rounded-full bg-[#757682]" style={{ width: `${gap.currentLevel}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[12px] font-semibold text-[#444651]">
                    <span>Niveau attendu</span>
                    <span>{gap.expectedLevel}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#e6e8ea]">
                    <div className="h-full rounded-full bg-[#00236f]" style={{ width: `${gap.expectedLevel}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-[13px] font-bold uppercase text-[#ba1a1a]">Risques identifiés</h4>
                  <ul className="space-y-1">
                    {gap.risks.map((risk) => (
                      <li key={risk} className="flex items-start gap-2 text-[14px] text-[#444651]">
                        <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">warning</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-[13px] font-bold uppercase text-[#006b5f]">Recommandations</h4>
                  <ul className="space-y-1">
                    {gap.recommendations.map((recommendation) => (
                      <li key={recommendation} className="flex items-start gap-2 text-[14px] text-[#444651]">
                        <span className="material-symbols-outlined text-[16px] text-[#006b5f]">lightbulb</span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </BiaShell>
  )
}
