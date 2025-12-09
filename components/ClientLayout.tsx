"use client"
import { useEffect, useState } from "react"
import { authService } from '@/lib/api/services/auth.service'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isGuest, setIsGuest] = useState(true)

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]

    if (token) {
      console.log("[ClientLayout] Token trouvé")
      
      const userFromToken = authService.getUserFromToken()
      if (userFromToken) {
        console.log("[ClientLayout] ✅ Connecté:", userFromToken.role_name)
        setIsGuest(false)
      } else {
        console.log("[ClientLayout] Token invalide")
        setIsGuest(true)
      }
    }
    
    setIsInitialized(true)
  }, [])

  if (!isInitialized) return <div>Chargement...</div>

  return <>{children}</>
}
