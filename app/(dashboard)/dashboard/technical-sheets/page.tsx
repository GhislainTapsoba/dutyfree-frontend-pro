"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, FileText, Edit, Trash2, Download } from "lucide-react"
import { productsService } from "@/lib/api"
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
import { toast } from "sonner"

interface TechnicalSheet {
  id: string
  product_id: string
  sheet_code: string
  ingredients: string | null
  allergens: string | null
  nutritional_info: any
  country_of_origin: string | null
  net_weight: number | null
  gross_weight: number | null
  dimensions: any
  hs_code: string | null
  certifications: any
  shelf_life_days: number | null
  storage_conditions: string | null
  created_at: string
  product?: {
    name_fr: string
    code: string
  }
}

interface Product {
  id: string
  name_fr: string
  code: string
}

export default function TechnicalSheetsPage() {
  const [sheets, setSheets] = useState<TechnicalSheet[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingSheet, setEditingSheet] = useState<TechnicalSheet | null>(null)
  const [viewingSheet, setViewingSheet] = useState<TechnicalSheet | null>(null)

  const [formData, setFormData] = useState({
    product_id: "",
    sheet_code: "",
    ingredients: "",
    allergens: "",
    country_of_origin: "",
    net_weight: 0,
    gross_weight: 0,
    hs_code: "",
    shelf_life_days: 0,
    storage_conditions: "",
    nutritional_info: {
      calories: 0,
      proteins: 0,
      carbohydrates: 0,
      fats: 0,
      fiber: 0,
      sodium: 0,
    },
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      unit: "cm",
    },
    certifications: [] as string[],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      
      const [productsRes, sheetsRes] = await Promise.all([
        productsService.getProducts(),
        fetch(`${apiUrl}/technical-sheets`).then(r => r.json())
      ])

      if (productsRes.data && Array.isArray(productsRes.data)) {
        setProducts(productsRes.data)
      } else {
        setProducts([])
      }

      if (sheetsRes.data && Array.isArray(sheetsRes.data)) {
        // Mapper les données depuis specifications vers les champs attendus
        const mappedSheets = sheetsRes.data.map((sheet: any) => ({
          ...sheet,
          sheet_code: sheet.sheet_code || 'N/A',
          hs_code: sheet.customs_code,
          country_of_origin: sheet.origin_country,
          allergens: Array.isArray(sheet.allergens) ? sheet.allergens.join(', ') : sheet.allergens,
          certifications: Array.isArray(sheet.certifications) ? sheet.certifications : [],
        }))
        setSheets(mappedSheets)
      } else {
        setSheets([])
      }

    } catch (error) {
      console.error("Erreur lors du chargement:", error)
      toast.error("Erreur lors du chargement des produits")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (sheet?: TechnicalSheet) => {
    if (sheet) {
      setEditingSheet(sheet)
      setFormData({
        product_id: sheet.product_id,
        sheet_code: sheet.sheet_code,
        ingredients: sheet.ingredients || "",
        allergens: sheet.allergens || "",
        country_of_origin: sheet.country_of_origin || "",
        net_weight: sheet.net_weight || 0,
        gross_weight: sheet.gross_weight || 0,
        hs_code: sheet.hs_code || "",
        shelf_life_days: sheet.shelf_life_days || 0,
        storage_conditions: sheet.storage_conditions || "",
        nutritional_info: sheet.nutritional_info || {
          calories: 0,
          proteins: 0,
          carbohydrates: 0,
          fats: 0,
          fiber: 0,
          sodium: 0,
        },
        dimensions: sheet.dimensions || {
          length: 0,
          width: 0,
          height: 0,
          unit: "cm",
        },
        certifications: sheet.certifications || [],
      })
    } else {
      setEditingSheet(null)
      setFormData({
        product_id: "",
        sheet_code: "",
        ingredients: "",
        allergens: "",
        country_of_origin: "",
        net_weight: 0,
        gross_weight: 0,
        hs_code: "",
        shelf_life_days: 0,
        storage_conditions: "",
        nutritional_info: {
          calories: 0,
          proteins: 0,
          carbohydrates: 0,
          fats: 0,
          fiber: 0,
          sodium: 0,
        },
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          unit: "cm",
        },
        certifications: [],
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.product_id || !formData.sheet_code) {
      toast.error("Veuillez remplir les champs obligatoires")
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const url = editingSheet
        ? `${apiUrl}/technical-sheets/${editingSheet.id}`
        : `${apiUrl}/technical-sheets`

      const response = await fetch(url, {
        method: editingSheet ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingSheet ? "Fiche technique modifiée" : "Fiche technique créée")
        setDialogOpen(false)
        loadData()
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleView = (sheet: TechnicalSheet) => {
    setViewingSheet(sheet)
    setViewDialogOpen(true)
  }

  const handleDownload = (sheet: TechnicalSheet) => {
    const content = `FICHE TECHNIQUE - ${sheet.sheet_code}

Produit: ${sheet.product?.name_fr}
Code: ${sheet.product?.code}

Ingrédients: ${sheet.ingredients || '-'}
Allergènes: ${sheet.allergens || '-'}
Pays d'origine: ${sheet.country_of_origin || '-'}
Poids net: ${sheet.net_weight ? sheet.net_weight + 'g' : '-'}
Code douanier: ${sheet.hs_code || '-'}
`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fiche-technique-${sheet.sheet_code}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Fiche technique téléchargée')
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette fiche technique ?")) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/technical-sheets/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Fiche technique supprimée")
        loadData()
      } else {
        toast.error("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">Chargement des fiches techniques...</p>
          <p className="text-sm text-muted-foreground">Veuillez patienter</p>
        </div>
      </div>
    )
  }

  console.log('Render - Products:', products.length, 'Sheets:', sheets.length)

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Fiches Techniques</h1>
            <p className="text-white/90 mt-1 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Gestion des fiches techniques produits ({products.length} produits disponibles)
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenDialog()}
                variant="secondary"
                className="bg-white/20 backdrop-blur-sm border-white/20 hover:bg-white/30 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle fiche
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/10">
            <form onSubmit={handleSubmit}>
              <DialogHeader className="border-b pb-4 mb-6">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {editingSheet ? "Modifier la fiche technique" : "Nouvelle fiche technique"}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Informations détaillées sur le produit
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Identification */}
                <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-100 dark:border-blue-900/30 shadow-sm">
                  <h3 className="font-semibold text-base text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                    Identification
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product_id">Produit *</Label>
                      <Select
                        value={formData.product_id}
                        onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.length === 0 ? (
                            <SelectItem value="none" disabled>Aucun produit disponible</SelectItem>
                          ) : (
                            products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name_fr} ({product.code})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="sheet_code">Code fiche *</Label>
                      <Input
                        id="sheet_code"
                        value={formData.sheet_code || ""}
                        onChange={(e) => setFormData({ ...formData, sheet_code: e.target.value })}
                        placeholder="FT-001"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Composition */}
                <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-100 dark:border-blue-900/30 shadow-sm">
                  <h3 className="font-semibold text-base text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                    Composition
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="ingredients">Ingrédients</Label>
                      <Textarea
                        id="ingredients"
                        value={formData.ingredients || ""}
                        onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                        placeholder="Liste des ingrédients..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="allergens">Allergènes</Label>
                      <Textarea
                        id="allergens"
                        value={formData.allergens || ""}
                        onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                        placeholder="Contient: gluten, lactose..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Informations nutritionnelles */}
                <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-100 dark:border-blue-900/30 shadow-sm">
                  <h3 className="font-semibold text-base text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                    Informations nutritionnelles (pour 100g)
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Calories (kcal)</Label>
                      <Input
                        type="number"
                        value={formData.nutritional_info.calories || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nutritional_info: {
                              ...formData.nutritional_info,
                              calories: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Protéines (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.nutritional_info.proteins || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nutritional_info: {
                              ...formData.nutritional_info,
                              proteins: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Glucides (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.nutritional_info.carbohydrates || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nutritional_info: {
                              ...formData.nutritional_info,
                              carbohydrates: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Lipides (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.nutritional_info.fats || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nutritional_info: {
                              ...formData.nutritional_info,
                              fats: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Fibres (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.nutritional_info.fiber || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nutritional_info: {
                              ...formData.nutritional_info,
                              fiber: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Sodium (mg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.nutritional_info.sodium || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nutritional_info: {
                              ...formData.nutritional_info,
                              sodium: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Caractéristiques */}
                <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-100 dark:border-blue-900/30 shadow-sm">
                  <h3 className="font-semibold text-base text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                    Caractéristiques
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country_of_origin">Pays d'origine</Label>
                      <Input
                        id="country_of_origin"
                        value={formData.country_of_origin || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, country_of_origin: e.target.value })
                        }
                        placeholder="France"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hs_code">Code douanier (HS Code)</Label>
                      <Input
                        id="hs_code"
                        value={formData.hs_code || ""}
                        onChange={(e) => setFormData({ ...formData, hs_code: e.target.value })}
                        placeholder="1234.56.78"
                      />
                    </div>

                    <div>
                      <Label htmlFor="net_weight">Poids net (g)</Label>
                      <Input
                        id="net_weight"
                        type="number"
                        step="0.01"
                        value={formData.net_weight || 0}
                        onChange={(e) =>
                          setFormData({ ...formData, net_weight: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="gross_weight">Poids brut (g)</Label>
                      <Input
                        id="gross_weight"
                        type="number"
                        step="0.01"
                        value={formData.gross_weight || 0}
                        onChange={(e) =>
                          setFormData({ ...formData, gross_weight: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="shelf_life_days">Durée de vie (jours)</Label>
                      <Input
                        id="shelf_life_days"
                        type="number"
                        value={formData.shelf_life_days || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shelf_life_days: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="storage_conditions">Conditions de stockage</Label>
                      <Input
                        id="storage_conditions"
                        value={formData.storage_conditions || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, storage_conditions: e.target.value })
                        }
                        placeholder="À conserver au frais"
                      />
                    </div>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-100 dark:border-blue-900/30 shadow-sm">
                  <h3 className="font-semibold text-base text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                    Dimensions
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Longueur</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.dimensions.length || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: {
                              ...formData.dimensions,
                              length: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Largeur</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.dimensions.width || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: {
                              ...formData.dimensions,
                              width: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Hauteur</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.dimensions.height || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: {
                              ...formData.dimensions,
                              height: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Unité</Label>
                      <Select
                        value={formData.dimensions.unit}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, unit: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="mm">mm</SelectItem>
                          <SelectItem value="m">m</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t pt-6 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {editingSheet ? "Modifier" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-2 border-blue-200 dark:border-blue-800">
              <TableHead className="font-semibold text-blue-900 dark:text-blue-100">Code fiche</TableHead>
              <TableHead className="font-semibold text-blue-900 dark:text-blue-100">Produit</TableHead>
              <TableHead className="font-semibold text-blue-900 dark:text-blue-100">Code produit</TableHead>
              <TableHead className="font-semibold text-blue-900 dark:text-blue-100">Origine</TableHead>
              <TableHead className="font-semibold text-blue-900 dark:text-blue-100">Poids net</TableHead>
              <TableHead className="font-semibold text-blue-900 dark:text-blue-100">Code douanier (HS)</TableHead>
              <TableHead className="text-right font-semibold text-blue-900 dark:text-blue-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sheets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-full">
                      <FileText className="w-12 h-12 text-blue-400 dark:text-blue-600" />
                    </div>
                    <p className="text-lg font-medium">Aucune fiche technique trouvée</p>
                    <p className="text-sm text-muted-foreground">Créez votre première fiche technique pour commencer</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sheets.map((sheet) => (
                <TableRow
                  key={sheet.id}
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-200 border-b border-gray-100 dark:border-gray-800"
                >
                  <TableCell className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                    {sheet.sheet_code}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {sheet.product?.name_fr || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                    >
                      {sheet.product?.code || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {sheet.country_of_origin || "-"}
                  </TableCell>
                  <TableCell className="font-medium text-gray-700 dark:text-gray-300">
                    {sheet.net_weight ? `${sheet.net_weight}g` : "-"}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {sheet.hs_code || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(sheet)}
                        title="Voir"
                        className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(sheet)}
                        title="Modifier"
                        className="hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(sheet.id)}
                        title="Supprimer"
                        className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(sheet)}
                        title="Télécharger"
                        className="hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de visualisation */}
      {viewingSheet && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/10">
            <DialogHeader className="border-b pb-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
              <DialogTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                Fiche Technique - {viewingSheet.sheet_code}
              </DialogTitle>
              <DialogDescription className="text-base font-medium">
                {viewingSheet.product?.name_fr} ({viewingSheet.product?.code})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">Pays d'origine</Label>
                  <p className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-100 dark:border-blue-900/30 text-gray-900 dark:text-gray-100">
                    {viewingSheet.country_of_origin || viewingSheet.origin_country || '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">Code douanier (HS)</Label>
                  <p className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-100 dark:border-blue-900/30 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                    {viewingSheet.hs_code || '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">Poids net</Label>
                  <p className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-100 dark:border-blue-900/30 text-gray-900 dark:text-gray-100">
                    {viewingSheet.net_weight ? `${viewingSheet.net_weight}g` : '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">Poids brut</Label>
                  <p className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-100 dark:border-blue-900/30 text-gray-900 dark:text-gray-100">
                    {viewingSheet.gross_weight ? `${viewingSheet.gross_weight}g` : '-'}
                  </p>
                </div>
              </div>
              {viewingSheet.ingredients && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">Ingrédients</Label>
                  <p className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm text-gray-900 dark:text-gray-100">
                    {viewingSheet.ingredients}
                  </p>
                </div>
              )}
              {viewingSheet.allergens && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">Allergènes</Label>
                  <p className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200 dark:border-amber-900/30 text-sm text-gray-900 dark:text-gray-100">
                    {viewingSheet.allergens}
                  </p>
                </div>
              )}
              {viewingSheet.storage_conditions && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">Conditions de stockage</Label>
                  <p className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-900/30 text-sm text-gray-900 dark:text-gray-100">
                    {viewingSheet.storage_conditions}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="border-t pt-6 mt-6">
              <Button
                variant="outline"
                onClick={() => setViewDialogOpen(false)}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Fermer
              </Button>
              <Button
                onClick={() => handleDownload(viewingSheet)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
