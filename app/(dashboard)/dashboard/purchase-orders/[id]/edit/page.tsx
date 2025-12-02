"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function EditPurchaseOrderPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    status: "",
    expected_delivery_date: "",
    approach_costs: 0,
    notes: "",
  })

  useEffect(() => {
    loadOrder()
  }, [params.id])

  async function loadOrder() {
    try {
      const response = await fetch(`http://localhost:3001/api/purchase-orders/${params.id}`)
      const data = await response.json()
      if (data.data) {
        setFormData({
          status: data.data.status || "",
          expected_delivery_date: data.data.expected_delivery_date || "",
          approach_costs: data.data.approach_costs || 0,
          notes: data.data.notes || "",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`http://localhost:3001/api/purchase-orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Bon de commande modifié")
        router.push(`/dashboard/purchase-orders/${params.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      toast.error("Erreur lors de la modification")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Modifier le bon de commande</h1>
          <p className="text-muted-foreground">Mettre à jour les informations</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="partial">Partiel</SelectItem>
                  <SelectItem value="received">Reçu</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_delivery_date">Date de livraison prévue</Label>
              <Input
                id="expected_delivery_date"
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approach_costs">Frais d'approche (FCFA)</Label>
              <Input
                id="approach_costs"
                type="number"
                min="0"
                step="0.01"
                value={formData.approach_costs}
                onChange={(e) => setFormData({ ...formData, approach_costs: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
