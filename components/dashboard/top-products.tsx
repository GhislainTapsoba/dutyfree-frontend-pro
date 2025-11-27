"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Loader2 } from "lucide-react"
import { reportsService } from "@/lib/api"

interface ProductData {
  name: string
  sales: number
  revenue: number
}

export function TopProducts() {
  const [topProducts, setTopProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTopProducts() {
      try {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30) // Last 30 days

        const response = await reportsService.getProductsReport({
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          limit: 5,
        })

        if (response.data && Array.isArray(response.data)) {
          const products = response.data.map((item: any) => ({
            name: item.product_name || item.name || "Produit inconnu",
            sales: Number(item.quantity_sold || item.sales || 0),
            revenue: Number(item.total_revenue || item.revenue || 0),
          }))
          setTopProducts(products)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des top produits:", error)
        setTopProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadTopProducts()
  }, [])

  if (loading) {
    return (
      <Card className="bg-card border-border h-full">
        <CardContent className="flex items-center justify-center h-[380px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  const maxRevenue = topProducts.length > 0 ? Math.max(...topProducts.map((p) => p.revenue)) : 1

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Top produits</CardTitle>
        <Package className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {topProducts.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible
          </div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, index) => (
            <div key={product.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">#{index + 1}</span>
                  <span className="text-sm font-medium truncate max-w-[140px]">{product.name}</span>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(product.revenue)}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                />
              </div>
            </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
