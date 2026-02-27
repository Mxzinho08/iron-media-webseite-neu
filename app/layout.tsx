import type { Metadata } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'IRON Media — Der Growth Partner für E-Commerce Brands',
  description: '€1B+ Portfolio Revenue. €12M+ Monthly Adspend. 400+ Brands. IRON Media ist der führende eCom Growth Partner im DACH-Raum.',
  openGraph: {
    title: 'IRON Media GmbH',
    description: 'Wir Skalieren deine brand!',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-white text-text-dark antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
