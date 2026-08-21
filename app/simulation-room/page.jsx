"use client"

import Link from 'next/link'
import { useState } from 'react'

const sideNav = [
  { label: 'Dashboard', icon: 'dashboard', active: false, to: '/dashboard' },
  { label: 'Simulations', icon: 'simulation', active: true, to: '/simulation-room' },
  { label: 'Methodology', icon: 'account_tree', active: false, to: '/dashboard' },
  { label: 'Analytics', icon: 'analytics', active: false, to: '/dashboard' },
]

const footerNav = [
  { label: 'Settings', icon: 'settings', to: '/dashboard' },
  { label: 'Support', icon: 'help', to: '/dashboard' },
]

const requiredActions = [
  'Notify Cloud Ops to initiate failover',
  'Draft Client Comms for potential delay',
  'Confirm Site B personnel evacuation',
  'Dispatch mobile battery unit',
]

const activityEntries = [
  { time: '10:52:14', author: 'Tech Lead', text: 'verified UPS levels across Site B blocks 1-4.', highlight: false },
  { time: '10:48:02', author: 'Coordinator', text: 'issued emergency notification to executive board.', highlight: false },
  { time: '10:45:00', author: 'System', text: 'Inject Triggered: Backup generator failure detected.', highlight: true },
  { time: '10:30:11', author: 'Comms', text: 'completed initial stakeholder mapping for outage duration.', highlight: false },
]

const participants = [
  { initials: 'SM', bg: 'bg-[#dce1ff]', text: 'text-[#00164e]', name: 'Sarah Miller', role: 'Coordinator', live: true, icon: 'mic', iconColor: 'text-[#00236f]' },
  { initials: 'DW', bg: 'bg-[#d3e4fe]', text: 'text-[#0b1c30]', name: 'David Wang', role: 'Tech Lead', live: true, icon: 'mic_off', iconColor: 'text-[#757682]' },
  { initials: 'EL', bg: 'bg-[#71f8e4]', text: 'text-[#00201c]', name: 'Elena Luz', role: 'Comms Officer', live: false, icon: 'mic_off', iconColor: 'text-[#757682]' },
]

const timelineSteps = [
  { title: 'Initial Outage', time: '09:00 AM', complete: true, current: false, icon: 'check' },
  { title: 'Staff Alerted', time: '09:15 AM', complete: true, current: false, icon: 'check' },
  { title: 'Generator Fail', time: '10:45 AM', complete: false, current: true, icon: 'bolt' },
  { title: 'Full Recovery', time: 'Pending', complete: false, current: false, icon: 'more_horiz' },
]

function navClass(active) {
  return active ? 'bg-[#6df5e1] text-[#006f64] font-bold' : 'text-[#444651] hover:bg-[#e6e8ea]'
}

export default function SimulationRoomPage() {
  const [checkedActions, setCheckedActions] = useState([false, false, false, false])
  const [logInput, setLogInput] = useState('')

  const toggleAction = (index) => {
    setCheckedActions((current) =>
      current.map((value, currentIndex) => (currentIndex === index ? !value : value)),
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#c5c5d3] bg-[#e6e8ea]">
        <div className="mx-auto flex w-full items-center justify-between px-8 py-2">
          <div className="flex items-center gap-4">
            <span className="text-[20px] font-semibold leading-7 text-[#00236f]">Survive Dashboard</span>
            <div className="mx-2 h-6 w-px bg-[#c5c5d3]" />
            <h1 className="text-[14px] font-medium leading-5 text-[#444651]">Simulation Control Room</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex items-center rounded-lg border border-[#c5c5d3] bg-white px-3 py-1">
              <span className="material-symbols-outlined mr-2 text-sm text-[#757682]">search</span>
              <input className="w-48 border-none bg-transparent text-[14px] outline-none" placeholder="Search events..." type="text" />
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-full p-2 transition-colors hover:bg-[#e0e3e5]" type="button">
                <span className="material-symbols-outlined text-[#444651]">notifications</span>
              </button>
              <button className="rounded-full p-2 transition-colors hover:bg-[#e0e3e5]" type="button">
                <span className="material-symbols-outlined text-[#444651]">translate</span>
              </button>
              <Link className="flex items-center gap-2 border-l border-[#c5c5d3] pl-2" href="/logout">
                <span className="material-symbols-outlined text-[#00236f]">account_circle</span>
                <span className="text-[14px] font-medium leading-5 text-[#191c1e]">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex h-[calc(100vh-56px)] overflow-hidden bg-[#f7f9fb] text-[#191c1e]">
        <aside className="hidden h-full w-64 shrink-0 flex-col gap-4 border-r border-[#c5c5d3] bg-[#f2f4f6] p-4 md:flex">
          <div className="space-y-1">
            {sideNav.map((item) => (
              <Link key={item.label} className={`flex w-full items-center gap-3 rounded-lg p-3 text-[14px] font-medium transition-colors ${navClass(item.active)}`} href={item.to}>
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto space-y-1 border-t border-[#c5c5d3] pt-4">
            {footerNav.map((item) => (
              <Link key={item.label} className="flex w-full items-center gap-3 rounded-lg p-3 text-[14px] font-medium text-[#444651] transition-colors hover:bg-[#e6e8ea]" href={item.to}>
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </aside>

        <div className="custom-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto bg-[#f7f9fb] p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="flex items-center gap-2 rounded-full bg-[#E6F4F1] px-3 py-1 text-[12px] font-bold text-[#006B5F]">
                  <span className="h-2 w-2 rounded-full bg-[#14B8A6] shadow-[0_0_0_0_rgba(20,184,166,0.4)] animate-pulse" />
                  Running
                </span>
                <span className="text-[14px] font-medium leading-5 text-[#444651]">Started: 09:14 AM</span>
              </div>
              <h2 className="text-[32px] font-semibold leading-10 tracking-[-0.01em] text-[#00236f]">
                Simulation Control Room: Regional Power Outage
              </h2>
            </div>

            <div className="flex gap-3">
              <button className="rounded-lg border border-[#00236f] px-6 py-2 text-[14px] font-medium text-[#00236f] transition-colors hover:bg-[#00236f]/5" type="button">
                Pause
              </button>
              <button className="rounded-lg bg-[#ba1a1a] px-6 py-2 text-[14px] font-medium text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-opacity hover:opacity-90" type="button">
                Emergency Stop
              </button>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-12 gap-6">
            <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
              <div className="relative overflow-hidden rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="absolute left-0 top-0 h-full w-1.5 bg-[#00236f]" />
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="mb-1 block text-[12px] uppercase tracking-wider text-[#00236f]">Active Event</span>
                    <h3 className="text-[24px] font-semibold leading-8 text-[#191c1e]">Inject #3: Backup generator failure</h3>
                  </div>
                  <span className="text-[24px] font-bold leading-8 text-[#00236f]">14:22</span>
                </div>
                <p className="mb-6 text-[16px] leading-relaxed text-[#444651]">
                  Facility Manager reports that the diesel generator at Site B failed to
                  engage after the initial grid drop. Maintenance team is on-site but
                  estimating a 2-hour window for manual override. Critical IT systems are
                  now on UPS with 45 minutes of remaining life.
                </p>

                <div className="rounded-lg bg-[#f2f4f6] p-5">
                  <h4 className="mb-3 flex items-center gap-2 text-[14px] font-medium leading-5 text-[#191c1e]">
                    <span className="material-symbols-outlined text-sm text-[#00236f]">assignment</span>
                    Required Actions
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {requiredActions.map((action, index) => (
                      <label key={action} className="flex cursor-pointer items-center rounded-lg border border-[#c5c5d3] bg-white p-3 transition-all hover:border-[#00236f]">
                        <input checked={checkedActions[index]} className="mr-3 h-5 w-5 rounded border-[#757682] text-[#00236f] focus:ring-[#00236f]" onChange={() => toggleAction(index)} type="checkbox" />
                        <span className={`text-[16px] ${checkedActions[index] ? 'line-through opacity-50' : ''}`}>{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-[20px] font-semibold leading-7">Event Sequence</h3>
                  <button className="flex items-center gap-1 text-[14px] font-medium text-[#00236f]" type="button">
                    <span className="material-symbols-outlined text-sm">history</span>
                    View Full Timeline
                  </button>
                </div>

                <div className="relative flex items-start justify-between pt-4">
                  <div className="absolute left-0 top-8 h-0.5 w-full bg-[#c5c5d3]" />
                  {timelineSteps.map((step) => (
                    <div key={step.title} className={`relative z-10 flex w-1/4 flex-col items-center gap-3 ${!step.complete && !step.current ? 'opacity-40' : ''}`}>
                      <div className={`flex items-center justify-center shadow-md ${step.complete ? 'h-8 w-8 rounded-full bg-[#006b5f] text-white' : step.current ? ' -mt-1 h-10 w-10 rounded-full border-4 border-[#f2f4f6] bg-[#00236f] text-white shadow-lg' : 'h-8 w-8 rounded-full border-2 border-[#c5c5d3] bg-[#e0e3e5] text-[#757682]'}`}>
                        <span className={`material-symbols-outlined text-sm ${step.complete ? 'icon-fill' : ''}`}>{step.icon}</span>
                      </div>
                      <div className="text-center">
                        <p className={`text-[14px] ${step.current ? 'font-bold text-[#00236f]' : 'text-[#191c1e]'}`}>{step.title}</p>
                        <p className="text-[12px] text-[#757682]">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex max-h-80 flex-col rounded-xl border border-[#c5c5d3] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between border-b border-[#c5c5d3] p-4">
                  <h3 className="flex items-center gap-2 text-[20px] font-semibold leading-7">
                    <span className="material-symbols-outlined text-[#00236f]">list_alt</span>
                    Activity Log
                  </h3>
                  <div className="flex gap-2">
                    <span className="rounded bg-[#f2f4f6] px-2 py-1 text-[10px] font-bold uppercase text-[#444651]">24 Entries</span>
                    <button className="material-symbols-outlined text-[#757682] transition-colors hover:text-[#00236f]" type="button">
                      download
                    </button>
                  </div>
                </div>

                <div className="custom-scrollbar overflow-y-auto space-y-4 p-4">
                  {activityEntries.map((entry) =>
                    entry.highlight ? (
                      <div key={entry.time} className="ml-2 flex items-start gap-4 border-l-2 border-[#00236f] pb-2 pl-4">
                        <span className="w-16 shrink-0 pt-1 text-[12px] font-bold text-[#00236f]">{entry.time}</span>
                        <div className="flex-1 text-[16px] text-[#191c1e]">
                          <span className="mr-2 rounded bg-[#ffdad6] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#93000a]">System</span>
                          <span className="font-bold underline">{entry.text}</span>
                        </div>
                      </div>
                    ) : (
                      <div key={entry.time} className="flex items-start gap-4">
                        <span className="w-16 shrink-0 pt-1 text-[12px] text-[#757682]">{entry.time}</span>
                        <div className="flex-1 text-[16px] text-[#444651]">
                          <span className="font-bold text-[#191c1e]">{entry.author}</span> {entry.text}
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <div className="border-t border-[#c5c5d3] bg-[#f2f4f6] p-4">
                  <div className="flex gap-3">
                    <input
                      className="flex-1 rounded-lg border border-[#c5c5d3] bg-white px-4 py-2 text-[16px] outline-none focus:border-[#00236f] focus:ring-[#00236f]"
                      onChange={(event) => setLogInput(event.target.value)}
                      placeholder="Add entry to activity log..."
                      type="text"
                      value={logInput}
                    />
                    <button className="rounded-lg bg-[#00236f] px-4 py-2 text-[14px] font-medium text-white" type="button">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 flex flex-col gap-6 lg:col-span-4">
              <div className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <h3 className="mb-6 text-[20px] font-semibold leading-7">Participants</h3>
                <div className="space-y-4">
                  {participants.map((participant) => (
                    <div key={participant.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${participant.bg} ${participant.text}`}>
                          {participant.initials}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium leading-5 text-[#191c1e]">{participant.name}</p>
                          <p className="text-[12px] text-[#757682]">{participant.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`h-2 w-2 rounded-full ${participant.live ? 'bg-[#14B8A6]' : 'bg-[#c5c5d3]'}`} />
                        <span className={`material-symbols-outlined text-lg ${participant.iconColor}`}>{participant.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#c5c5d3] py-3 text-[14px] font-medium text-[#757682] transition-colors hover:bg-[#f2f4f6]" type="button">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Invite Participant
                </button>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-[#00236f] p-6 text-white shadow-lg">
                <div className="absolute -bottom-8 -right-8 opacity-10">
                  <span className="material-symbols-outlined text-[120px]">flag</span>
                </div>
                <h3 className="mb-4 text-[14px] uppercase tracking-widest text-white/80">Next Milestone</h3>
                <p className="mb-2 text-[24px] font-semibold leading-8">UPS Stability Check</p>
                <p className="mb-6 text-[16px] text-white/70">
                  Verify all critical workloads are balanced across available UPS racks
                  before 11:30 AM.
                </p>
                <div className="flex items-center justify-between border-t border-white/20 pt-4">
                  <div>
                    <p className="text-[12px] text-white/60">Time Remaining</p>
                    <p className="text-[20px] font-semibold leading-7">22:04</p>
                  </div>
                  <button className="rounded-lg bg-white px-4 py-2 text-[14px] font-bold text-[#00236f] transition-colors hover:bg-[#f7f9fb]" type="button">
                    Complete
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <h3 className="mb-4 text-[20px] font-semibold leading-7">Operational Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-[#444651]">Communications</span>
                    <span className="font-bold text-[#006b5f]">Stable</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e6e8ea]">
                    <div className="h-full w-full bg-[#006b5f]" />
                  </div>
                  <div className="flex items-center justify-between pt-2 text-[14px]">
                    <span className="text-[#444651]">Sim Engine Latency</span>
                    <span className="font-bold text-[#006b5f]">12ms</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e6e8ea]">
                    <div className="h-full w-1/4 bg-[#006b5f]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#c5c5d3] bg-[#e0e3e5]">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between px-8 py-4 md:flex-row">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-[#00236f]">Survive</span>
            <p className="text-[12px] font-semibold leading-4 text-[#444651]">© 2024 Survive Business Continuity. All rights reserved.</p>
          </div>
          <nav className="mt-4 flex gap-6 md:mt-0">
            <a className="text-[12px] font-semibold leading-4 text-[#444651] transition-colors hover:text-[#00236f]" href="#">Privacy Policy</a>
            <a className="text-[12px] font-semibold leading-4 text-[#444651] transition-colors hover:text-[#00236f]" href="#">Terms of Service</a>
            <a className="text-[12px] font-semibold leading-4 text-[#444651] transition-colors hover:text-[#00236f]" href="#">Security Compliance</a>
            <a className="text-[12px] font-semibold leading-4 text-[#444651] transition-colors hover:text-[#00236f]" href="#">Contact</a>
          </nav>
        </div>
      </footer>
    </>
  )
}
