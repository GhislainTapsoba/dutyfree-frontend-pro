"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldAlert, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UnauthorizedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/dashboard")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-destructive/10">
              <ShieldAlert className="w-12 h-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Accès refusé</CardTitle>
          <CardDescription className="text-base">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Votre rôle actuel ne vous permet pas d'accéder à cette ressource.
              Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur.
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
              Redirection automatique vers le tableau de bord dans <strong>{countdown}s</strong>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Tableau de bord
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Besoin d'aide ? Contactez votre administrateur système
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
