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

  // ✅ RENDU IDENTIQUE SERVEUR/CLIENT au 1er passage
  if (!isClient) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-12 flex flex-col justify-between w-full">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Plane className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Duty Free</span>
                <p className="text-xs text-white/80">Aéroport de Ouagadougou</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8 max-w-lg">
              <div className="space-y-4">
                <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-sm font-medium text-white">Système de gestion moderne</span>
                </div>
                <h1 className="text-5xl font-bold leading-tight text-white">
                  Gérez votre
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">boutique duty free</span>
                  <br />
                  en toute simplicité
                </h1>
                <p className="text-lg text-white/90 leading-relaxed">
                  Une solution complète pour la gestion des ventes, du stock, de la comptabilité et des rapports.
                </p>
              </div>

              {/* Features */}
              <div className="grid gap-4 pt-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all hover:bg-white/15">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-white">{feature.title}</h3>
                      <p className="text-sm text-white/80">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>© 2024 Duty Free Ouagadougou</span>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Sécurisé et fiable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Plane className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold">Duty Free</span>
                <p className="text-xs text-muted-foreground">Ouagadougou</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold">Connexion</h2>
                <p className="text-muted-foreground">
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
              <div className="text-center text-sm text-muted-foreground">
                <p>Besoin d'aide ?{" "}
                  <button className="text-primary hover:underline font-medium">
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

  // ✅ MÊME JSX après hydration
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-12 flex flex-col justify-between w-full">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Plane className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Duty Free</span>
              <p className="text-xs text-white/80">Aéroport de Ouagadougou</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="text-sm font-medium text-white">Système de gestion moderne</span>
              </div>
              <h1 className="text-5xl font-bold leading-tight text-white">
                Gérez votre
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">boutique duty free</span>
                <br />
                en toute simplicité
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                Une solution complète pour la gestion des ventes, du stock, de la comptabilité et des rapports.
              </p>
            </div>

            {/* Features */}
            <div className="grid gap-4 pt-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all hover:bg-white/15">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white">{feature.title}</h3>
                    <p className="text-sm text-white/80">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>© 2024 Duty Free Ouagadougou</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Sécurisé et fiable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold">Duty Free</span>
              <p className="text-xs text-muted-foreground">Ouagadougou</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-bold">Connexion</h2>
              <p className="text-muted-foreground">
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
            <div className="text-center text-sm text-muted-foreground">
              <p>Besoin d'aide ?{" "}
                <button className="text-primary hover:underline font-medium">
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
