"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, AlertCircle, Mail, Lock } from "lucide-react"
import { authService } from "@/lib/api"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("Tentative de connexion avec:", email)
      const response = await authService.login({ email, password })

      console.log("Réponse complète:", response)
      console.log("Response.data:", response.data)
      console.log("Response.error:", response.error)

      if (response.error) {
        console.error("Erreur de connexion:", response.error)
        setError(response.error)
        return
      }

      if (response.data) {
        console.log("Connexion réussie! Redirection vers /dashboard")
        console.log("Token stocké:", response.data.token?.substring(0, 20) + "...")

        // Forcer le rechargement complet de la page
        window.location.href = "/dashboard"
      } else {
        console.error("Pas de données dans la réponse")
        setError("Erreur de connexion")
      }
    } catch (err) {
      console.error("Exception lors de la connexion:", err)
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card shadow-lg">
      <CardContent className="pt-5 pb-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Adresse email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="exemple@dutyfree.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-10 bg-background border-border/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Mot de passe
              </Label>
              <button
                type="button"
                className="text-xs text-primary hover:underline font-medium transition-colors"
                onClick={() => {}}
              >
                Oublié ?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 pr-10 h-10 bg-background border-border/50 focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 font-medium shadow-md hover:shadow-lg transition-all mt-5"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>

          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground/70">
              Environnement de test sécurisé
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
