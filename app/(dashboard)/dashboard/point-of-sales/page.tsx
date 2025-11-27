"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Store, Edit, MapPin } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface PointOfSale {
  id: string
  code: string
  name: string
  location: string | null
  is_active: boolean
  created_at: string
}

export default function PointOfSalesPage() {
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPOS, setEditingPOS] = useState<PointOfSale | null>(null)

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    location: "",
    is_active: true,
  })

  useEffect(() => {
    loadPointsOfSale()
  }, [])

  const loadPointsOfSale = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/point-of-sales")
      const data = await response.json()
      if (data.data) setPointsOfSale(data.data)
    } catch (error) {
      console.error("Erreur lors du chargement des points de vente:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (pos?: PointOfSale) => {
    if (pos) {
      setEditingPOS(pos)
      setFormData({
        code: pos.code,
        name: pos.name,
        location: pos.location || "",
        is_active: pos.is_active,
      })
    } else {
      setEditingPOS(null)
      setFormData({
        code: "",
        name: "",
        location: "",
        is_active: true,
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.name) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const url = editingPOS
        ? `http://localhost:3001/api/point-of-sales/${editingPOS.id}`
        : "http://localhost:3001/api/point-of-sales"

      const response = await fetch(url, {
        method: editingPOS ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingPOS ? "Point de vente modifié" : "Point de vente créé")
        setDialogOpen(false)
        loadPointsOfSale()
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Points de Vente</h1>
          <p className="text-muted-foreground">
            Gérez vos points de vente (Business Units)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau point de vente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingPOS ? "Modifier le point de vente" : "Nouveau point de vente"}
                </DialogTitle>
                <DialogDescription>
                  Configurez les informations du point de vente
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="POS-01"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Boutique Duty Free - Terminal A"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Emplacement</Label>
                  <Textarea
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Aéroport International de Ouagadougou, Terminal A, Zone départ"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Point de vente actif</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">{editingPOS ? "Modifier" : "Créer"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pointsOfSale.map((pos) => (
          <Card key={pos.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <Badge variant={pos.is_active ? "default" : "secondary"}>
                {pos.is_active ? "Actif" : "Inactif"}
              </Badge>
            </div>

            <h3 className="font-semibold text-lg mb-1">{pos.name}</h3>
            <p className="text-sm text-muted-foreground font-mono mb-3">{pos.code}</p>

            {pos.location && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{pos.location}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => handleOpenDialog(pos)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </Card>
        ))}

        {pointsOfSale.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun point de vente enregistré</p>
          </div>
        )}
      </div>
    </div>
  )
}
