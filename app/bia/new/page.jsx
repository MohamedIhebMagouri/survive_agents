"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import BiaShell, { badgeToneForCriticality } from '@/components/bia/BiaShell'
import {
  getCriticality,
  impactCategories,
  interruptionPeriods,
  resourceCategories,
} from '@/lib/bia-data'
import { biaApi } from '@/lib/bia-api'

const steps = [
  { key: 'general', label: 'Informations générales', icon: 'assignment' },
  { key: 'impacts', label: 'Analyse des impacts', icon: 'trending_down' },
  { key: 'resources', label: 'Ressources critiques', icon: 'inventory_2' },
  { key: 'dependencies', label: 'Dépendances', icon: 'hub' },
  { key: 'minimal', label: 'Activités minimales', icon: 'speed' },
  { key: 'objectives', label: 'Objectifs de reprise', icon: 'flag' },
  { key: 'consequences', label: 'Conséquences & mesures', icon: 'report' },
  { key: 'recommendations', label: 'Recommandations', icon: 'lightbulb' },
]

function emptyImpactMatrix() {
  const matrix = {}
  interruptionPeriods.forEach((period, periodIndex) => {
    matrix[period] = {}
    impactCategories.forEach((category) => {
      // Sévérité par défaut progressive selon la période d'interruption
      matrix[period][category.key] = Math.min(100, 10 + periodIndex * 8)
    })
  })
  return matrix
}

export default function NewBiaPage() {
  const router = useRouter()
  const [processes, setProcesses] = useState([])
  const [factories, setFactories] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [processId, setProcessId] = useState('')
  const [objective, setObjective] = useState('')
  const [owner, setOwner] = useState('')
  const [version, setVersion] = useState('1.0')
  const [analysisDate, setAnalysisDate] = useState(new Date().toISOString().slice(0, 10))
  const [analyst, setAnalyst] = useState('')

  const [activePeriod, setActivePeriod] = useState(interruptionPeriods[2])
  const [impactMatrix, setImpactMatrix] = useState(emptyImpactMatrix)

  const [selectedResources, setSelectedResources] = useState([])

  const [dependencies, setDependencies] = useState({ internes: '', externes: '', fournisseurs: '', partenaires: '' })

  const [minimalActivities, setMinimalActivities] = useState('')
  const [minimalLevel, setMinimalLevel] = useState(50)

  const [rto, setRto] = useState('24h')
  const [rpo, setRpo] = useState('4h')
  const [mtpd, setMtpd] = useState('72h')
  const [mbco, setMbco] = useState('50%')

  const [consequences, setConsequences] = useState('')
  const [existingMeasures, setExistingMeasures] = useState('')

  const [recommendations, setRecommendations] = useState([{ text: '', priority: 'Moyenne', owner: '' }])

  useEffect(() => { Promise.all([biaApi('/processes'), biaApi('/factories')]).then(([processRows, factoryRows]) => { setProcesses(processRows); setFactories(factoryRows); setProcessId((value) => value || processRows[0]?.id || '') }).catch((e) => setError(e.message)) }, [])

  const selectedProcess = processes.find((process) => process.id === processId)
  const selectedFactory = selectedProcess ? factories.find((factory) => factory.id === selectedProcess.factoryId) : null

  const globalScore = useMemo(() => {
    const values = Object.values(impactMatrix).flatMap((periodScores) => Object.values(periodScores))
    if (values.length === 0) return 0
    return Math.round(values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length)
  }, [impactMatrix])

  const criticality = getCriticality(globalScore)

  function updateImpact(category, value) {
    setImpactMatrix((current) => ({
      ...current,
      [activePeriod]: { ...current[activePeriod], [category]: Number(value) },
    }))
  }

  function toggleResource(key) {
    setSelectedResources((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]))
  }

  function updateRecommendation(index, field, value) {
    setRecommendations((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)))
  }

  function addRecommendation() {
    setRecommendations((current) => [...current, { text: '', priority: 'Moyenne', owner: '' }])
  }

  function removeRecommendation(index) {
    setRecommendations((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  function goNext() {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1))
  }

  function goPrev() {
    setStepIndex((current) => Math.max(current - 1, 0))
  }

  async function saveBia() {
    if (!selectedProcess) { setError('Sélectionnez un processus'); return }
    const impactScores = Object.fromEntries(impactCategories.map((category) => {
      const scores = interruptionPeriods.map((period) => Number(impactMatrix[period][category.key] || 0))
      return [category.key, Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)]
    }))
    const splitLines = (value) => value.split('\n').map((item) => item.trim()).filter(Boolean)
    const payload = { processId, processName: selectedProcess.name, factoryId: selectedProcess.factoryId, objective, owner, version, analysisDate, analyst, globalScore, impactScores, impactMatrix, resources: selectedResources, dependencies: Object.fromEntries(Object.entries(dependencies).map(([key, value]) => [key, splitLines(value)])), minimalActivities, minimalLevel, rto, rpo, mtpd, mbco, consequences, existingMeasures, recommendations: recommendations.filter((item) => item.text.trim()) }
    try { setSaving(true); const saved = await biaApi('/reports', { method: 'POST', body: JSON.stringify(payload) }); router.push(`/bia/${saved.id}`) } catch (e) { setError(e.message); setSaving(false) }
  }

  const currentStep = steps[stepIndex]

  return (
    <BiaShell
      active="new"
      title="Nouvelle analyse BIA"
      subtitle="Complétez les 8 sections pour générer une analyse d'impact métier."
    >
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-1 rounded-xl border border-[#c5c5d3] bg-white p-4 shadow-sm lg:sticky lg:top-32 lg:h-fit">
          {steps.map((step, index) => (
            <button
              key={step.key}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold transition-colors ${
                index === stepIndex ? 'bg-[#6df5e1]/40 text-[#006f64]' : 'text-[#444651] hover:bg-[#e6e8ea]'
              }`}
              onClick={() => setStepIndex(index)}
              type="button"
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                index === stepIndex ? 'bg-[#00236f] text-white' : 'bg-[#e6e8ea] text-[#757682]'
              }`}>
                {index + 1}
              </span>
              {step.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6 rounded-xl border border-[#c5c5d3] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#e6e8ea] pb-4">
            <span className="material-symbols-outlined text-[#00236f]">{currentStep.icon}</span>
            <h2 className="text-[20px] font-semibold leading-7">{currentStep.label}</h2>
            <span className="ml-auto text-[12px] font-semibold text-[#757682]">Étape {stepIndex + 1} / {steps.length}</span>
          </div>

          {currentStep.key === 'general' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="col-span-2 flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Processus métier
                <select
                  className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                  onChange={(event) => setProcessId(event.target.value)}
                  value={processId}
                >
                  {processes.map((process) => (
                    <option key={process.id} value={process.id}>{process.name}</option>
                  ))}
                </select>
                {selectedFactory && (
                  <span className="text-[12px] font-normal text-[#757682]">Usine : {selectedFactory.name}</span>
                )}
              </label>
              <label className="col-span-2 flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Objectif de l'analyse
                <textarea
                  className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                  onChange={(event) => setObjective(event.target.value)}
                  placeholder="Évaluer l'impact d'une interruption prolongée sur..."
                  rows={3}
                  value={objective}
                />
              </label>
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Propriétaire du processus
                <input
                  className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                  onChange={(event) => setOwner(event.target.value)}
                  value={owner}
                />
              </label>
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Version
                <input
                  className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                  onChange={(event) => setVersion(event.target.value)}
                  value={version}
                />
              </label>
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Date
                <input
                  className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                  onChange={(event) => setAnalysisDate(event.target.value)}
                  type="date"
                  value={analysisDate}
                />
              </label>
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Responsable de l'analyse
                <input
                  className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                  onChange={(event) => setAnalyst(event.target.value)}
                  value={analyst}
                />
              </label>
            </div>
          )}

          {currentStep.key === 'impacts' && (
            <div className="space-y-4">
              <p className="text-[13px] text-[#757682]">
                Sélectionnez une période d'interruption puis évaluez chaque catégorie d'impact (score de 0 à 100).
              </p>
              <div className="flex flex-wrap gap-2">
                {interruptionPeriods.map((period) => (
                  <button
                    key={period}
                    className={`rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                      activePeriod === period
                        ? 'border-[#00236f] bg-[#00236f] text-white'
                        : 'border-[#c5c5d3] text-[#444651] hover:bg-[#e6e8ea]'
                    }`}
                    onClick={() => setActivePeriod(period)}
                    type="button"
                  >
                    {period}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {impactCategories.map((category) => (
                  <div key={category.key} className="rounded-lg border border-[#c5c5d3] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#444651]">
                        <span className="material-symbols-outlined text-[18px] text-[#00236f]">{category.icon}</span>
                        {category.label}
                      </div>
                      <span className="text-[13px] font-bold text-[#00236f]">{impactMatrix[activePeriod][category.key]}</span>
                    </div>
                    <input
                      className="w-full accent-[#00236f]"
                      max={100}
                      min={0}
                      onChange={(event) => updateImpact(category.key, event.target.value)}
                      type="range"
                      value={impactMatrix[activePeriod][category.key]}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep.key === 'resources' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {resourceCategories.map((resource) => (
                <label
                  key={resource.key}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-[14px] font-medium transition-colors ${
                    selectedResources.includes(resource.key) ? 'border-[#00236f] bg-[#00236f]/5' : 'border-[#c5c5d3] hover:bg-[#f2f4f6]'
                  }`}
                >
                  <input
                    checked={selectedResources.includes(resource.key)}
                    className="h-4 w-4 accent-[#00236f]"
                    onChange={() => toggleResource(resource.key)}
                    type="checkbox"
                  />
                  <span className="material-symbols-outlined text-[#00236f]">{resource.icon}</span>
                  {resource.label}
                </label>
              ))}
            </div>
          )}

          {currentStep.key === 'dependencies' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { key: 'internes', label: 'Dépendances internes' },
                { key: 'externes', label: 'Dépendances externes' },
                { key: 'fournisseurs', label: 'Fournisseurs critiques' },
                { key: 'partenaires', label: 'Partenaires' },
              ].map((field) => (
                <label key={field.key} className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  {field.label}
                  <textarea
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setDependencies({ ...dependencies, [field.key]: event.target.value })}
                    placeholder="Un élément par ligne"
                    rows={4}
                    value={dependencies[field.key]}
                  />
                </label>
              ))}
            </div>
          )}

          {currentStep.key === 'minimal' && (
            <div className="space-y-4">
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Activités minimales à maintenir
                <textarea
                  className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                  onChange={(event) => setMinimalActivities(event.target.value)}
                  rows={4}
                  value={minimalActivities}
                />
              </label>
              <div>
                <div className="mb-2 flex items-center justify-between text-[13px] font-semibold text-[#444651]">
                  Niveau minimal de fonctionnement
                  <span className="text-[#00236f]">{minimalLevel}%</span>
                </div>
                <input
                  className="w-full accent-[#00236f]"
                  max={100}
                  min={0}
                  onChange={(event) => setMinimalLevel(Number(event.target.value))}
                  type="range"
                  value={minimalLevel}
                />
              </div>
            </div>
          )}

          {currentStep.key === 'objectives' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'RTO — Recovery Time Objective', value: rto, setter: setRto, hint: 'Délai maximal de reprise' },
                { label: 'RPO — Recovery Point Objective', value: rpo, setter: setRpo, hint: 'Perte de données maximale tolérée' },
                { label: 'MTPD — Maximum Tolerable Period of Disruption', value: mtpd, setter: setMtpd, hint: "Durée d'interruption maximale tolérable" },
                { label: 'MBCO — Minimum Business Continuity Objective', value: mbco, setter: setMbco, hint: 'Niveau minimal de service' },
              ].map((field) => (
                <label key={field.label} className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  {field.label}
                  <input
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => field.setter(event.target.value)}
                    value={field.value}
                  />
                  <span className="text-[11px] font-normal text-[#757682]">{field.hint}</span>
                </label>
              ))}
            </div>
          )}

          {currentStep.key === 'consequences' && (
            <div className="grid grid-cols-1 gap-4">
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Conséquences de l'interruption
                <textarea
                  className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                  onChange={(event) => setConsequences(event.target.value)}
                  placeholder="Pertes financières, réglementaires, opérationnelles, clients, réputationnelles..."
                  rows={4}
                  value={consequences}
                />
              </label>
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                Mesures existantes
                <textarea
                  className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                  onChange={(event) => setExistingMeasures(event.target.value)}
                  rows={4}
                  value={existingMeasures}
                />
              </label>
            </div>
          )}

          {currentStep.key === 'recommendations' && (
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="grid grid-cols-1 gap-3 rounded-lg border border-[#c5c5d3] p-4 sm:grid-cols-[1fr_140px_160px_40px]">
                  <input
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => updateRecommendation(index, 'text', event.target.value)}
                    placeholder="Recommandation / action corrective"
                    value={recommendation.text}
                  />
                  <select
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => updateRecommendation(index, 'priority', event.target.value)}
                    value={recommendation.priority}
                  >
                    <option>Haute</option>
                    <option>Moyenne</option>
                    <option>Basse</option>
                  </select>
                  <input
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => updateRecommendation(index, 'owner', event.target.value)}
                    placeholder="Responsable"
                    value={recommendation.owner}
                  />
                  <button
                    className="flex items-center justify-center rounded-lg text-[#ba1a1a] hover:bg-[#ba1a1a]/10"
                    onClick={() => removeRecommendation(index)}
                    type="button"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
              <button
                className="flex items-center gap-2 text-[13px] font-semibold text-[#00236f] hover:underline"
                onClick={addRecommendation}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Ajouter une recommandation
              </button>

              <div className="mt-6 rounded-xl border border-[#c5c5d3] bg-[#f2f4f6] p-6">
                <h3 className="mb-3 text-[16px] font-bold">Résultat de l'analyse automatique</h3>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <div className="text-[12px] font-semibold uppercase text-[#757682]">Score global</div>
                    <div className="text-3xl font-bold text-[#00236f]">{globalScore}</div>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold uppercase text-[#757682]">Niveau de criticité</div>
                    <span className={`rounded-full px-3 py-1 text-[13px] font-bold ${badgeToneForCriticality(criticality)}`}>
                      {criticality}
                    </span>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold uppercase text-[#757682]">RTO / RPO</div>
                    <div className="text-[14px] font-bold">{rto} / {rpo}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#e6e8ea] pt-6">
            <button
              className="rounded-lg px-4 py-2 text-[14px] font-semibold text-[#444651] disabled:opacity-40"
              disabled={stepIndex === 0}
              onClick={goPrev}
              type="button"
            >
              Précédent
            </button>
            {stepIndex < steps.length - 1 ? (
              <button
                className="rounded-lg bg-[#00236f] px-6 py-2.5 text-[14px] font-bold text-white shadow-sm hover:shadow-md active:scale-95"
                onClick={goNext}
                type="button"
              >
                Suivant
              </button>
            ) : (
              <button
                className="rounded-lg bg-[#006b5f] px-6 py-2.5 text-[14px] font-bold text-white shadow-sm hover:shadow-md active:scale-95"
                disabled={saving}
                onClick={saveBia}
                type="button"
              >
                {saving ? 'Enregistrement…' : "Enregistrer l'analyse BIA"}
              </button>
            )}
          </div>
        </div>
      </div>
    </BiaShell>
  )
}
