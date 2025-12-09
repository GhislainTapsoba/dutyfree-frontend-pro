"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { productsService, Product, Category } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Save, Loader2, Upload, Package, Plus } from "lucide-react"
import { toast } from "sonner"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [stockQuantity, setStockQuantity] = useState(0)
  const [stockReason, setStockReason] = useState("")
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    code: "",
    barcode: "",
    name_fr: "",
    name_en: "",
    description_fr: "",
    description_en: "",
    category_id: "",
    selling_price_xof: 0,
    selling_price_eur: 0,
    selling_price_usd: 0,
    tax_rate: 0,
    min_stock_level: 5,
    max_stock_level: 100,
    is_active: true,
    is_promotional: false,
    image_url: "",
  })

  useEffect(() => {
    async function loadData() {
      if (!params.id) return
      
      setLoading(true)
      try {
        const [productRes, categoriesRes] = await Promise.all([
          productsService.getProduct(params.id as string),
          productsService.getCategories(),
        ])

        if (productRes.data) {
          const prod = productRes.data
          setProduct(prod)
          setCurrentImageUrl(prod.image_url || null)
          setFormData({
            code: prod.code,
            barcode: prod.barcode || "",
            name_fr: prod.name_fr,
            name_en: prod.name_en,
            description_fr: prod.description_fr || "",
            description_en: prod.description_en || "",
            category_id: prod.category_id,
            selling_price_xof: prod.selling_price_xof,
            selling_price_eur: prod.selling_price_eur || 0,
            selling_price_usd: prod.selling_price_usd || 0,
            tax_rate: prod.tax_rate,
            min_stock_level: prod.min_stock_level,
            max_stock_level: prod.max_stock_level || 100,
            is_active: prod.is_active,
            is_promotional: prod.is_promotional || false,
            image_url: prod.image_url || "",
          })
        }

        if (categoriesRes.data && Array.isArray(categoriesRes.data)) {
          setCategories(categoriesRes.data)
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
        toast.error("Erreur lors du chargement des données")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setSaving(true)
    try {
      await productsService.updateProduct(product.id, formData)
      // Garder l'image après sauvegarde
      if (previewImage) {
        setCurrentImageUrl(previewImage)
        setPreviewImage(null)
      }
      toast.success("Produit modifié avec succès")
      router.push(`/dashboard/products/${product.id}`)
    } catch (error) {
      console.error("Erreur lors de la modification:", error)
      toast.error("Erreur lors de la modification du produit")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Créer un aperçu local et sauvegarder dans le formulaire
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      setPreviewImage(imageData)
      handleInputChange('image_url', imageData)
      toast.success('Image sélectionnée')
    }
    reader.readAsDataURL(file)
  }

  const handleStockAdjustment = async () => {
    if (!product || stockQuantity === 0) return

    try {
      const response = await fetch(`http://localhost:3001/api/products/${product.id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: stockQuantity, reason: stockReason })
      })
      
      if (response.ok) {
        // Rafraîchir les données du produit
        const productResponse = await productsService.getProduct(product.id)
        if (productResponse.data) {
          setProduct(productResponse.data)
        }
        
        toast.success('Stock ajusté')
        setStockDialogOpen(false)
        setStockQuantity(0)
        setStockReason('')
      } else {
        toast.error('Erreur lors de l\'ajustement')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajustement')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Produit non trouvé</h2>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Modifier le produit</h1>
            <p className="text-muted-foreground">{product.name_fr}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle>Image du produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {(previewImage || (formData.image_url && formData.image_url.startsWith('data:'))) ? (
                  <img 
                    src={previewImage || formData.image_url} 
                    alt={product.name_fr} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {previewImage ? 'Changer l\'image' : 'Sélectionner une image'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Informations de base */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Code produit *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="barcode">Code-barres</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange("barcode", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name_fr">Nom (Français) *</Label>
                <Input
                  id="name_fr"
                  value={formData.name_fr}
                  onChange={(e) => handleInputChange("name_fr", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="name_en">Nom (Anglais) *</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => handleInputChange("name_en", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category_id">Catégorie</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name_fr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description_fr">Description (Français)</Label>
                <Textarea
                  id="description_fr"
                  value={formData.description_fr}
                  onChange={(e) => handleInputChange("description_fr", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="description_en">Description (Anglais)</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) => handleInputChange("description_en", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Prix et stock */}
          <Card>
            <CardHeader>
              <CardTitle>Prix et stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="selling_price_xof">Prix XOF (FCFA) *</Label>
                <Input
                  id="selling_price_xof"
                  type="number"
                  value={formData.selling_price_xof}
                  onChange={(e) => handleInputChange("selling_price_xof", Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="selling_price_eur">Prix EUR (€)</Label>
                <Input
                  id="selling_price_eur"
                  type="number"
                  step="0.01"
                  value={formData.selling_price_eur}
                  onChange={(e) => handleInputChange("selling_price_eur", Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="selling_price_usd">Prix USD ($)</Label>
                <Input
                  id="selling_price_usd"
                  type="number"
                  step="0.01"
                  value={formData.selling_price_usd}
                  onChange={(e) => handleInputChange("selling_price_usd", Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="tax_rate">Taux de TVA (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => handleInputChange("tax_rate", Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_stock_level">Stock minimum</Label>
                  <Input
                    id="min_stock_level"
                    type="number"
                    value={formData.min_stock_level}
                    onChange={(e) => handleInputChange("min_stock_level", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="max_stock_level">Stock maximum</Label>
                  <Input
                    id="max_stock_level"
                    type="number"
                    value={formData.max_stock_level}
                    onChange={(e) => handleInputChange("max_stock_level", Number(e.target.value))}
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Stock et statut */}
          <Card>
            <CardHeader>
              <CardTitle>Stock et statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Stock actuel</Label>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-semibold">{product.current_stock || 0}</span>
                  <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajuster
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajuster le stock</DialogTitle>
                        <DialogDescription>
                          Entrez une quantité positive pour ajouter du stock ou négative pour en retirer.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="stock_qty">Quantité</Label>
                          <Input
                            id="stock_qty"
                            type="number"
                            value={stockQuantity}
                            onChange={(e) => setStockQuantity(Number(e.target.value))}
                            placeholder="+10 ou -5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="stock_reason">Raison</Label>
                          <Input
                            id="stock_reason"
                            value={stockReason}
                            onChange={(e) => setStockReason(e.target.value)}
                            placeholder="Réception, inventaire, etc."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setStockDialogOpen(false)}>Annuler</Button>
                        <Button 
                          onClick={handleStockAdjustment}
                          disabled={stockQuantity === 0}
                        >
                          Ajuster
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Produit actif</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_promotional">En promotion</Label>
                  <Switch
                    id="is_promotional"
                    checked={formData.is_promotional}
                    onCheckedChange={(checked) => handleInputChange("is_promotional", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}