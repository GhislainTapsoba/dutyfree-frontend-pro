"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"
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
    <Card className="border-border bg-card">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <button type="button" className="text-sm text-primary hover:underline" onClick={() => {}}>
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary border-border pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
