"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/api/services/auth.service"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { setupTokenExpirationHandler } from "@/lib/api/token-refresh"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Démarrer le gestionnaire d'expiration du token
    setupTokenExpirationHandler()
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    async function checkAuth() {
      if (!authService.isAuthenticated()) {
        router.push('/login')
        return
      }
      
      try {
        const token = authService.debugAuth()
        console.log('[ClientLayout] Debug auth:', token)
        
        const userFromToken = authService.getUserFromToken()
        console.log('[ClientLayout] User from token:', userFromToken)
        
        if (userFromToken) {
          setUser(userFromToken)
          console.log('[ClientLayout] ✅ Connecté:', userFromToken.role_name || 'sans rôle')
        } else {
          console.log('[ClientLayout] Pas d\'utilisateur trouvé, redirection login')
          router.push('/login')
        }
      } catch (error) {
        console.error('[ClientLayout] Erreur:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router, mounted])

  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <span>Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
