"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductGridProps {
  products: any[]
  viewMode: "grid" | "list"
  onAddToCart: (product: any) => void
  currency: any
}

export function ProductGrid({ products, viewMode, onAddToCart, currency }: ProductGridProps) {
  const formatPrice = (price: number) => {
    const converted = price * (currency?.exchange_rate || 1)
    return new Intl.NumberFormat("fr-FR").format(converted)
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Package className="w-12 h-12 mb-4" />
        <p>Aucun produit trouvé</p>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.sku}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-primary">
                  {formatPrice(product.price)} {currency?.code}
                </p>
                <p className="text-xs text-muted-foreground">Stock: {product.stock_quantity}</p>
              </div>
              <Button size="sm" onClick={() => onAddToCart(product)} disabled={product.stock_quantity === 0}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <Card
          key={product.id}
          className={cn(
            "p-3 cursor-pointer border-border hover:border-primary/50 transition-colors",
            product.stock_quantity === 0 && "opacity-50",
          )}
          onClick={() => product.stock_quantity > 0 && onAddToCart(product)}
        >
          <div className="aspect-square rounded-lg bg-muted mb-3 flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm truncate">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.sku}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-primary text-sm">
                {formatPrice(product.price)} {currency?.code}
              </span>
              {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                <Badge variant="outline" className="text-warning border-warning text-xs">
                  {product.stock_quantity}
                </Badge>
              )}
              {product.stock_quantity === 0 && (
                <Badge variant="destructive" className="text-xs">
                  Rupture
                </Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
