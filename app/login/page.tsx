"use client"
import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Plane } from "lucide-react"

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // ✅ RENDU IDENTIQUE SERVEUR/CLIENT au 1er passage
  if (!isClient) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-card to-background p-12 flex-col justify-between">
          {/* TOUT ton contenu gauche IDENTIQUE */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Duty Free</span>
          </div>
          {/* ... reste de ton contenu ... */}
        </div>
        <div className="flex-1 flex items-center justify-center p-8 bg-background">
          {/* Ton LoginForm */}
          <LoginForm />
        </div>
      </div>
    )
  }

  // ✅ MÊME JSX après hydration
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-card to-background p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Plane className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">Duty Free</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Bienvenue dans votre
            <br />
            <span className="text-primary">espace de gestion</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Connectez-vous pour accéder au système de gestion Duty Free de l'aéroport international de Ouagadougou.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          © 2024 Duty Free Ouagadougou. Tous droits réservés.
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <LoginForm />
      </div>
    </div>
  )
}
