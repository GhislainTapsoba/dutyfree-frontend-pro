"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ShoppingCart, Package, TrendingDown } from "lucide-react"

interface InventoryAlertsProps {
  products: any[]
}

export function InventoryAlerts({ products }: InventoryAlertsProps) {
  const safeProducts = Array.isArray(products) ? products : []
  
  // Map to correct field names from stock API
  const outOfStock = safeProducts.filter((p) => {
    const qty = p.total_quantity || p.current_stock || p.stock_quantity || 0
    return qty === 0
  })
  
  const lowStock = safeProducts.filter((p) => {
    const qty = p.total_quantity || p.current_stock || p.stock_quantity || 0
    const minLevel = p.product?.min_stock_level || p.min_stock_level || 5
    return qty > 0 && qty <= minLevel
  })

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total produits</p>
                <p className="text-2xl font-bold">{safeProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rupture de stock</p>
                <p className="text-2xl font-bold">{outOfStock.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock faible</p>
                <p className="text-2xl font-bold">{lowStock.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No Alerts */}
      {outOfStock.length === 0 && lowStock.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune alerte de stock</h3>
            <p className="text-muted-foreground">Tous les produits ont des niveaux de stock satisfaisants</p>
          </CardContent>
        </Card>
      )}

      {/* Out of Stock */}
      {outOfStock.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-3 border-b border-destructive/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div>Rupture de stock</div>
                <p className="text-sm font-normal text-muted-foreground">{outOfStock.length} produit(s) à réapprovisionner</p>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {outOfStock.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Aucun produit en rupture</p>
            </div>
          ) : (
            <div className="space-y-2">
              {outOfStock.map((product) => {
                const productData = product.product || product
                const name = productData.name_fr || productData.name_en || productData.name || 'Produit sans nom'
                const code = productData.code || productData.sku || 'N/A'
                const category = productData.category?.name_fr || 'Non catégorisé'
                
                return (
                  <div
                    key={product.id || Math.random()}
                    className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-destructive/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{code}</span>
                          <span>•</span>
                          <span>{category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="font-mono">0 unités</Badge>
                      <Button size="sm" variant="outline">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Commander
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Low Stock */}
      {lowStock.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
        <CardHeader className="pb-3 border-b border-warning/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-warning">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div>Stock faible</div>
                <p className="text-sm font-normal text-muted-foreground">{lowStock.length} produit(s) sous le seuil minimum</p>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {lowStock.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Aucun produit en stock faible</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStock.map((product) => {
                const productData = product.product || product
                const name = productData.name_fr || productData.name_en || productData.name || 'Produit sans nom'
                const code = productData.code || productData.sku || 'N/A'
                const category = productData.category?.name_fr || 'Non catégorisé'
                const qty = product.total_quantity || product.current_stock || product.stock_quantity || 0
                const minLevel = productData.min_stock_level || product.min_stock_level || 5
                
                return (
                  <div
                    key={product.id || Math.random()}
                    className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-warning/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{code}</span>
                          <span>•</span>
                          <span>{category}</span>
                          <span>•</span>
                          <span>Seuil: {minLevel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-warning/10 text-warning border-warning/20 font-mono">
                        {qty} unités
                      </Badge>
                      <Button size="sm" variant="outline">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Commander
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  )
}
