// layout.tsx (Server Component)
import type { Metadata } from 'next'
import './globals.css'
import { Geist, Geist_Mono } from 'next/font/google'
import ClientLayout from '../components/ClientLayout' // composant client

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Duty Free Manager',
  description: 'Système de gestion Duty Free - Aéroport International de Ouagadougou',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
