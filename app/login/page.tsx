import { LoginForm } from "@/components/auth/login-form"
import { Plane } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-card to-background p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Plane className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">Duty Free</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-balance leading-tight">
            Système de gestion
            <br />
            <span className="text-primary">Duty Free</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Aéroport International de Ouagadougou - Gestion des ventes, stocks et reporting en temps réel.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="text-2xl font-bold text-primary">Multi-devises</p>
              <p className="text-sm text-muted-foreground">XOF, EUR, USD</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="text-2xl font-bold text-primary">Multi-caisses</p>
              <p className="text-sm text-muted-foreground">Points de vente</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">© 2025 Duty Free Manager. Tous droits réservés.</p>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Duty Free</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold">Connexion</h2>
            <p className="text-muted-foreground mt-2">Entrez vos identifiants pour accéder au système</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
