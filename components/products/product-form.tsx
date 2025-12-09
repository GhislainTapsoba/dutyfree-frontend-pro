"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Upload } from "lucide-react"

interface ProductFormProps {
  product?: any
  categories: any[]
  suppliers: any[]
}

export function ProductForm({ product, categories, suppliers }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null)
  const [formData, setFormData] = useState({
    code: product?.code || "",
    name_fr: product?.name_fr || "",
    name_en: product?.name_en || "",
    barcode: product?.barcode || "",
    description_fr: product?.description_fr || "",
    description_en: product?.description_en || "",
    category_id: product?.category_id || "",
    supplier_id: product?.supplier_id || "",
    selling_price_xof: product?.selling_price_xof || "",
    selling_price_eur: product?.selling_price_eur || "",
    selling_price_usd: product?.selling_price_usd || "",
    purchase_price: product?.purchase_price || "",
    tax_rate: product?.tax_rate || 0,
    initial_stock: 0,
    min_stock_level: product?.min_stock_level || 10,
    max_stock_level: product?.max_stock_level || 100,
    is_active: product?.is_active ?? true,
    image_url: product?.image_url || "",
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFormData({...formData, image_url: base64})
        setImagePreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const endpoint = product ? `${API_URL}/products/${product.id}` : `${API_URL}/products`
      const response = await fetch(endpoint, {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/dashboard/products")
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_fr">Nom (Français) *</Label>
              <Input
                id="name_fr"
                value={formData.name_fr}
                onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                placeholder="Whisky Chivas 18 ans"
                className="bg-secondary border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">Nom (Anglais)</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="Chivas 18 Year Whisky"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code produit *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="CHV-18-70CL"
                className="bg-secondary border-border font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Code-barres</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="5000299211243"
                className="bg-secondary border-border font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_fr">Description (Français)</Label>
            <Textarea
              id="description_fr"
              value={formData.description_fr}
              onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
              placeholder="Description du produit..."
              className="bg-secondary border-border min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name_fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id}>
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image du produit</Label>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Ou entrez une URL:</p>
              <Input
                value={formData.image_url.startsWith('data:') ? '' : formData.image_url}
                onChange={(e) => {
                  setFormData({...formData, image_url: e.target.value})
                  setImagePreview(e.target.value)
                }}
                placeholder="https://..."
                className="bg-secondary border-border"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Prévisualisation"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Tarification multi-devises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="selling_price_xof">Prix (XOF) *</Label>
              <Input
                id="selling_price_xof"
                type="number"
                value={formData.selling_price_xof}
                onChange={(e) => setFormData({ ...formData, selling_price_xof: e.target.value })}
                placeholder="50000"
                className="bg-secondary border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling_price_eur">Prix (EUR)</Label>
              <Input
                id="selling_price_eur"
                type="number"
                step="0.01"
                value={formData.selling_price_eur}
                onChange={(e) => setFormData({ ...formData, selling_price_eur: e.target.value })}
                placeholder="76.00"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling_price_usd">Prix (USD)</Label>
              <Input
                id="selling_price_usd"
                type="number"
                step="0.01"
                value={formData.selling_price_usd}
                onChange={(e) => setFormData({ ...formData, selling_price_usd: e.target.value })}
                placeholder="82.00"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Prix d'achat (XOF)</Label>
              <Input
                id="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                placeholder="35000"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Taux de TVA (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
                placeholder="18"
                className="bg-secondary border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial_stock">Stock initial</Label>
              <Input
                id="initial_stock"
                type="number"
                value={formData.initial_stock}
                onChange={(e) => setFormData({ ...formData, initial_stock: Number(e.target.value) || 0 })}
                placeholder="0"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock_level">Stock minimum</Label>
              <Input
                id="min_stock_level"
                type="number"
                value={formData.min_stock_level}
                onChange={(e) => setFormData({ ...formData, min_stock_level: Number(e.target.value) || 10 })}
                placeholder="10"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_stock_level">Stock maximum</Label>
              <Input
                id="max_stock_level"
                type="number"
                value={formData.max_stock_level}
                onChange={(e) => setFormData({ ...formData, max_stock_level: Number(e.target.value) || 100 })}
                placeholder="100"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div>
              <Label htmlFor="is_active">Produit actif</Label>
              <p className="text-sm text-muted-foreground">Disponible à la vente</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : product ? (
            "Mettre à jour"
          ) : (
            "Créer le produit"
          )}
        </Button>
      </div>
    </form>
  )
}
