"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api/client"
import { toast } from "sonner"
import { Plus, Minus, Settings, Loader2, CreditCard } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LoyaltyCard {
  id: string
  card_number: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  tier: "bronze" | "silver" | "gold" | "platinum" | "standard"
  points_balance: number
  total_points_earned: number
  total_amount_spent: number
  is_active: boolean
}

interface PointsManagementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: LoyaltyCard | null
  onSuccess: () => void
}

export function PointsManagement({ open, onOpenChange, card, onSuccess }: PointsManagementProps) {
  const [activeTab, setActiveTab] = useState<"add" | "deduct" | "adjust">("add")
  const [loading, setLoading] = useState(false)

  const [addForm, setAddForm] = useState({
    points: "",
    reason: "",
  })

  const [deductForm, setDeductForm] = useState({
    points: "",
    reason: "",
  })

  const [adjustForm, setAdjustForm] = useState({
    new_balance: "",
    reason: "",
  })

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!card || !addForm.points) {
      toast.error("Veuillez entrer le nombre de points")
      return
    }

    const points = parseInt(addForm.points)
    if (isNaN(points) || points <= 0) {
      toast.error("Veuillez entrer un nombre valide de points")
      return
    }

    setLoading(true)
    try {
      const response = await api.post(`/loyalty/cards/${card.id}/points`, {
        points,
        reason: addForm.reason || "Ajout de points",
        type: "credit"
      })

      if (response.data) {
        toast.success(`${points} points ajoutés avec succès`)
        setAddForm({ points: "", reason: "" })
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(response.error || "Erreur lors de l'ajout des points")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'ajout des points")
    } finally {
      setLoading(false)
    }
  }

  const handleDeductPoints = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!card || !deductForm.points) {
      toast.error("Veuillez entrer le nombre de points")
      return
    }

    const points = parseInt(deductForm.points)
    if (isNaN(points) || points <= 0) {
      toast.error("Veuillez entrer un nombre valide de points")
      return
    }

    if (points > card.points_balance) {
      toast.error("Solde de points insuffisant")
      return
    }

    setLoading(true)
    try {
      const response = await api.post(`/loyalty/cards/${card.id}/points`, {
        points: -points,
        reason: deductForm.reason || "Déduction de points",
        type: "debit"
      })

      if (response.data) {
        toast.success(`${points} points déduits avec succès`)
        setDeductForm({ points: "", reason: "" })
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(response.error || "Erreur lors de la déduction des points")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la déduction des points")
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!card || !adjustForm.new_balance) {
      toast.error("Veuillez entrer le nouveau solde")
      return
    }

    const newBalance = parseInt(adjustForm.new_balance)
    if (isNaN(newBalance) || newBalance < 0) {
      toast.error("Veuillez entrer un solde valide")
      return
    }

    const difference = newBalance - card.points_balance

    setLoading(true)
    try {
      const response = await api.post(`/loyalty/cards/${card.id}/points`, {
        points: difference,
        reason: adjustForm.reason || "Ajustement du solde",
        type: "adjustment"
      })

      if (response.data) {
        toast.success(`Solde ajusté à ${newBalance} points`)
        setAdjustForm({ new_balance: "", reason: "" })
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(response.error || "Erreur lors de l'ajustement du solde")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'ajustement du solde")
    } finally {
      setLoading(false)
    }
  }

  if (!card) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestion des Points - {card.card_number}</DialogTitle>
          <DialogDescription>{card.customer_name} - {card.customer_phone}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg -mt-2 mb-4">
          <span className="text-sm font-medium">Solde actuel</span>
          <span className="text-2xl font-bold text-primary">
            {card.points_balance.toLocaleString()} points
          </span>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </TabsTrigger>
            <TabsTrigger value="deduct">
              <Minus className="w-4 h-4 mr-2" />
              Déduire
            </TabsTrigger>
            <TabsTrigger value="adjust">
              <Settings className="w-4 h-4 mr-2" />
              Ajuster
            </TabsTrigger>
          </TabsList>

          {/* Onglet Ajouter */}
          <TabsContent value="add">
            <form onSubmit={handleAddPoints} className="space-y-4">
              <div>
                <Label htmlFor="add-points">Nombre de points à ajouter *</Label>
                <Input
                  id="add-points"
                  type="number"
                  min="1"
                  value={addForm.points}
                  onChange={(e) => setAddForm({ ...addForm, points: e.target.value })}
                  placeholder="100"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nouveau solde: {(card.points_balance + (parseInt(addForm.points) || 0)).toLocaleString()} points
                </p>
              </div>

              <div>
                <Label htmlFor="add-reason">Raison (optionnel)</Label>
                <Textarea
                  id="add-reason"
                  value={addForm.reason}
                  onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
                  placeholder="Ex: Promotion spéciale, compensation, etc."
                  rows={3}
                  disabled={loading}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter les points
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Onglet Déduire */}
          <TabsContent value="deduct">
            <form onSubmit={handleDeductPoints} className="space-y-4">
              <div>
                <Label htmlFor="deduct-points">Nombre de points à déduire *</Label>
                <Input
                  id="deduct-points"
                  type="number"
                  min="1"
                  max={card.points_balance}
                  value={deductForm.points}
                  onChange={(e) => setDeductForm({ ...deductForm, points: e.target.value })}
                  placeholder="50"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nouveau solde: {Math.max(0, card.points_balance - (parseInt(deductForm.points) || 0)).toLocaleString()} points
                </p>
              </div>

              <div>
                <Label htmlFor="deduct-reason">Raison (optionnel)</Label>
                <Textarea
                  id="deduct-reason"
                  value={deductForm.reason}
                  onChange={(e) => setDeductForm({ ...deductForm, reason: e.target.value })}
                  placeholder="Ex: Utilisation pour achat, correction d'erreur, etc."
                  rows={3}
                  disabled={loading}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Annuler
                </Button>
                <Button type="submit" variant="destructive" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Minus className="w-4 h-4 mr-2" />
                      Déduire les points
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Onglet Ajuster */}
          <TabsContent value="adjust">
            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  <strong>Attention:</strong> Cette action permet de définir un nouveau solde de points,
                  quel que soit le solde actuel. À utiliser avec précaution.
                </p>
              </div>

              <div>
                <Label htmlFor="adjust-balance">Nouveau solde de points *</Label>
                <Input
                  id="adjust-balance"
                  type="number"
                  min="0"
                  value={adjustForm.new_balance}
                  onChange={(e) => setAdjustForm({ ...adjustForm, new_balance: e.target.value })}
                  placeholder={card.points_balance.toString()}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Solde actuel: {card.points_balance.toLocaleString()} points
                  {adjustForm.new_balance && (
                    <span className="ml-2">
                      → Différence: {(parseInt(adjustForm.new_balance) - card.points_balance > 0 ? "+" : "")}
                      {(parseInt(adjustForm.new_balance) - card.points_balance).toLocaleString()} points
                    </span>
                  )}
                </p>
              </div>

              <div>
                <Label htmlFor="adjust-reason">Raison de l'ajustement *</Label>
                <Textarea
                  id="adjust-reason"
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  placeholder="Ex: Correction suite à une erreur système, migration de données, etc."
                  rows={3}
                  required
                  disabled={loading}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Annuler
                </Button>
                <Button type="submit" variant="secondary" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Ajuster le solde
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
