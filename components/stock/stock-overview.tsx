"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Package, AlertTriangle, TrendingDown, Boxes } from "lucide-react"

interface StockOverviewProps {
  products: any[]
}

export function StockOverview({ products }: StockOverviewProps) {
  const [search, setSearch] = useState("")

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : []

  const filteredProducts = safeProducts.filter(
    (p) => (p.name_fr || p.name_en || '').toLowerCase().includes(search.toLowerCase()) || p.code?.toLowerCase().includes(search.toLowerCase()),
  )

  const totalValue = safeProducts.reduce((sum, p) => sum + Number(p.selling_price_xof || 0) * (p.current_stock || 0), 0)
  const lowStockCount = safeProducts.filter((p) => (p.current_stock || 0) <= (p.min_stock_level || 0) && (p.current_stock || 0) > 0).length
  const outOfStockCount = safeProducts.filter((p) => (p.current_stock || 0) === 0).length

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
        {filteredProducts.map((product) => {
          const stockPercent = Math.min(100, ((product.current_stock || 0) / ((product.min_stock_level || 1) * 3)) * 100)
          const isLow = (product.current_stock || 0) <= (product.min_stock_level || 0)
          const isOut = (product.current_stock || 0) === 0

          return (
            <Card key={product.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{product.name_fr || product.name_en}</p>
                    <p className="text-xs text-muted-foreground font-mono">{product.code}</p>
                  </div>
                  {isOut ? (
                    <Badge variant="destructive">Rupture</Badge>
                  ) : isLow ? (
                    <Badge className="bg-warning text-warning-foreground">Faible</Badge>
                  ) : (
                    <Badge variant="secondary">OK</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantité</span>
                    <span className="font-semibold">{product.current_stock || 0} unités</span>
                  </div>
                  <Progress
                    value={stockPercent}
                    className={`h-2 ${isOut ? "[&>div]:bg-destructive" : isLow ? "[&>div]:bg-warning" : ""}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Seuil: {product.min_stock_level || 0}</span>
                    <span>{product.category?.name_fr || "Non catégorisé"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
