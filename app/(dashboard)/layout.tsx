"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { authService } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      // Vérifier si l'utilisateur est authentifié
      if (!authService.isAuthenticated()) {
        router.push("/login")
        return
      }

      try {
        // Récupérer les informations de l'utilisateur
        const response = await authService.getCurrentUser()
        if (response.data) {
          setUser(response.data)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
