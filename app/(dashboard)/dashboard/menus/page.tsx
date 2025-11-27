"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, UtensilsCrossed, Edit, Trash2 } from "lucide-react"
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

interface Menu {
  id: string
  code: string
  name_fr: string
  name_en: string
  description_fr: string | null
  description_en: string | null
  menu_type: "breakfast" | "lunch" | "dinner" | "snack" | "custom"
  price_xof: number
  price_eur: number | null
  price_usd: number | null
  is_active: boolean
  created_at: string
}

interface Product {
  id: string
  name_fr: string
  code: string
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)

  const [formData, setFormData] = useState({
    code: "",
    name_fr: "",
    name_en: "",
    description_fr: "",
    description_en: "",
    menu_type: "breakfast" as "breakfast" | "lunch" | "dinner" | "snack" | "custom",
    price_xof: 0,
    price_eur: 0,
    price_usd: 0,
    is_active: true,
  })

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  useEffect(() => {
    loadMenus()
    loadProducts()
  }, [])

  const loadMenus = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/menus")
      const data = await response.json()
      if (data.data) setMenus(data.data)
    } catch (error) {
      console.error("Erreur lors du chargement des menus:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/products")
      const data = await response.json()
      if (data.data) setProducts(data.data)
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error)
    }
  }

  const handleOpenDialog = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu)
      setFormData({
        code: menu.code,
        name_fr: menu.name_fr,
        name_en: menu.name_en,
        description_fr: menu.description_fr || "",
        description_en: menu.description_en || "",
        menu_type: menu.menu_type,
        price_xof: menu.price_xof,
        price_eur: menu.price_eur || 0,
        price_usd: menu.price_usd || 0,
        is_active: menu.is_active,
      })
    } else {
      setEditingMenu(null)
      setFormData({
        code: "",
        name_fr: "",
        name_en: "",
        description_fr: "",
        description_en: "",
        menu_type: "breakfast",
        price_xof: 0,
        price_eur: 0,
        price_usd: 0,
        is_active: true,
      })
      setSelectedProducts([])
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.name_fr || !formData.name_en) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const url = editingMenu
        ? `http://localhost:3001/api/menus/${editingMenu.id}`
        : "http://localhost:3001/api/menus"

      const response = await fetch(url, {
        method: editingMenu ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          products: selectedProducts,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingMenu ? "Menu modifié" : "Menu créé")
        setDialogOpen(false)
        loadMenus()
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce menu ?")) return

    try {
      const response = await fetch(`http://localhost:3001/api/menus/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Menu supprimé")
        loadMenus()
      } else {
        toast.error("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression")
    }
  }

  const getMenuTypeLabel = (type: string) => {
    const types = {
      breakfast: "Petit-déjeuner",
      lunch: "Déjeuner",
      dinner: "Dîner",
      snack: "Snack",
      custom: "Personnalisé",
    }
    return types[type as keyof typeof types] || type
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
          <h1 className="text-2xl font-bold">Menus & Formules</h1>
          <p className="text-muted-foreground">
            Gérez vos menus automatisés (petit-déjeuner, déjeuner, dîner...)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau menu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingMenu ? "Modifier le menu" : "Nouveau menu"}</DialogTitle>
                <DialogDescription>Configurez les détails du menu</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="MENU-PDJ-01"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="menu_type">Type de menu *</Label>
                    <Select
                      value={formData.menu_type}
                      onValueChange={(value: any) => setFormData({ ...formData, menu_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                        <SelectItem value="lunch">Déjeuner</SelectItem>
                        <SelectItem value="dinner">Dîner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                        <SelectItem value="custom">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name_fr">Nom (Français) *</Label>
                    <Input
                      id="name_fr"
                      value={formData.name_fr}
                      onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                      placeholder="Menu Petit-Déjeuner"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="name_en">Nom (Anglais) *</Label>
                    <Input
                      id="name_en"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      placeholder="Breakfast Menu"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="description_fr">Description (Français)</Label>
                    <Textarea
                      id="description_fr"
                      value={formData.description_fr}
                      onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                      placeholder="Description du menu..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description_en">Description (Anglais)</Label>
                    <Textarea
                      id="description_en"
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      placeholder="Menu description..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price_xof">Prix XOF (FCFA) *</Label>
                    <Input
                      id="price_xof"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.price_xof}
                      onChange={(e) =>
                        setFormData({ ...formData, price_xof: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price_eur">Prix EUR (€)</Label>
                    <Input
                      id="price_eur"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_eur}
                      onChange={(e) =>
                        setFormData({ ...formData, price_eur: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="price_usd">Prix USD ($)</Label>
                    <Input
                      id="price_usd"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_usd}
                      onChange={(e) =>
                        setFormData({ ...formData, price_usd: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Produits inclus dans le menu</Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`product-${product.id}`}
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product.id])
                            } else {
                              setSelectedProducts(selectedProducts.filter((id) => id !== product.id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`product-${product.id}`} className="text-sm font-normal">
                          {product.name_fr} ({product.code})
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedProducts.length} produit(s) sélectionné(s)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Menu actif</Label>
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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Prix XOF</TableHead>
              <TableHead className="text-right">Prix EUR</TableHead>
              <TableHead className="text-right">Prix USD</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun menu trouvé</p>
                </TableCell>
              </TableRow>
            ) : (
              menus.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell className="font-mono font-semibold">{menu.code}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{menu.name_fr}</div>
                      <div className="text-xs text-muted-foreground">{menu.name_en}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getMenuTypeLabel(menu.menu_type)}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {menu.price_xof.toLocaleString("fr-FR")} FCFA
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {menu.price_eur ? `€${menu.price_eur.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {menu.price_usd ? `$${menu.price_usd.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={menu.is_active ? "default" : "secondary"}>
                      {menu.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(menu)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(menu.id)}>
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
