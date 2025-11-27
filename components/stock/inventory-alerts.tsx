"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ShoppingCart, Package } from "lucide-react"

interface InventoryAlertsProps {
  products: any[]
}

export function InventoryAlerts({ products }: InventoryAlertsProps) {
  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : []
  const outOfStock = safeProducts.filter((p) => p.stock_quantity === 0)
  const lowStock = safeProducts.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 10)

  return (
    <div className="space-y-6">
      {/* Out of Stock */}
      <Card className="border-destructive/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Rupture de stock ({outOfStock.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {outOfStock.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucun produit en rupture</p>
          ) : (
            <div className="space-y-3">
              {outOfStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Commander
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock */}
      <Card className="border-warning/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            Stock faible ({lowStock.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStock.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucun produit en stock faible</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-warning/10 text-warning border-warning/20">
                      {product.stock_quantity} unités
                    </Badge>
                    <Button size="sm" variant="outline">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Commander
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
