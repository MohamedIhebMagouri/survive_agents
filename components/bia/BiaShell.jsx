"use client"

import Link from 'next/link'

const mainNav = [
  { label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
  { label: 'Simulations', icon: 'simulation', to: '/simulation-room' },
  { label: 'Methodology', icon: 'account_tree', to: '/dashboard' },
  { label: 'Analytics', icon: 'analytics', to: '/dashboard' },
  { label: 'BIA', icon: 'fact_check', to: '/bia' },
]

const footerNav = [
  { label: 'Settings', icon: 'settings', to: '/dashboard' },
  { label: 'Support', icon: 'help', to: '/dashboard' },
]

export const biaSubNav = [
  { key: 'dashboard', label: 'Tableau de bord', icon: 'space_dashboard', to: '/bia' },
  { key: 'factories', label: 'Usines', icon: 'factory', to: '/bia/factories' },
  { key: 'processes', label: 'Processus', icon: 'account_tree', to: '/bia/processes' },
  { key: 'new', label: 'Nouveau BIA', icon: 'add_circle', to: '/bia/new' },
  { key: 'gap', label: 'Gap Analysis', icon: 'compare_arrows', to: '/bia/gap-analysis' },
  { key: 'strategies', label: 'Stratégies', icon: 'shield', to: '/bia/strategies' },
]

function navClass(active) {
  return active ? 'bg-[#6df5e1] text-[#006f64] font-bold' : 'text-[#444651] hover:bg-[#e6e8ea]'
}

function subNavClass(active) {
  return active
    ? 'border-[#00236f] text-[#00236f] font-bold'
    : 'border-transparent text-[#757682] hover:text-[#00236f]'
}

export default function BiaShell({ active = 'dashboard', title, subtitle, actions, children }) {
  return (
    <div className="flex min-h-screen overflow-hidden bg-[#f8fafc] text-[#191c1e]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden h-full w-64 flex-col gap-4 border-r border-[#c5c5d3] bg-white p-4 md:flex">
        <div className="px-2 py-4">
          <div className="text-2xl font-bold tracking-tight text-[#00236f]">Survive</div>
          <div className="mt-8 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#c5c5d3] bg-[#1e3a8a] text-[12px] font-bold text-white">
              GW
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-medium leading-5">Global Workspace</span>
              <span className="text-[12px] font-semibold leading-4 text-[#757682]">Enterprise Admin</span>
            </div>
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-1">
          {mainNav.map((item) => (
            <Link
              key={item.label}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${navClass(item.label === 'BIA')}`}
              href={item.to}
            >
              <span className={`material-symbols-outlined ${item.label === 'BIA' ? 'icon-fill' : ''}`}>{item.icon}</span>
              <span className="text-[14px] font-medium leading-5">{item.label}</span>
            </Link>
          ))}
        </nav>

        <Link
          className="flex items-center justify-center gap-2 rounded-xl bg-[#00236f] px-4 py-3 font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
          href="/bia/new"
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span className="text-[14px] leading-5">Nouveau BIA</span>
        </Link>

        <div className="mt-auto space-y-1 border-t border-[#c5c5d3] pt-4">
          {footerNav.map((item) => (
            <Link
              key={item.label}
              className="group flex items-center gap-3 rounded-lg px-4 py-3 text-[#444651] transition-colors hover:bg-[#e6e8ea]"
              href={item.to}
            >
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
              <input
                className="w-64 rounded-full border-none bg-[#e6e8ea] py-2 pl-10 pr-4 text-sm outline-none ring-0 transition-all focus:ring-2 focus:ring-[#00236f]"
                placeholder="Rechercher un processus, une usine..."
                type="text"
              />
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

        <div className="border-b border-[#c5c5d3] bg-white px-8">
          <nav className="mx-auto flex max-w-[1280px] gap-6 overflow-x-auto">
            {biaSubNav.map((item) => (
              <Link
                key={item.key}
                href={item.to}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-[14px] transition-colors ${subNavClass(active === item.key)}`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mx-auto w-full max-w-[1280px] flex-1 space-y-8 p-8">
          {(title || actions) && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                {title && <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.01em] text-[#191c1e]">{title}</h1>}
                {subtitle && <p className="mt-1 text-[14px] leading-5 text-[#757682]">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
            </div>
          )}
          {children}
        </div>

        <footer className="mt-auto w-full border-t border-[#c5c5d3] bg-[#e0e3e5] px-8 py-8">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-6">
              <span className="text-2xl font-bold text-[#00236f]">Survive</span>
              <p className="text-[12px] font-semibold leading-4 text-[#444651]">© 2026 Survive Business Continuity. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export function badgeToneForCriticality(level) {
  switch (level) {
    case 'Critique':
      return 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
    case 'Majeur':
      return 'bg-[#9a5a00]/10 text-[#9a5a00]'
    case 'Modéré':
      return 'bg-[#00236f]/10 text-[#00236f]'
    default:
      return 'bg-[#006b5f]/10 text-[#006b5f]'
  }
}

export function badgeToneForStatus(status) {
  switch (status) {
    case 'Validé':
    case 'Actif':
    case 'En place':
      return 'bg-[#006b5f]/10 text-[#006b5f]'
    case 'En cours':
    case 'En test':
      return 'bg-[#00236f]/10 text-[#00236f]'
    case 'Brouillon':
    case 'Planifié':
      return 'bg-[#757682]/10 text-[#757682]'
    default:
      return 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
  }
}
