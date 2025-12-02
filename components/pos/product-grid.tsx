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
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {product.image_url?.startsWith('http') ? (
                  <img
                    src={product.image_url}
                    alt={product.name_fr || product.name_en}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : product.image_url?.startsWith('data:') ? (
                  <img
                    src={product.image_url}
                    alt={product.name_fr || product.name_en}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : product.image_url ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/images/${product.image_url.split('/').pop()}`}
                    alt={product.name_fr || product.name_en}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : null}
                <Package className={cn("w-6 h-6 text-muted-foreground", !product.image_url && "block")} />
              </div>
              <div>
                <p className="font-medium text-sm">{product.name_fr || product.name_en}</p>
                <p className="text-xs text-muted-foreground">{product.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-primary">
                  {formatPrice(product.selling_price_xof || 0)} {currency?.code}
                </p>
                <p className="text-xs text-muted-foreground">Stock: {product.current_stock || 0}</p>
              </div>
              <Button size="sm" onClick={() => onAddToCart(product)} disabled={(product.current_stock || 0) === 0}>
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
            (product.current_stock || 0) === 0 && "opacity-50",
          )}
          onClick={() => (product.current_stock || 0) > 0 && onAddToCart(product)}
        >
          <div className="aspect-square rounded-lg bg-muted mb-3 flex items-center justify-center overflow-hidden">
            {product.image_url?.startsWith('http') ? (
              <img
                src={product.image_url}
                alt={product.name_fr || product.name_en}
                className="w-full h-full object-cover"
              />
            ) : product.image_url?.startsWith('data:') ? (
              <img
                src={product.image_url}
                alt={product.name_fr || product.name_en}
                className="w-full h-full object-cover"
              />
            ) : product.image_url ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/images/${product.image_url.split('/').pop()}`}
                alt={product.name_fr || product.name_en}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : null}
            <Package className={cn("w-10 h-10 text-muted-foreground", !product.image_url && "block")} />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm truncate">{product.name_fr || product.name_en}</p>
            <p className="text-xs text-muted-foreground">{product.code}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-primary text-sm">
                {formatPrice(product.selling_price_xof || 0)} {currency?.code}
              </span>
              {(product.current_stock || 0) <= 5 && (product.current_stock || 0) > 0 && (
                <Badge variant="outline" className="text-warning border-warning text-xs">
                  {product.current_stock}
                </Badge>
              )}
              {(product.current_stock || 0) === 0 && (
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
