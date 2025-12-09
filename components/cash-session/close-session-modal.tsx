"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CloseSessionModalProps {
  open: boolean
  onClose: () => void
  session: any
  onSuccess: () => void
}

export function CloseSessionModal({ open, onClose, session, onSuccess }: CloseSessionModalProps) {
  const [loading, setLoading] = useState(false)
  const [countedCash, setCountedCash] = useState("")
  const [countedCard, setCountedCard] = useState("")
  const [countedMobile, setCountedMobile] = useState("")
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (open && session) {
      loadStats()
    }
  }, [open, session])

  const loadStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const res = await fetch(`${apiUrl}/cash-sessions/${session.id}`)
      const { data } = await res.json()
      setStats(data.stats)
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const expectedCash = stats?.expected_cash || 0
  const cashVariance = countedCash ? parseFloat(countedCash) - expectedCash : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!countedCash) {
      toast.error("Le comptage des espèces est obligatoire")
      return
    }

    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const userRes = await fetch(`${apiUrl}/users/me`, { credentials: "include" })
      const { data: user } = await userRes.json()

      const res = await fetch(`${apiUrl}/cash-sessions/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "closed",
          closing_counted_cash: parseFloat(countedCash),
          closing_counted_card: countedCard ? parseFloat(countedCard) : 0,
          closing_counted_mobile: countedMobile ? parseFloat(countedMobile) : 0,
          user_id: user?.id
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur lors de la fermeture")
      }

      toast.success("Session fermée avec succès")
      onSuccess()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fermer la Session de Caisse</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {stats && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">Résumé de la Session</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nombre de tickets</p>
                  <p className="text-lg font-semibold">{stats.ticket_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total des ventes</p>
                  <p className="text-lg font-semibold">{stats.total_sales?.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Espèces attendues</p>
                  <p className="text-lg font-semibold">{expectedCash.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ticket moyen</p>
                  <p className="text-lg font-semibold">{stats.average_ticket?.toLocaleString()} FCFA</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">Comptage de Caisse</h3>
            
            <div>
              <Label>Espèces Comptées (FCFA) *</Label>
              <Input
                type="number"
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
                placeholder="0"
                min="0"
                step="100"
                required
                className="text-lg"
              />
              {countedCash && (
                <p className={`text-sm mt-1 ${cashVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Écart: {cashVariance >= 0 ? '+' : ''}{cashVariance.toLocaleString()} FCFA
                </p>
              )}
            </div>

            <div>
              <Label>Carte Comptée (FCFA)</Label>
              <Input
                type="number"
                value={countedCard}
                onChange={(e) => setCountedCard(e.target.value)}
                placeholder="0"
                min="0"
                step="100"
              />
            </div>

            <div>
              <Label>Mobile Money Compté (FCFA)</Label>
              <Input
                type="number"
                value={countedMobile}
                onChange={(e) => setCountedMobile(e.target.value)}
                placeholder="0"
                min="0"
                step="100"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} variant="destructive" className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fermer la Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
