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
  const getPrice = (product: any) => {
    if (!currency) return product.selling_price_xof || 0
    
    switch (currency.code) {
      case 'EUR':
        return product.selling_price_eur || (product.selling_price_xof / 655.957)
      case 'USD':
        return product.selling_price_usd || (product.selling_price_xof / 600)
      case 'XOF':
      default:
        return product.selling_price_xof || 0
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: currency?.code === 'XOF' ? 0 : 2,
      maximumFractionDigits: currency?.code === 'XOF' ? 0 : 2
    }).format(price)
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
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50 hover:border-primary/50 hover:shadow-md transition-all hover:-translate-y-0.5"
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
                  {formatPrice(getPrice(product))} {currency?.code}
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
            "p-3 cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-lg transition-all hover:-translate-y-1",
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
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 text-sm">
                {formatPrice(getPrice(product))} {currency?.code}
              </span>
              {(product.current_stock || 0) <= 5 && (product.current_stock || 0) > 0 && (
                <Badge variant="outline" className="text-orange-600 border-orange-600/50 bg-orange-50 text-xs shadow-sm">
                  {product.current_stock}
                </Badge>
              )}
              {(product.current_stock || 0) === 0 && (
                <Badge className="text-xs bg-gradient-to-r from-destructive to-destructive/80 shadow-sm">
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
