"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const navigate = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberLanguage, setRememberLanguage] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    window.setTimeout(() => {
      navigate.push('/dashboard')
    }, 700)
  }

  return (
    <main className="flex min-h-screen bg-[#f7f9fb]">
      <aside className="relative hidden items-center justify-center overflow-hidden bg-[#00236f] p-8 lg:flex lg:w-1/2">
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCCzZWoVKPl6fvIqwmdm_iZjkZqGiVnEGVG5pV4zCoZGfPdVIbSWELgRLP2L3HUSfwEUegGdI6551vRIBEYcdZTBKvmj7OxZXG5JHc_6_FwQyaf4w1QgJp33InZV3s54qGOk7-SwKJ8ZSPzD462fW6JtcFrIO4z_nHGgx_k8pqrSeaGAhGK8qgN5B041XEmzaI3uAweFkjkcd7mWtfE-Ip3I_6wXKJQiGuNkp-7HCiFdmyhz56ydeYmrg')",
          }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-[#00236f]/60 via-transparent to-[#006b5f]/20" />

        <div className="relative z-20 max-w-lg space-y-4 text-white">
          <h1 className="text-[48px] font-bold leading-[56px] tracking-[-0.02em]">
            Continuity in Complexity.
          </h1>
          <p className="text-[18px] leading-7 text-[#dce1ff] opacity-90">
            Survive provides the enterprise-grade stability your organization needs to
            navigate disruptions with clarity and composure.
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 opacity-10">
          <svg fill="none" height="100%" viewBox="0 0 100 100" width="100%">
            <circle cx="100" cy="100" r="100" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
      </aside>

      <main className="relative flex w-full flex-col items-center justify-center bg-[#f7f9fb] px-4 py-8 md:px-8 lg:w-1/2">
        <div className="absolute right-0 top-0 flex items-center gap-2 p-4">
          <button
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[14px] font-medium text-[#444651] transition-colors hover:bg-[#e6e8ea]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">language</span>
            <span>English</span>
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        </div>

        <div className="w-full max-w-[440px] animate-fadeIn">
          <div className="mb-8">
            <span className="text-2xl font-bold tracking-tight text-[#00236f]">Survive</span>
            <p className="mt-2 text-[20px] font-semibold leading-7 text-[#191c1e]">
              Welcome back
            </p>
            <p className="text-[16px] leading-6 text-[#444651]">
              Sign in to your continuity workspace.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="block text-[14px] font-medium leading-5 text-[#444651]"
                htmlFor="workspace"
              >
                Workspace / Tenant (Optional)
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-lg border border-[#c5c5d3] bg-white px-4 py-3 text-[16px] leading-6 text-[#191c1e] shadow-[0_2px_8px_rgba(30,58,138,0.04)] outline-none transition-all placeholder:text-[#757682] focus:border-[#00236f] focus:shadow-[0_0_0_2px_rgba(30,58,138,0.1)]"
                  id="workspace"
                  placeholder="e.g. global-hq"
                  type="text"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-[#c5c5d3]">
                  domain
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="block text-[14px] font-medium leading-5 text-[#444651]"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className="w-full rounded-lg border border-[#c5c5d3] bg-white px-4 py-3 text-[16px] leading-6 text-[#191c1e] shadow-[0_2px_8px_rgba(30,58,138,0.04)] outline-none transition-all placeholder:text-[#757682] focus:border-[#00236f] focus:shadow-[0_0_0_2px_rgba(30,58,138,0.1)]"
                id="email"
                placeholder="name@organization.com"
                required
                type="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className="block text-[14px] font-medium leading-5 text-[#444651]"
                  htmlFor="password"
                >
                  Password
                </label>
                <a className="text-[12px] font-semibold leading-4 text-[#00236f] hover:underline" href="#">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  className="w-full rounded-lg border border-[#c5c5d3] bg-white px-4 py-3 text-[16px] leading-6 text-[#191c1e] shadow-[0_2px_8px_rgba(30,58,138,0.04)] outline-none transition-all placeholder:text-[#757682] focus:border-[#00236f] focus:shadow-[0_0_0_2px_rgba(30,58,138,0.1)]"
                  id="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#757682] transition-colors hover:text-[#444651]"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                checked={rememberLanguage}
                className="h-4 w-4 rounded border-[#c5c5d3] text-[#00236f] focus:ring-[#00236f]"
                id="remember"
                onChange={(event) => setRememberLanguage(event.target.checked)}
                type="checkbox"
              />
              <label
                className="cursor-pointer select-none text-[14px] font-medium leading-5 text-[#444651]"
                htmlFor="remember"
              >
                Remember language preference
              </label>
            </div>

            <button
              className="w-full rounded-lg bg-[#00236f] py-4 text-[14px] font-bold leading-5 text-white shadow-md shadow-[#00236f]/10 transition-all hover:bg-[#162d6b] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-8 flex items-start gap-2 rounded-lg border border-[#c5c5d3]/30 bg-white p-4">
            <span className="material-symbols-outlined text-[20px] text-[#006b5f]">shield</span>
            <p className="text-[12px] font-semibold leading-relaxed text-[#444651]">
              Secure access for consultants and organizations. This session is
              encrypted and monitored for security compliance.
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[14px] font-medium leading-5 text-[#757682]">
              Need access?{' '}
              <a className="font-bold text-[#00236f] hover:underline" href="#">
                Contact your administrator.
              </a>
            </p>
          </div>
        </div>

        <footer className="mt-auto flex w-full max-w-[440px] items-center justify-between pt-8 opacity-60">
          <span className="text-[12px] font-semibold leading-4 text-[#191c1e]">
            v2.4.0-resilient
          </span>
          <div className="flex gap-4">
            <a className="text-[12px] font-semibold leading-4 text-[#191c1e] hover:text-[#00236f]" href="#">
              Status
            </a>
            <a className="text-[12px] font-semibold leading-4 text-[#191c1e] hover:text-[#00236f]" href="#">
              Privacy
            </a>
          </div>
        </footer>
      </main>
    </main>
  )
}
