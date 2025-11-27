"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Edit, Trash2, Percent, Tag } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Promotion {
  id: string
  code: string
  name: string
  description: string | null
  type: "percentage" | "fixed_amount" | "buy_x_get_y"
  value: number
  start_date: string
  end_date: string
  min_purchase_amount: number | null
  max_discount_amount: number | null
  applicable_to: "all" | "categories" | "products"
  is_active: boolean
  created_at: string
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed_amount" | "buy_x_get_y",
    value: 0,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    min_purchase_amount: 0,
    max_discount_amount: 0,
    applicable_to: "all" as "all" | "categories" | "products",
    is_active: true,
  })

  useEffect(() => {
    loadPromotions()
  }, [])

  const loadPromotions = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/promotions")
      const data = await response.json()
      if (data.data) setPromotions(data.data)
    } catch (error) {
      console.error("Erreur lors du chargement des promotions:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion)
      setFormData({
        code: promotion.code,
        name: promotion.name,
        description: promotion.description || "",
        type: promotion.type,
        value: promotion.value,
        start_date: promotion.start_date.split("T")[0],
        end_date: promotion.end_date.split("T")[0],
        min_purchase_amount: promotion.min_purchase_amount || 0,
        max_discount_amount: promotion.max_discount_amount || 0,
        applicable_to: promotion.applicable_to,
        is_active: promotion.is_active,
      })
    } else {
      setEditingPromotion(null)
      setFormData({
        code: "",
        name: "",
        description: "",
        type: "percentage",
        value: 0,
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        min_purchase_amount: 0,
        max_discount_amount: 0,
        applicable_to: "all",
        is_active: true,
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.name || !formData.end_date) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const url = editingPromotion
        ? `http://localhost:3001/api/promotions/${editingPromotion.id}`
        : "http://localhost:3001/api/promotions"

      const response = await fetch(url, {
        method: editingPromotion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingPromotion ? "Promotion modifiée" : "Promotion créée")
        setDialogOpen(false)
        loadPromotions()
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) return

    try {
      const response = await fetch(`http://localhost:3001/api/promotions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Promotion supprimée")
        loadPromotions()
      } else {
        toast.error("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression")
    }
  }

  const getPromotionTypeLabel = (type: string) => {
    const types = {
      percentage: "Pourcentage",
      fixed_amount: "Montant fixe",
      buy_x_get_y: "Achetez X obtenez Y",
    }
    return types[type as keyof typeof types] || type
  }

  const getPromotionValue = (promotion: Promotion) => {
    if (promotion.type === "percentage") {
      return `${promotion.value}%`
    }
    return `${promotion.value.toLocaleString("fr-FR")} FCFA`
  }

  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date()
    const start = new Date(promotion.start_date)
    const end = new Date(promotion.end_date)
    return promotion.is_active && now >= start && now <= end
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
          <h1 className="text-2xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">
            Gérez vos promotions et offres spéciales
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingPromotion ? "Modifier la promotion" : "Nouvelle promotion"}
                </DialogTitle>
                <DialogDescription>
                  Configurez les paramètres de la promotion
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="PROMO2025"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type de promotion *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Pourcentage</SelectItem>
                        <SelectItem value="fixed_amount">Montant fixe</SelectItem>
                        <SelectItem value="buy_x_get_y">Achetez X obtenez Y</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Promotion de fin d'année"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la promotion..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="value">
                      Valeur * {formData.type === "percentage" ? "(%)" : "(FCFA)"}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="applicable_to">Applicable à</Label>
                    <Select
                      value={formData.applicable_to}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, applicable_to: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les produits</SelectItem>
                        <SelectItem value="categories">Catégories spécifiques</SelectItem>
                        <SelectItem value="products">Produits spécifiques</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Date de début *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">Date de fin *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_purchase">Montant minimum d'achat (FCFA)</Label>
                    <Input
                      id="min_purchase"
                      type="number"
                      min="0"
                      value={formData.min_purchase_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_purchase_amount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_discount">Remise maximale (FCFA)</Label>
                    <Input
                      id="max_discount"
                      type="number"
                      min="0"
                      value={formData.max_discount_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_discount_amount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Promotion active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingPromotion ? "Modifier" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Applicable à</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune promotion trouvée</p>
                </TableCell>
              </TableRow>
            ) : (
              promotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell className="font-mono font-semibold">{promotion.code}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{promotion.name}</div>
                      {promotion.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {promotion.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getPromotionTypeLabel(promotion.type)}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    <div className="flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      {getPromotionValue(promotion)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      {format(new Date(promotion.start_date), "dd MMM yyyy", { locale: fr })}
                    </div>
                    <div className="text-muted-foreground">
                      {format(new Date(promotion.end_date), "dd MMM yyyy", { locale: fr })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {promotion.applicable_to === "all"
                      ? "Tous"
                      : promotion.applicable_to === "categories"
                        ? "Catégories"
                        : "Produits"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isPromotionActive(promotion) ? "default" : "secondary"}>
                      {isPromotionActive(promotion) ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(promotion)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(promotion.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
