"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Edit, Trash2, Percent, Tag, MoreHorizontal, Eye, Gift, TrendingUp, Calendar } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  applicable_to: "all" | "category" | "product"
  is_active: boolean
  created_at: string
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(null)

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
    applicable_to: "all" as "all" | "category" | "product",
    is_active: true,
  })

  useEffect(() => {
    loadPromotions()
  }, [])

  const loadPromotions = async () => {
    setLoading(true)
    try {
      const response = await api.get<any[]>("/promotions")
      if (response.data) {
        // Mapper les données de l'API vers le format du frontend
        const mappedPromotions = response.data.map((promo: any) => ({
          id: promo.id,
          code: promo.code,
          name: promo.name,
          description: promo.description,
          type: promo.discount_type === 'fixed' ? 'fixed_amount' : promo.discount_type,
          value: promo.discount_value,
          start_date: promo.start_date,
          end_date: promo.end_date,
          min_purchase_amount: promo.min_purchase_amount,
          max_discount_amount: promo.max_discount_amount,
          applicable_to: promo.applicable_to,
          is_active: promo.is_active,
          created_at: promo.created_at,
        }))
        setPromotions(mappedPromotions)
      }
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
      // Mapper les données du formulaire vers le format attendu par l'API
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        discount_type: formData.type === 'fixed_amount' ? 'fixed' : formData.type,
        discount_value: formData.value,
        min_purchase_amount: formData.min_purchase_amount,
        max_discount_amount: formData.max_discount_amount,
        applicable_to: formData.applicable_to,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
      }

      let response
      if (editingPromotion) {
        response = await api.put<Promotion>(`/promotions/${editingPromotion.id}`, payload)
      } else {
        response = await api.post<Promotion>("/promotions", payload)
      }

      if (response.data) {
        toast.success(editingPromotion ? "Promotion modifiée" : "Promotion créée")
        setDialogOpen(false)
        loadPromotions()
      } else {
        toast.error(response.error || "Erreur")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleView = (promotion: Promotion) => {
    setViewingPromotion(promotion)
    setViewDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) return

    try {
      const response = await api.delete(`/promotions/${id}`)

      if (response.data || !response.error) {
        toast.success("Promotion supprimée")
        loadPromotions()
      } else {
        toast.error(response.error || "Erreur lors de la suppression")
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
    const value = promotion.value || 0
    if (promotion.type === "percentage") {
      return `${value}%`
    }
    return `${value.toLocaleString("fr-FR")} FCFA`
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

  const activePromotions = promotions.filter(p => isPromotionActive(p)).length
  const upcomingPromotions = promotions.filter(p => new Date(p.start_date) > new Date()).length
  const expiredPromotions = promotions.filter(p => new Date(p.end_date) < new Date()).length

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
                        <SelectItem value="category">Catégorie spécifique</SelectItem>
                        <SelectItem value="product">Produit spécifique</SelectItem>
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

      {/* Stats Cards avec Design Moderne */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Tag className="w-6 h-6 text-violet-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                Total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total promotions</p>
              <p className="text-3xl font-bold">{promotions.length}</p>
              <p className="text-xs text-muted-foreground">offres créées</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Gift className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                Actif
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Promotions actives</p>
              <p className="text-3xl font-bold">{activePromotions}</p>
              <p className="text-xs text-muted-foreground">en cours actuellement</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                À venir
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Promotions à venir</p>
              <p className="text-3xl font-bold">{upcomingPromotions}</p>
              <p className="text-xs text-muted-foreground">planifiées</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">
                Expiré
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Promotions expirées</p>
              <p className="text-3xl font-bold">{expiredPromotions}</p>
              <p className="text-xs text-muted-foreground">terminées</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="border-b bg-muted/30 px-6 py-4">
          <h3 className="text-lg font-semibold">Liste des promotions</h3>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos offres et réductions</p>
        </div>
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
                      : promotion.applicable_to === "category"
                        ? "Catégorie"
                        : "Produit"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isPromotionActive(promotion) ? "default" : "secondary"}>
                      {isPromotionActive(promotion) ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => handleView(promotion)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleOpenDialog(promotion)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => handleDelete(promotion.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog de visualisation */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de la promotion</DialogTitle>
            <DialogDescription>
              Informations complètes de la promotion
            </DialogDescription>
          </DialogHeader>

          {viewingPromotion && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Code</Label>
                  <p className="font-mono font-semibold text-lg">{viewingPromotion.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className="mt-1">
                    <Badge variant={isPromotionActive(viewingPromotion) ? "default" : "secondary"}>
                      {isPromotionActive(viewingPromotion) ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Nom */}
              <div>
                <Label className="text-muted-foreground">Nom de la promotion</Label>
                <p className="font-semibold text-lg">{viewingPromotion.name}</p>
              </div>

              {/* Description */}
              {viewingPromotion.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{viewingPromotion.description}</p>
                </div>
              )}

              {/* Type et valeur */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type de réduction</Label>
                  <p className="font-medium flex items-center gap-2">
                    {viewingPromotion.type === "percentage" ? (
                      <Percent className="w-4 h-4" />
                    ) : (
                      <Tag className="w-4 h-4" />
                    )}
                    {getPromotionTypeLabel(viewingPromotion.type)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valeur</Label>
                  <p className="font-bold text-xl">{getPromotionValue(viewingPromotion)}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date de début</Label>
                  <p className="font-medium">
                    {format(new Date(viewingPromotion.start_date), "dd MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date de fin</Label>
                  <p className="font-medium">
                    {format(new Date(viewingPromotion.end_date), "dd MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>

              {/* Conditions */}
              <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <h3 className="font-semibold">Conditions d'application</h3>

                {viewingPromotion.min_purchase_amount && viewingPromotion.min_purchase_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Achat minimum</span>
                    <span className="font-medium">
                      {viewingPromotion.min_purchase_amount.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                )}

                {viewingPromotion.max_discount_amount && viewingPromotion.max_discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Réduction maximale</span>
                    <span className="font-medium">
                      {viewingPromotion.max_discount_amount.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applicable à</span>
                  <span className="font-medium">
                    {viewingPromotion.applicable_to === "all"
                      ? "Tous les produits"
                      : viewingPromotion.applicable_to === "category"
                        ? "Catégorie spécifique"
                        : "Produit spécifique"}
                  </span>
                </div>

                {(!viewingPromotion.min_purchase_amount || viewingPromotion.min_purchase_amount === 0) &&
                 (!viewingPromotion.max_discount_amount || viewingPromotion.max_discount_amount === 0) && (
                  <p className="text-sm text-muted-foreground italic">Aucune condition particulière</p>
                )}
              </div>

              {/* Date de création */}
              <div className="text-sm text-muted-foreground">
                Créée le {format(new Date(viewingPromotion.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
