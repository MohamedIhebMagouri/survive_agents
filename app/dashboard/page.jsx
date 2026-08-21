"use client"

import Link from 'next/link'

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', active: true, to: '/dashboard' },
  { label: 'Simulations', icon: 'simulation', active: false, to: '/simulation-room' },
  { label: 'Methodology', icon: 'account_tree', active: false, to: '/dashboard' },
  { label: 'Analytics', icon: 'analytics', active: false, to: '/dashboard' },
  { label: 'BIA', icon: 'fact_check', active: false, to: '/bia' },
]

const footerNav = [
  { label: 'Settings', icon: 'settings', to: '/dashboard' },
  { label: 'Support', icon: 'help', to: '/dashboard' },
]

const methodologySteps = [
  { label: 'Scope', icon: 'check_circle', complete: true, current: false },
  { label: 'Analysis', icon: 'check_circle', complete: true, current: false },
  { label: 'Strategy', icon: 'psychology', complete: false, current: true },
  { label: 'Implementation', icon: 'engineering', complete: false, current: false },
  { label: 'Validation', icon: 'rule', complete: false, current: false },
  { label: 'Improvement', icon: 'trending_up', complete: false, current: false },
]

const pendingActions = [
  { icon: 'assignment_late', tone: 'error', title: 'Approve Recovery Plan', detail: 'Due in 2 hours' },
  { icon: 'history_edu', tone: 'primary', title: 'Review Simulation Log', detail: 'Scenario: Flood Alert' },
  { icon: 'groups', tone: 'secondary', title: 'Invite Board Members', detail: 'Next Simulation' },
]

const footerLinks = ['Privacy Policy', 'Terms of Service', 'Security Compliance', 'Contact']

function navClass(active) {
  return active ? 'bg-[#6df5e1] text-[#006f64] font-bold' : 'text-[#444651] hover:bg-[#e6e8ea]'
}

function toneClass(tone) {
  if (tone === 'error') {
    return 'bg-[#ba1a1a]/10 text-[#ba1a1a] group-hover:bg-[#ba1a1a] group-hover:text-white'
  }
  if (tone === 'secondary') {
    return 'bg-[#006b5f]/10 text-[#006b5f] group-hover:bg-[#006b5f] group-hover:text-white'
  }
  return 'bg-[#00236f]/10 text-[#00236f] group-hover:bg-[#00236f] group-hover:text-white'
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen overflow-hidden bg-[#f8fafc] text-[#191c1e]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden h-full w-64 flex-col gap-4 border-r border-[#c5c5d3] bg-white p-4 md:flex">
        <div className="px-2 py-4">
          <div className="text-2xl font-bold tracking-tight text-[#00236f]">Survive</div>
          <div className="mt-8 flex items-center gap-3 px-2">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-[#c5c5d3] bg-[#1e3a8a]">
              <img
                alt="Workspace profile"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOnWqQlr1aUS-r8yqnN9h4laZpXs85V6x-CbpMXoz-QPW7hcvd0HQ4qdiBxf2wPA6psURfDM6RuQF11G90x7dsHDkjf0Hs8D-OPx84plFkOo6_9rcvB12ErWbdk0JL90-GkcJ5-39fXPbrfU7HP6zS8e2URmI415Hkaa2Unf2xn1OtdIAKgifDXl1KbGPnRM5cQ9orQozjBP8vFBxNXrDJ2C4m_uawTXu_0QCSczMbNKXEqeDoQcMq3w"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-medium leading-5">Global Workspace</span>
              <span className="text-[12px] font-semibold leading-4 text-[#757682]">Enterprise Admin</span>
            </div>
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link key={item.label} className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${navClass(item.active)}`} href={item.to}>
              <span className={`material-symbols-outlined ${item.active ? 'icon-fill' : ''}`}>{item.icon}</span>
              <span className="text-[14px] font-medium leading-5">{item.label}</span>
            </Link>
          ))}
        </nav>

        <Link className="flex items-center justify-center gap-2 rounded-xl bg-[#00236f] px-4 py-3 font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95" href="/simulation-room">
          <span className="material-symbols-outlined">play_circle</span>
          <span className="text-[14px] leading-5">Start Simulation</span>
        </Link>

        <div className="mt-auto space-y-1 border-t border-[#c5c5d3] pt-4">
          {footerNav.map((item) => (
            <Link key={item.label} className="group flex items-center gap-3 rounded-lg px-4 py-3 text-[#444651] transition-colors hover:bg-[#e6e8ea]" href={item.to}>
              <span className="material-symbols-outlined group-hover:text-[#00236f]">{item.icon}</span>
              <span className="text-[14px] font-medium leading-5">{item.label}</span>
            </Link>
          ))}
        </div>
      </aside>

      <main className="ml-0 flex min-h-screen flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-[#c5c5d3] bg-[#f2f4f6] px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-[#00236f] md:hidden">S.</div>
            <div className="group relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]">search</span>
              <input className="w-64 rounded-full border-none bg-[#e6e8ea] py-2 pl-10 pr-4 text-sm outline-none ring-0 transition-all focus:ring-2 focus:ring-[#00236f]" placeholder="Search workspace..." type="text" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-[#444651] transition-colors hover:bg-[#e0e3e5] active:scale-95" type="button">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ba1a1a]" />
            </button>
            <button className="rounded-full p-2 text-[#444651] transition-colors hover:bg-[#e0e3e5] active:scale-95" type="button">
              <span className="material-symbols-outlined">translate</span>
            </button>
            <div className="mx-2 h-6 w-px bg-[#c5c5d3]" />
            <Link className="group flex items-center gap-2" href="/logout">
              <span className="material-symbols-outlined text-[#757682] group-hover:text-[#00236f]">account_circle</span>
              <span className="hidden text-[14px] font-medium leading-5 text-[#444651] group-hover:text-[#00236f] sm:inline">Admin User</span>
            </Link>
          </div>
        </header>

        <div className="max-w-[1280px] flex-1 space-y-8 p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-xl bg-[#1e3a8a] p-8 text-white shadow-lg lg:col-span-2">
              <div className="relative z-10 space-y-2">
                <span className="text-[12px] font-semibold uppercase tracking-widest text-[#b6c4ff]">Resilience Protocol Active</span>
                <h1 className="max-w-lg text-[32px] font-semibold leading-10 tracking-[-0.01em] text-white">Ready to test your organizational readiness?</h1>
                <p className="max-w-md text-[16px] leading-6 text-white/80">
                  Launch a new scenario or join an active multi-departmental drill to
                  validate your business continuity strategy.
                </p>
              </div>
              <div className="relative z-10 flex flex-wrap gap-4">
                <Link className="flex items-center gap-2 rounded-lg bg-[#6df5e1] px-8 py-3 font-bold text-[#006f64] transition-all hover:brightness-110 active:scale-95" href="/simulation-room">
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Start New Simulation
                </Link>
                <Link className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95" href="/simulation-room">
                  Join Active Room
                </Link>
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-[#c5c5d3] bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[20px] font-semibold leading-7">Active Workspace</h3>
                <span className="material-symbols-outlined text-[#757682]">more_horiz</span>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-[#f2f4f6]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e6e8ea]">
                    <span className="material-symbols-outlined text-[#00236f]">hub</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium leading-5">London HQ</span>
                    <span className="text-[12px] font-semibold leading-4 text-[#757682]">12 Departments • 450 Staff</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-[#f2f4f6]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e6e8ea]">
                    <span className="material-symbols-outlined text-[#00236f]">dns</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium leading-5">DR Site Alpha</span>
                    <span className="text-[12px] font-semibold leading-4 text-[#757682]">Verified 4h ago</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-[#c5c5d3] pt-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-[14px] font-medium leading-5 text-[#444651]">System Health</span>
                  <span className="font-bold text-[#006b5f]">98%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e6e8ea]">
                  <div className="h-full bg-[#006b5f]" style={{ width: '98%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-[#c5c5d3] bg-white p-8 shadow-sm md:col-span-2 xl:col-span-2">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-[20px] font-semibold leading-7">Methodology Progress</h3>
                  <p className="text-[16px] leading-6 text-[#757682]">Current lifecycle phase for Enterprise Resilience</p>
                </div>
                <button className="flex items-center gap-1 text-[14px] font-bold leading-5 text-[#00236f] hover:underline" type="button">
                  Full Roadmap
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              <div className="relative flex flex-wrap items-center justify-between gap-2 md:flex-nowrap">
                <div className="absolute left-10 right-10 top-5 hidden h-0.5 bg-[#e6e8ea] md:block" />
                {methodologySteps.map((step) => (
                  <div key={step.label} className="group relative z-10 flex flex-col items-center gap-2">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md ${step.complete ? 'bg-[#006b5f] text-white' : step.current ? 'bg-[#00236f] text-white ring-4 ring-[#00236f]/20 shadow-lg' : 'bg-[#e6e8ea] text-[#757682] transition-colors group-hover:bg-[#e0e3e5]'}`}>
                      <span className={`material-symbols-outlined ${step.complete ? 'icon-fill' : ''}`}>{step.icon}</span>
                    </div>
                    <span className={`text-[12px] font-semibold leading-4 ${step.complete ? 'font-bold text-[#006b5f]' : step.current ? 'font-bold text-[#00236f]' : 'text-[#757682]'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex items-start gap-4 rounded-lg border border-[#c5c5d3]/50 bg-[#f2f4f6] p-4">
                <span className="material-symbols-outlined mt-0.5 text-[#00236f]">info</span>
                <div className="space-y-1">
                  <p className="text-[16px] font-bold leading-6">Next Milestone: Strategy Finalization</p>
                  <p className="text-[16px] leading-6 text-[#444651]">
                    Complete the "Cyber Attack Response Strategy" document by Thursday
                    to move to Implementation phase.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#c5c5d3] bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[20px] font-semibold leading-7">Active Simulations</h3>
                <span className="rounded-full bg-[#006b5f]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#006b5f]">Live</span>
              </div>

              <div className="group relative mb-4 h-32 cursor-pointer overflow-hidden rounded-xl">
                <img
                  alt="Active simulation map"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5hbXEg-hnoaP6TVcYhlqYtGYp9CVPffS8YzkW5o-UKzox5rvNEm4jOazXmOFrJjaNgoSNU-mYQtL2Dtx05EOdz9hKNT7-kcy4gdp3xq7jwKNWaUjR4BXbUkNN_djxAhNuHoy__wG12UUmUTBGPwsTwI5lDmIjh0DW5ea9pLY-ZdN7vGSIaQzKG36ZwdMVoPOSK-INNZ06EcZblMyQCnnaudDyjrbrNzl45iLPFkfYdT0-EfmTIJNDyw"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-4">
                  <span className="text-xs font-bold uppercase text-white/80">In Progress</span>
                  <span className="text-[20px] font-semibold leading-7 text-white">Data Breach 2024</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[14px] font-medium leading-5 text-[#444651]">Current Stage</span>
                  <span className="font-bold text-[#00236f]">Containment (3/5)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#e6e8ea]">
                  <div className="h-full bg-[#00236f]" style={{ width: '60%' }} />
                </div>
                <div className="-space-x-2 flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f7f9fb] bg-[#00236f] text-[10px] text-white">IT</div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f7f9fb] bg-[#006b5f] text-[10px] text-white">HR</div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f7f9fb] bg-[#1b2b3f] text-[10px] text-white">PR</div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f7f9fb] bg-[#e6e8ea] text-[10px] text-[#444651]">+4</div>
                </div>
                <Link className="block w-full rounded-lg bg-[#e6e8ea] py-2.5 text-center font-bold transition-colors hover:bg-[#e0e3e5] active:scale-95" href="/simulation-room">
                  View Details
                </Link>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-xl border border-[#c5c5d3] bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[20px] font-semibold leading-7">Pending Actions</h3>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ba1a1a] text-[10px] font-bold text-white">3</span>
              </div>

              <div className="flex-1 space-y-1">
                {pendingActions.map((action) => (
                  <div key={action.title} className="group flex cursor-pointer items-center gap-4 rounded-lg border border-transparent p-3 transition-all hover:border-[#c5c5d3] hover:bg-[#f2f4f6]">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${toneClass(action.tone)}`}>
                      <span className="material-symbols-outlined">{action.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium leading-5">{action.title}</div>
                      <div className="text-[12px] font-semibold leading-4 text-[#757682]">{action.detail}</div>
                    </div>
                    <span className="material-symbols-outlined text-[#757682] transition-colors group-hover:text-[#00236f]">chevron_right</span>
                  </div>
                ))}
              </div>

              <button className="mt-4 text-center text-[14px] font-medium leading-5 text-[#757682] transition-colors hover:text-[#00236f]" type="button">
                Dismiss All Actions
              </button>
            </div>

            <div className="rounded-xl border border-[#c5c5d3] bg-white p-8 shadow-sm">
              <h3 className="mb-4 text-[20px] font-semibold leading-7">Resilience Score</h3>
              <div className="flex items-center justify-center py-6">
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full -rotate-90 transform">
                    <circle className="text-[#e6e8ea]" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8" />
                    <circle className="text-[#006b5f] transition-all duration-1000" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="91.1" strokeWidth="8" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">75</span>
                    <span className="text-[10px] font-bold uppercase text-[#757682]">Good</span>
                  </div>
                </div>
              </div>
              <p className="mb-4 text-center text-[16px] leading-6 text-[#444651]">
                Your score has improved by 12% since last month&apos;s simulation.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-[#f2f4f6] p-3 text-center">
                  <div className="text-lg font-bold text-[#00236f]">4.2h</div>
                  <div className="text-[10px] uppercase text-[#757682]">Avg. Recovery</div>
                </div>
                <div className="rounded-lg bg-[#f2f4f6] p-3 text-center">
                  <div className="text-lg font-bold text-[#006b5f]">92%</div>
                  <div className="text-[10px] uppercase text-[#757682]">Compliance</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-[#c5c5d3] bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[20px] font-semibold leading-7">Methodology Snippet</h3>
                <span className="material-symbols-outlined text-[#00236f]">menu_book</span>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-[14px] font-bold leading-5">Phase 3: Strategy Design</h4>
                  <p className="line-clamp-3 text-[16px] leading-6 text-[#444651]">
                    The development of strategies to ensure the continuity of critical
                    business functions. This includes technical failovers, alternative
                    workspace arrangements...
                  </p>
                </div>

                <div className="rounded-lg bg-[#dce1ff]/30 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#00236f]">lightbulb</span>
                    <span className="text-[12px] font-bold leading-4 text-[#00236f]">Pro Tip</span>
                  </div>
                  <p className="text-[12px] font-semibold leading-4 text-[#264191]">
                    Ensure all department heads have signed off on the initial impact
                    analysis before defining recovery time objectives.
                  </p>
                </div>
              </div>

              <Link className="mt-4 block rounded-lg border border-[#00236f] py-2 text-center font-bold text-[#00236f] transition-colors hover:bg-[#00236f]/5" href="/dashboard">
                Read Methodology
              </Link>
            </div>
          </div>
        </div>

        <footer className="mt-auto w-full border-t border-[#c5c5d3] bg-[#e0e3e5] px-8 py-8">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-6">
              <span className="text-2xl font-bold text-[#00236f]">Survive</span>
              <p className="text-[12px] font-semibold leading-4 text-[#444651]">© 2024 Survive Business Continuity. All rights reserved.</p>
            </div>

            <div className="flex gap-8">
              {footerLinks.map((item) => (
                <a key={item} className="text-[12px] font-semibold leading-4 text-[#444651] transition-colors hover:text-[#00236f]" href="#">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
