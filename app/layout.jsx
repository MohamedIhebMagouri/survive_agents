import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata = {
  title: 'Survive UI Demo',
  description: 'Static UI showcase for Survive, a business continuity and crisis simulation SaaS platform.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="bg-slate-50">{children}</body>
    </html>
  )
}
