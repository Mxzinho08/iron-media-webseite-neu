import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Great_Vibes } from 'next/font/google'
import './globals.css'

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
  weight: '400',
})

export const metadata: Metadata = {
  title: 'IRON Media — Der Growth Partner für E-Commerce Brands',
  description: '€1B+ Portfolio Revenue. €12M+ Monthly Adspend. 150+ Brands skaliert. IRON Media ist der führende eCom Growth Partner im DACH-Raum.',
  openGraph: {
    title: 'IRON Media GmbH',
    description: 'E-Commerce Brands wachsen mit uns unaufhaltbar.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${GeistSans.variable} ${GeistMono.variable} ${greatVibes.variable}`}>
      <body className="bg-white text-text-dark antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
