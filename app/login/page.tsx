"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { Plane, ShoppingBag, Shield, TrendingUp, Users, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false)
  const searchParams = useSearchParams()
  const expired = searchParams?.get('expired')

  useEffect(() => {
    setIsClient(true)
  }, [])

  const features = [
    {
      icon: ShoppingBag,
      title: "Gestion des ventes",
      description: "Point de vente intuitif et rapide"
    },
    {
      icon: Users,
      title: "Multi-utilisateurs",
      description: "Gestion des rôles et permissions"
    },
    {
      icon: TrendingUp,
      title: "Rapports en temps réel",
      description: "Tableaux de bord et statistiques"
    }
  ]

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      </div>
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10">
        {/* Animated Orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        </div>

        {/* Content */}
        <div className="relative z-10 p-12 flex flex-col justify-between w-full backdrop-blur-sm">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20 group-hover:scale-110 transition-transform duration-300">
              <Plane className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div>
              <span className="text-3xl font-bold text-white drop-shadow-lg">Duty Free</span>
              <p className="text-sm text-white/90 font-medium">Aéroport de Ouagadougou</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-semibold text-white">Système de gestion moderne</span>
              </div>
              <h1 className="text-6xl font-black leading-tight">
                <span className="text-white drop-shadow-2xl">Gérez votre</span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 drop-shadow-lg">boutique duty free</span>
                <br />
                <span className="text-white drop-shadow-2xl">en toute simplicité</span>
              </h1>
              <p className="text-xl text-white/95 leading-relaxed font-light max-w-xl">
                Une solution complète et intuitive pour la gestion des ventes, du stock, de la comptabilité et des rapports en temps réel.
              </p>
            </div>

            {/* Features */}
            <div className="grid gap-4 pt-8">
              {features.map((feature, index) => (
                <div key={index} className="group flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 hover:scale-105 hover:shadow-2xl">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="w-6 h-6 text-white drop-shadow" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-white text-lg">{feature.title}</h3>
                    <p className="text-sm text-white/90 font-light">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-white/80 font-medium">
            <span>© 2025 Duty Free Ouagadougou</span>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Sécurisé et fiable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
        
        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl">
              <Plane className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Duty Free</span>
              <p className="text-xs text-muted-foreground font-medium">Ouagadougou</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3 text-center lg:text-left">
              <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Connexion</h2>
              <p className="text-muted-foreground text-lg font-light">
                Entrez vos identifiants pour accéder à votre espace
              </p>
            </div>

            {expired === 'true' && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Votre session a expiré. Veuillez vous reconnecter.
                </AlertDescription>
              </Alert>
            )}

            <LoginForm />

            {/* Help Text */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Besoin d'aide ?{" "}
                <button className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold transition-all">
                  Contactez le support
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
