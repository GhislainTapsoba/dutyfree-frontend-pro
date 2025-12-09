"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, UtensilsCrossed, Trash2, Package, Eye, Edit, MoreVertical, DollarSign, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api/client"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Menu {
  id: string
  name: string
  description: string | null
  menu_type: string | null
  price_xof: number
  price_eur: number | null
  price_usd: number | null
  is_active: boolean
  available_from: string | null
  available_until: string | null
  created_at: string
  menu_items?: Array<{
    id: string
    quantity: number
    is_optional: boolean
    products: {
      id: string
      name_fr: string
      selling_price_xof: number
    }
  }>
}

interface Product {
  id: string
  name_fr: string
  selling_price_xof?: number
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [viewingMenu, setViewingMenu] = useState<Menu | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    menu_type: "breakfast",
    price_xof: 0,
    price_eur: 0,
    price_usd: 0,
    is_active: true,
    available_from: "",
    available_until: "",
  })

  const [selectedProducts, setSelectedProducts] = useState<Array<{
    product_id: string
    quantity: number
    is_optional: boolean
  }>>([])

  useEffect(() => {
    loadMenus()
    loadProducts()
  }, [])

  const loadMenus = async () => {
    setLoading(true)
    try {
      const response = await api.get<{ data: Menu[] }>("/menus")
      setMenus(response.data || [])
    } catch (error: any) {
      toast.error("Erreur lors du chargement des menus")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await api.get<{ data: Product[] }>("/products")
      setProducts(response.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error)
    }
  }

  const handleOpenDialog = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu)
      setFormData({
        name: menu.name,
        description: menu.description || "",
        menu_type: menu.menu_type || "breakfast",
        price_xof: menu.price_xof,
        price_eur: menu.price_eur || 0,
        price_usd: menu.price_usd || 0,
        is_active: menu.is_active,
        available_from: menu.available_from || "",
        available_until: menu.available_until || "",
      })
      // Charger les produits du menu
      if (menu.menu_items) {
        setSelectedProducts(
          menu.menu_items.map((item) => ({
            product_id: item.products.id,
            quantity: item.quantity,
            is_optional: item.is_optional,
          }))
        )
      }
    } else {
      setEditingMenu(null)
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleView = async (menu: Menu) => {
    try {
      const response = await api.get<{ data: Menu }>(`/menus/${menu.id}`)
      setViewingMenu(response.data)
      setViewDialogOpen(true)
    } catch (error) {
      toast.error("Erreur lors du chargement des détails")
      console.error(error)
    }
  }

  const handleDelete = async (menu: Menu) => {
    if (!confirm(`Êtes-vous sûr de vouloir désactiver le menu "${menu.name}" ?`)) {
      return
    }

    try {
      await api.delete(`/menus/${menu.id}`)
      toast.success("Menu désactivé avec succès")
      loadMenus()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de la suppression")
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = {
        ...formData,
        items: selectedProducts,
      }

      if (editingMenu) {
        await api.put(`/menus/${editingMenu.id}`, payload)
        toast.success("Menu modifié avec succès")
      } else {
        await api.post("/menus", payload)
        toast.success("Menu créé avec succès")
      }

      setDialogOpen(false)
      resetForm()
      setEditingMenu(null)
      loadMenus()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de l'opération")
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      menu_type: "breakfast",
      price_xof: 0,
      price_eur: 0,
      price_usd: 0,
      is_active: true,
      available_from: "",
      available_until: "",
    })
    setSelectedProducts([])
  }

  const addProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      { product_id: "", quantity: 1, is_optional: false },
    ])
  }

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index))
  }

  const updateProduct = (index: number, field: string, value: any) => {
    const updated = [...selectedProducts]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedProducts(updated)
  }

  const getMenuTypeLabel = (type: string | null) => {
    switch (type) {
      case "breakfast": return "Petit-déjeuner"
      case "lunch": return "Déjeuner"
      case "dinner": return "Dîner"
      case "snack": return "Snack"
      default: return type || "-"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const activeMenus = menus.filter(m => m.is_active).length
  const avgPrice = menus.length > 0 ? menus.reduce((sum, m) => sum + m.price_xof, 0) / menus.length : 0
  const totalProducts = menus.reduce((sum, m) => sum + (m.menu_items?.length || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menus & Formules</h1>
          <p className="text-muted-foreground">
            Gérez les menus et formules de produits groupés
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau menu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingMenu ? "Modifier le menu" : "Nouveau menu"}
                </DialogTitle>
                <DialogDescription>
                  {editingMenu ? "Modifiez les informations du menu" : "Créez un menu avec plusieurs produits groupés"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du menu *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Formule Petit-Déjeuner"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="menu_type">Type</Label>
                    <Select
                      value={formData.menu_type}
                      onValueChange={(value) => setFormData({ ...formData, menu_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type de menu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                        <SelectItem value="lunch">Déjeuner</SelectItem>
                        <SelectItem value="dinner">Dîner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du menu..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price_xof">Prix FCFA *</Label>
                    <Input
                      id="price_xof"
                      type="number"
                      min="0"
                      value={formData.price_xof}
                      onChange={(e) => setFormData({ ...formData, price_xof: parseFloat(e.target.value) || 0 })}
                      placeholder="5000"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price_eur">Prix EUR</Label>
                    <Input
                      id="price_eur"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_eur}
                      onChange={(e) => setFormData({ ...formData, price_eur: parseFloat(e.target.value) || 0 })}
                      placeholder="10.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price_usd">Prix USD</Label>
                    <Input
                      id="price_usd"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_usd}
                      onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) || 0 })}
                      placeholder="12.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="available_from">Disponible de</Label>
                    <Input
                      id="available_from"
                      type="time"
                      value={formData.available_from}
                      onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="available_until">Disponible jusqu'à</Label>
                    <Input
                      id="available_until"
                      type="time"
                      value={formData.available_until}
                      onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Actif</Label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Produits inclus</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un produit
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selectedProducts.map((item, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <select
                            className="w-full h-10 px-3 border border-input bg-background rounded-md"
                            value={item.product_id}
                            onChange={(e) => updateProduct(index, "product_id", e.target.value)}
                            required
                          >
                            <option value="">Sélectionner un produit</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name_fr} - {product.selling_price_xof?.toLocaleString("fr-FR")} FCFA
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateProduct(index, "quantity", parseInt(e.target.value) || 1)}
                            placeholder="Qté"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.is_optional}
                            onChange={(e) => updateProduct(index, "is_optional", e.target.checked)}
                            className="w-4 h-4"
                          />
                          <Label className="text-xs">Opt.</Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">{editingMenu ? "Modifier" : "Créer"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards avec Design Moderne */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <UtensilsCrossed className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                Total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total menus</p>
              <p className="text-3xl font-bold">{menus.length}</p>
              <p className="text-xs text-muted-foreground">formules créées</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                Actifs
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Menus actifs</p>
              <p className="text-3xl font-bold">{activeMenus}</p>
              <p className="text-xs text-muted-foreground">disponibles à la vente</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Package className="w-6 h-6 text-violet-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                Produits
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total produits</p>
              <p className="text-3xl font-bold">{totalProducts}</p>
              <p className="text-xs text-muted-foreground">dans tous les menus</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                Prix moy.
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Prix moyen</p>
              <p className="text-3xl font-bold">{avgPrice.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">FCFA par menu</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead className="text-right">Prix (FCFA)</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun menu trouvé</p>
                </TableCell>
              </TableRow>
            ) : (
              menus.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell>
                    <div className="font-medium">{menu.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getMenuTypeLabel(menu.menu_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm text-muted-foreground truncate">
                      {menu.description || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Package className="w-3 h-3" />
                      <span>{menu.menu_items?.length || 0} produit(s)</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold">
                      {menu.price_xof.toLocaleString("fr-FR")} FCFA
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={menu.is_active ? "default" : "secondary"}>
                      {menu.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(menu)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(menu)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(menu)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Désactiver
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

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du menu</DialogTitle>
            <DialogDescription>
              Informations complètes sur le menu
            </DialogDescription>
          </DialogHeader>

          {viewingMenu && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nom du menu</Label>
                  <p className="font-medium">{viewingMenu.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <Badge variant="secondary" className="mt-1">
                    {getMenuTypeLabel(viewingMenu.menu_type)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{viewingMenu.description || "-"}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Prix FCFA</Label>
                  <p className="text-xl font-semibold text-primary">
                    {viewingMenu.price_xof.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
                {viewingMenu.price_eur && viewingMenu.price_eur > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Prix EUR</Label>
                    <p className="text-xl font-semibold">
                      {viewingMenu.price_eur.toLocaleString("fr-FR")} €
                    </p>
                  </div>
                )}
                {viewingMenu.price_usd && viewingMenu.price_usd > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Prix USD</Label>
                    <p className="text-xl font-semibold">
                      ${viewingMenu.price_usd.toLocaleString("fr-FR")}
                    </p>
                  </div>
                )}
              </div>

              {(viewingMenu.available_from || viewingMenu.available_until) && (
                <div className="grid grid-cols-2 gap-4">
                  {viewingMenu.available_from && (
                    <div>
                      <Label className="text-muted-foreground">Disponible de</Label>
                      <p className="font-medium">{viewingMenu.available_from}</p>
                    </div>
                  )}
                  {viewingMenu.available_until && (
                    <div>
                      <Label className="text-muted-foreground">Disponible jusqu'à</Label>
                      <p className="font-medium">{viewingMenu.available_until}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Produits inclus</Label>
                <div className="mt-2 space-y-2">
                  {viewingMenu.menu_items && viewingMenu.menu_items.length > 0 ? (
                    viewingMenu.menu_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span>{item.products.name_fr}</span>
                          {item.is_optional && (
                            <Badge variant="outline" className="text-xs">Optionnel</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Qté: {item.quantity}</span>
                          <span>{item.products.selling_price_xof.toLocaleString("fr-FR")} FCFA</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun produit</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Statut</Label>
                <Badge variant={viewingMenu.is_active ? "default" : "secondary"} className="mt-1">
                  {viewingMenu.is_active ? "Actif" : "Inactif"}
                </Badge>
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

      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <UtensilsCrossed className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-medium mb-1">À propos des menus</p>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Les menus permettent de grouper plusieurs produits ensemble</li>
              <li>Définissez un prix fixe pour le menu complet</li>
              <li>Chaque produit peut être marqué comme optionnel</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
