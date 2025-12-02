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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4">Chargement des produits...</p>
      </div>
    )
  }

  console.log('Render - Products:', products.length, 'Sheets:', sheets.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fiches Techniques</h1>
          <p className="text-muted-foreground">
            Gestion des fiches techniques produits ({products.length} produits disponibles)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle fiche
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSheet ? "Modifier la fiche technique" : "Nouvelle fiche technique"}
                </DialogTitle>
                <DialogDescription>
                  Informations détaillées sur le produit
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Identification */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Identification</h3>
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
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Composition</h3>
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
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Informations nutritionnelles (pour 100g)</h3>
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
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Caractéristiques</h3>
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
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Dimensions</h3>
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">{editingSheet ? "Modifier" : "Créer"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code fiche</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Code produit</TableHead>
              <TableHead>Origine</TableHead>
              <TableHead>Poids net</TableHead>
              <TableHead>Code douanier (HS)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sheets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune fiche technique trouvée</p>
                </TableCell>
              </TableRow>
            ) : (
              sheets.map((sheet) => (
                <TableRow key={sheet.id}>
                  <TableCell className="font-mono font-semibold text-primary">{sheet.sheet_code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{sheet.product?.name_fr || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{sheet.product?.code || '-'}</Badge>
                  </TableCell>
                  <TableCell>{sheet.country_of_origin || "-"}</TableCell>
                  <TableCell>{sheet.net_weight ? `${sheet.net_weight}g` : "-"}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm font-semibold">{sheet.hs_code || "-"}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(sheet)}
                        title="Voir"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(sheet)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(sheet.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDownload(sheet)}
                        title="Télécharger"
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Fiche Technique - {viewingSheet.sheet_code}</DialogTitle>
              <DialogDescription>
                {viewingSheet.product?.name_fr} ({viewingSheet.product?.code})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pays d'origine</Label>
                  <p className="p-2 bg-secondary rounded">{viewingSheet.country_of_origin || viewingSheet.origin_country || '-'}</p>
                </div>
                <div>
                  <Label>Code douanier (HS)</Label>
                  <p className="p-2 bg-secondary rounded font-mono">{viewingSheet.hs_code || '-'}</p>
                </div>
                <div>
                  <Label>Poids net</Label>
                  <p className="p-2 bg-secondary rounded">{viewingSheet.net_weight ? `${viewingSheet.net_weight}g` : '-'}</p>
                </div>
                <div>
                  <Label>Poids brut</Label>
                  <p className="p-2 bg-secondary rounded">{viewingSheet.gross_weight ? `${viewingSheet.gross_weight}g` : '-'}</p>
                </div>
              </div>
              {viewingSheet.ingredients && (
                <div>
                  <Label>Ingrédients</Label>
                  <p className="p-2 bg-secondary rounded text-sm">{viewingSheet.ingredients}</p>
                </div>
              )}
              {viewingSheet.allergens && (
                <div>
                  <Label>Allergènes</Label>
                  <p className="p-2 bg-secondary rounded text-sm">{viewingSheet.allergens}</p>
                </div>
              )}
              {viewingSheet.storage_conditions && (
                <div>
                  <Label>Conditions de stockage</Label>
                  <p className="p-2 bg-secondary rounded text-sm">{viewingSheet.storage_conditions}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Fermer</Button>
              <Button onClick={() => handleDownload(viewingSheet)}>Télécharger</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
