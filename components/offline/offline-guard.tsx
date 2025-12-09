"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { offlineManager } from "@/lib/offline/offline-manager"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function OfflineGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOnline, setIsOnline] = useState(true)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const checkStatus = () => {
      const status = offlineManager.getStatus()
      setIsOnline(status.isOnline)
      
      // Si hors ligne et pas sur la page POS, bloquer
      if (!status.isOnline && !pathname.includes('/pos')) {
        setShowWarning(true)
      } else {
        setShowWarning(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 2000)
    return () => clearInterval(interval)
  }, [pathname])

  if (showWarning) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border-2 border-destructive rounded-xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-destructive animate-pulse" />
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-destructive">Mode Hors Ligne</h2>
            <p className="text-muted-foreground">
              Vous êtes actuellement hors ligne. Seule la page <span className="font-bold text-primary">Point de Vente (POS)</span> est accessible pour enregistrer des ventes.
            </p>
            <p className="text-sm text-muted-foreground">
              Les ventes seront synchronisées automatiquement dès le retour de la connexion.
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/dashboard/pos')} 
              className="w-full h-12 text-lg"
              size="lg"
            >
              Retour au Point de Vente
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Ventes en attente : {offlineManager.getStatus().queueLength}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
