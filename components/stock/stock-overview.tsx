"use client"

import { useState } from "react"
import { api } from "@/lib/api/client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Package, AlertTriangle, TrendingDown, Boxes, Plus, Minus } from "lucide-react"
import { toast } from "sonner"

interface StockOverviewProps {
  products: any[]
  onReload?: () => void
}

export function StockOverview({ products, onReload }: StockOverviewProps) {
  const [search, setSearch] = useState("")
  const [adjustDialogOpen, setAdjustDialogOpen] = useState<string | null>(null)
  const [adjustQuantity, setAdjustQuantity] = useState("")
  const [adjustReason, setAdjustReason] = useState("")

  async function handleAdjust(productId: string, quantity: number, currentQty: number = 0) {
    const newQty = currentQty + quantity
    
    if (newQty > 100) {
      toast.error("Stock maximum de 100 unités atteint")
      return
    }
    
    if (newQty < 0) {
      toast.error("Stock ne peut pas être négatif")
      return
    }
    
    try {
      const response = await api.post("/stock/adjust", {
        product_id: productId,
        quantity,
        reason: adjustReason || "Ajustement rapide"
      })

      if (response.data) {
        toast.success("Stock ajusté")
        setAdjustDialogOpen(null)
        setAdjustQuantity("")
        setAdjustReason("")
        onReload?.()
      } else {
        toast.error(response.error || "Erreur")
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajustement")
    }
  }

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : []

  const filteredProducts = safeProducts.filter((p) => {
    const productData = p.product || p
    const name = (productData.name_fr || productData.name_en || '').toLowerCase()
    const code = (productData.code || '').toLowerCase()
    const searchLower = search.toLowerCase()
    return name.includes(searchLower) || code.includes(searchLower)
  })

  const totalValue = safeProducts.reduce((sum, p) => {
    const productData = p.product || p
    const qty = p.total_quantity || p.current_stock || 0
    const price = productData.selling_price_xof || 0
    return sum + (price * qty)
  }, 0)
  
  const lowStockCount = safeProducts.filter((p) => {
    const qty = p.total_quantity || p.current_stock || 0
    const minLevel = (p.product?.min_stock_level || p.min_stock_level || 5)
    return qty > 0 && qty <= minLevel
  }).length
  
  const outOfStockCount = safeProducts.filter((p) => {
    const qty = p.total_quantity || p.current_stock || 0
    return qty === 0
  }).length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Boxes className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total produits</p>
                <p className="text-xl font-bold">{safeProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valeur stock</p>
                <p className="text-xl font-bold">
                  {new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(totalValue)} XOF
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock faible</p>
                <p className="text-xl font-bold">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rupture</p>
                <p className="text-xl font-bold">{outOfStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product, index) => {
          const productData = product.product || product
          const qty = product.total_quantity || product.current_stock || 0
          const minLevel = productData.min_stock_level || product.min_stock_level || 5
          const stockPercent = Math.min(100, (qty / (minLevel * 3)) * 100)
          const isLow = qty > 0 && qty <= minLevel
          const isOut = qty === 0

          return (
            <Card key={product.id || index} className="border-border">
              <CardContent className="p-4">
                <div className="flex gap-3 mb-3">
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {productData.image_url && (productData.image_url.startsWith('data:') || productData.image_url.startsWith('http')) ? (
                      <img
                        src={productData.image_url}
                        alt={productData.name_fr || productData.name_en}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image failed to load:', productData.image_url)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : null}
                    {!productData.image_url || (!productData.image_url.startsWith('data:') && !productData.image_url.startsWith('http')) ? (
                      <Package className="w-8 h-8 text-muted-foreground" />
                    ) : null}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{productData.name_fr || productData.name_en}</p>
                        <p className="text-xs text-muted-foreground font-mono">{productData.code}</p>
                      </div>
                      {isOut ? (
                        <Badge variant="destructive">Rupture</Badge>
                      ) : isLow ? (
                        <Badge className="bg-warning text-warning-foreground">Faible</Badge>
                      ) : (
                        <Badge variant="secondary">OK</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantité</span>
                    <span className="font-semibold">{qty} unités</span>
                  </div>
                  <Progress
                    value={stockPercent}
                    className={`h-2 ${isOut ? "[&>div]:bg-destructive" : isLow ? "[&>div]:bg-warning" : ""}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Seuil: {minLevel}</span>
                    <span>{productData.category?.name_fr || product.category?.name_fr || "Sans catégorie"}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleAdjust(productData.id, 1, qty)} disabled={qty >= 100}>
                    <Plus className="w-3 h-3 mr-1" />+1
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleAdjust(productData.id, 10, qty)} disabled={qty >= 100}>
                    <Plus className="w-3 h-3 mr-1" />+10
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleAdjust(productData.id, -1, qty)} disabled={qty <= 0}>
                    <Minus className="w-3 h-3 mr-1" />-1
                  </Button>
                  <Dialog open={adjustDialogOpen === productData.id} onOpenChange={(open) => setAdjustDialogOpen(open ? productData.id : null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary" className="flex-1">Ajuster</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajuster le stock</DialogTitle>
                        <DialogDescription>{productData.name_fr || productData.name_en}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label>Quantité (+ pour ajout, - pour retrait)</Label>
                          <Input type="number" value={adjustQuantity} onChange={(e) => setAdjustQuantity(e.target.value)} placeholder="Ex: +50 ou -10" />
                        </div>
                        <div>
                          <Label>Raison</Label>
                          <Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Raison de l'ajustement" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAdjustDialogOpen(null)}>Annuler</Button>
                        <Button onClick={() => handleAdjust(productData.id, Number(adjustQuantity), qty)} disabled={!adjustQuantity}>Confirmer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
