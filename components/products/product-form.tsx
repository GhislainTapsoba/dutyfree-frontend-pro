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
  const [formData, setFormData] = useState({
    name: product?.name || "",
    name_en: product?.name_en || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    description: product?.description || "",
    category_id: product?.category_id || "",
    supplier_id: product?.supplier_id || "",
    price: product?.price || "",
    price_eur: product?.price_eur || "",
    price_usd: product?.price_usd || "",
    cost_price: product?.cost_price || "",
    stock_quantity: product?.stock_quantity || 0,
    min_stock_level: product?.min_stock_level || 10,
    is_active: product?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(product ? `/api/products/${product.id}` : "/api/products", {
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
              <Label htmlFor="name">Nom (Français) *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      {cat.name}
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
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cliquez ou déposez une image ici</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 5MB</p>
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
              <Label htmlFor="price">Prix (XOF) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="50000"
                className="bg-secondary border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_eur">Prix (EUR)</Label>
              <Input
                id="price_eur"
                type="number"
                step="0.01"
                value={formData.price_eur}
                onChange={(e) => setFormData({ ...formData, price_eur: e.target.value })}
                placeholder="76.00"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_usd">Prix (USD)</Label>
              <Input
                id="price_usd"
                type="number"
                step="0.01"
                value={formData.price_usd}
                onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                placeholder="82.00"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost_price">Prix d'achat (XOF)</Label>
            <Input
              id="cost_price"
              type="number"
              value={formData.cost_price}
              onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
              placeholder="35000"
              className="bg-secondary border-border"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Quantité en stock</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: Number.parseInt(e.target.value) || 0 })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock_level">Seuil d'alerte</Label>
              <Input
                id="min_stock_level"
                type="number"
                value={formData.min_stock_level}
                onChange={(e) => setFormData({ ...formData, min_stock_level: Number.parseInt(e.target.value) || 10 })}
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
