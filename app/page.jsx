"use client"

import Link from 'next/link'

const methodologySteps = [
  { icon: 'center_focus_strong', title: 'Scope definition', description: 'Defining boundaries and critical dependencies.', active: false },
  { icon: 'analytics', title: 'Analysis', description: 'Risk assessment and impact quantification.', active: false },
  { icon: 'architecture', title: 'Strategy design', description: 'Crafting recovery paths and fallback protocols.', active: false },
  { icon: 'bolt', title: 'Implementation', description: 'Deploying controls and response tools.', active: false },
  { icon: 'verified', title: 'Validation', description: 'Rigorous testing and simulation exercises.', active: true },
  { icon: 'sync', title: 'Continuous improvement', description: 'Closing gaps through iterative learning loops.', active: false },
]

const simulationFeatures = [
  { icon: 'dynamic_feed', title: 'Coordinate Teams', description: 'Unified command structure for real-time collaboration during stress tests.' },
  { icon: 'timeline', title: 'Track Decisions', description: 'Automated logging of every action for post-incident regulatory audits.' },
  { icon: 'lightbulb', title: 'Capture Lessons', description: 'Intelligent synthesis of performance data into actionable improvement plans.' },
]

const scenarioCards = [
  ['dns', 'IT Disaster'],
  ['tsunami', 'Natural Disaster'],
  ['security', 'Cyber Breach'],
  ['group_off', 'Supply Chain'],
]

const footerLinks = ['Privacy Policy', 'Terms of Service', 'Security Compliance', 'Contact']
const footerMeta = ['About', 'Security', 'Support']

export default function LandingPage() {
  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-bold leading-8 text-[#00236f]">Survive</span>
            <div className="hidden gap-4 md:flex">
              <a className="text-[14px] font-medium leading-5 text-[#444651] transition-colors hover:text-[#00236f]" href="#methodology">Methodology</a>
              <a className="text-[14px] font-medium leading-5 text-[#444651] transition-colors hover:text-[#00236f]" href="#simulations">Simulations</a>
              <a className="text-[14px] font-medium leading-5 text-[#444651] transition-colors hover:text-[#00236f]" href="#enterprise">Enterprise</a>
              <a className="text-[14px] font-medium leading-5 text-[#444651] transition-colors hover:text-[#00236f]" href="#pricing">Pricing</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden items-center gap-1 text-[14px] font-medium leading-5 text-[#444651] transition-colors hover:text-[#00236f] sm:flex" type="button">
              <span className="material-symbols-outlined text-[20px]">language</span>
              <span>EN</span>
            </button>
            <Link className="rounded-lg border border-[#00236f] px-4 py-2 text-[14px] font-medium leading-5 text-[#00236f] transition-all hover:bg-[#f2f4f6] active:scale-95 md:px-6" href="/login">
              Login
            </Link>
            <Link className="rounded-lg bg-[#00236f] px-4 py-2 text-[14px] font-medium leading-5 text-white shadow-sm transition-all hover:opacity-90 active:scale-95 md:px-6" href="/login">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="overflow-x-hidden pt-24">
        <section className="relative mx-auto max-w-[1280px] px-4 pb-24 pt-8 md:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="z-10">
              <h1 className="mb-6 text-[48px] font-bold leading-[56px] tracking-[-0.02em] text-[#00236f]">
                Business Continuity and Crisis Simulation, simplified.
              </h1>
              <p className="mb-10 max-w-xl text-[18px] leading-7 text-[#444651]">
                Survive provides an enterprise-grade framework to help organizations
                prepare for the unexpected. Test your resilience, coordinate global
                teams, and improve your recovery strategies in a controlled,
                data-driven environment.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link className="rounded-xl bg-[#00236f] px-8 py-4 text-[14px] font-medium leading-5 text-white shadow-lg transition-all hover:shadow-xl active:scale-95" href="/login">
                  Access platform
                </Link>
                <a className="rounded-xl border-2 border-[#00236f] px-8 py-4 text-[14px] font-medium leading-5 text-[#00236f] transition-all hover:bg-white active:scale-95" href="#methodology">
                  Explore methodology
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 -rotate-2 rounded-3xl bg-[#00236f]/5" />
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 shadow-2xl backdrop-blur-xl">
                <img
                  alt="Crisis management dashboard preview"
                  className="aspect-video h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyjj4hchDE9yGEsJie5McAg49x8TqDtVkHPnQHCZ3UqgqsfSwSjzuFClUrb-DOgJ3QeMdzxAYR1VlzX5pVaO7ToA3U7aEwjLElrf8p5o7a0GiGQLnlp4sefjZiKw0UhAUhIo_nx-ap4ieqfrNgpW-QSb8OvUFQn_vjYdP18lQ_IFOuMmC-HVl8bLjq2eB4g1GrR3nK_llBa1pmMM3lxnwMfSbZVrg25oEqkUBHEBT14d4anQgH-O_Aog"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f2f4f6] py-24" id="methodology">
          <div className="mx-auto max-w-[1280px] px-4 md:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-[#00236f]">Methodology Pipeline</h2>
              <p className="text-[16px] leading-6 text-[#444651]">A systematic approach to organizational resilience.</p>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-1/2 hidden h-1 w-full -translate-y-1/2 bg-[#c5c5d3]/30 lg:block" />
              <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
                {methodologySteps.map((step) => (
                  <div key={step.title} className="group flex flex-col items-center text-center">
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-white shadow-md transition-transform group-hover:scale-110 ${step.active ? 'border-[#006b5f] text-[#006b5f]' : 'border-[#00236f] text-[#00236f]'}`}>
                      <span className="material-symbols-outlined">{step.icon}</span>
                    </div>
                    <h3 className={`mb-2 text-[14px] font-bold leading-5 ${step.active ? 'text-[#006b5f]' : 'text-[#191c1e]'}`}>
                      {step.title}
                    </h3>
                    <p className="text-[12px] font-semibold leading-4 text-[#444651]">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 py-24 md:px-8" id="simulations">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#1e3a8a] p-8 text-white lg:p-24">
            <div className="relative z-10 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div>
                <span className="mb-6 inline-block rounded-full bg-[#90a8ff] px-4 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#00236f]">
                  Dynamic Exercises
                </span>
                <h2 className="mb-8 text-[32px] font-semibold leading-tight tracking-[-0.01em]">
                  Run realistic exercises, coordinate teams, and capture lessons
                  learned.
                </h2>
                <ul className="space-y-6">
                  {simulationFeatures.map((feature) => (
                    <li key={feature.title} className="flex gap-4">
                      <span className="material-symbols-outlined text-[#6df5e1]">{feature.icon}</span>
                      <div>
                        <h4 className="text-[14px] font-bold leading-5">{feature.title}</h4>
                        <p className="text-[16px] leading-6 text-[#90a8ff]">{feature.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  {scenarioCards.slice(0, 2).map(([icon, title], index) => (
                    <div key={title} className={`cursor-default rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md transition-all hover:bg-white/20 ${index === 1 ? 'translate-x-4' : ''}`}>
                      <span className="material-symbols-outlined mb-4 text-4xl">{icon}</span>
                      <h5 className="text-[14px] font-medium leading-5">{title}</h5>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 pt-8">
                  {scenarioCards.slice(2).map(([icon, title], index) => (
                    <div key={title} className={`cursor-default rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md transition-all hover:bg-white/20 ${index === 1 ? 'translate-x-4' : ''}`}>
                      <span className="material-symbols-outlined mb-4 text-4xl">{icon}</span>
                      <h5 className="text-[14px] font-medium leading-5">{title}</h5>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 py-24 md:px-8" id="enterprise">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-3xl border border-[#c5c5d3]/30 bg-white p-10 shadow-sm md:col-span-2">
              <div>
                <h3 className="mb-4 text-[24px] font-semibold leading-8 text-[#00236f]">Built for Regulation</h3>
                <p className="mb-8 text-[16px] leading-6 text-[#444651]">
                  Maintain compliance with global standards including ISO 22301 and
                  SOC2 with automated reporting and audit trails.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eceef0] text-[#00236f]">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eceef0] text-[#00236f]">
                  <span className="material-symbols-outlined">gavel</span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eceef0] text-[#00236f]">
                  <span className="material-symbols-outlined">inventory</span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-[#00236f] p-10 text-white shadow-lg">
              <h3 className="mb-4 text-[24px] font-semibold leading-8">Global Reach</h3>
              <p className="mb-6 text-[16px] leading-6 opacity-80">
                Multi-language and multi-region support for distributed enterprises.
              </p>
              <div className="absolute -bottom-10 -right-10 opacity-20">
                <span className="material-symbols-outlined text-[160px]">public</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-24 bg-[#e0e3e5]">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-4 px-8 py-8 md:flex-row">
          <div className="flex flex-col items-center md:items-start">
            <span className="mb-2 text-2xl font-bold leading-8 text-[#00236f]">Survive</span>
            <p className="text-[12px] font-semibold leading-4 text-[#444651]">© 2024 Survive Business Continuity. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {footerLinks.map((item) => (
              <a key={item} className="text-[12px] font-semibold leading-4 text-[#444651] transition-colors hover:text-[#00236f]" href="#">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {footerMeta.map((item) => (
              <span key={item} className="text-[12px] font-semibold leading-4 text-[#444651]">
                {item}
              </span>
            ))}
            <button className="flex items-center gap-1 text-[12px] font-bold leading-4 text-[#00236f]" type="button">
              <span className="material-symbols-outlined text-sm">language</span>
              EN
            </button>
          </div>
        </div>
      </footer>
    </>
  )
}
