"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const navigate = useRouter()

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#f7f9fb] text-[#191c1e]">
      <div className="fixed inset-0 z-0 flex pointer-events-none opacity-40 blur-md grayscale-[0.2]">
        <aside className="flex h-full w-64 flex-col gap-4 border-r border-[#c5c5d3] bg-white p-4">
          <div className="mb-8 text-2xl font-bold text-[#00236f]">Survive</div>
          <div className="flex items-center gap-3 rounded-lg bg-[#6df5e1] p-3 text-[#006f64]">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[14px] font-bold leading-5">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 p-3 text-[#444651]">
            <span className="material-symbols-outlined">simulation</span>
            <span className="text-[14px] font-medium leading-5">Simulations</span>
          </div>
          <div className="flex items-center gap-3 p-3 text-[#444651]">
            <span className="material-symbols-outlined">account_tree</span>
            <span className="text-[14px] font-medium leading-5">Methodology</span>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden p-8">
          <header className="mb-8 flex items-center justify-between">
            <div className="text-[32px] font-semibold leading-10 tracking-[-0.01em]">Global Resilience Metrics</div>
            <div className="h-10 w-10 rounded-full bg-[#c5c5d3]" />
          </header>

          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-64 rounded-xl border border-[#c5c5d3] bg-[#f7f9fb] p-4 shadow-sm">
                <div className="mb-4 h-4 w-1/2 rounded bg-[#c5c5d3]" />
                <div className="h-32 w-full rounded bg-[#e6e8ea]" />
              </div>
            ))}
          </div>

          <div className="mt-8 h-96 rounded-xl border border-[#c5c5d3] bg-[#f7f9fb] p-4 shadow-sm">
            <div className="mb-4 h-4 w-1/4 rounded bg-[#c5c5d3]" />
            <div className="h-full w-full rounded bg-[#e0e3e5]" />
          </div>
        </main>
      </div>

      <div className="glass-blur fixed inset-0 z-50 flex items-center justify-center bg-[#191c1e]/10 p-4">
        <div className="w-full max-w-md animate-fadeIn rounded-xl border border-[#c5c5d3] bg-white p-8 shadow-[0_16px_32px_rgba(0,35,111,0.08)] transition-all duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#dce1ff]">
              <span className="material-symbols-outlined text-[32px] text-[#00236f]">logout</span>
            </div>
            <h1 className="mb-2 text-[24px] font-semibold leading-8 text-[#191c1e]">Confirm logout</h1>
            <p className="max-w-[320px] text-[16px] leading-6 text-[#444651]">
              You are about to leave your Survive workspace. Make sure your current
              actions are saved.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button className="flex h-12 w-full items-center justify-center rounded-lg bg-[#00236f] text-[14px] font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]" onClick={() => navigate.push('/dashboard')} type="button">
              Stay connected
            </button>
            <Link className="flex h-12 w-full items-center justify-center rounded-lg bg-transparent text-[14px] font-medium text-[#00236f] transition-all hover:bg-[#e6e8ea] active:scale-[0.98]" href="/login">
              Logout
            </Link>
          </div>

          <div className="mt-8 flex justify-center border-t border-[#c5c5d3] pt-4">
            <div className="flex items-center gap-2 text-[#444651]/60">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span className="text-[12px] font-semibold leading-4">Session state will be preserved for 30 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
