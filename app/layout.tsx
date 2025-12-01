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
    icon: '/favicon.svg',
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
