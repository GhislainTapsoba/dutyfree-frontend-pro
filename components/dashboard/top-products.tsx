"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Loader2, TrendingUp, Award } from "lucide-react"
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
      <Card className="bg-card border-border/50 h-full">
        <CardContent className="flex items-center justify-center h-[380px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  const maxRevenue = topProducts.length > 0 ? Math.max(...topProducts.map((p) => p.revenue)) : 1

  const gradients = [
    "from-yellow-400 to-orange-500",
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600",
    "from-green-400 to-green-600",
    "from-pink-400 to-pink-600",
  ]

  const medals = [
    { icon: Award, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { icon: Award, color: "text-gray-400", bg: "bg-gray-400/10" },
    { icon: Award, color: "text-orange-600", bg: "bg-orange-600/10" },
    { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
  ]

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 h-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          Top Produits
        </CardTitle>
        <span className="text-xs text-muted-foreground">30 derniers jours</span>
      </CardHeader>
      <CardContent>
        {topProducts.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
            <Package className="w-16 h-16 mb-4 opacity-20" />
            <p>Aucune donnée disponible</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, index) => {
              const Icon = medals[index]?.icon || TrendingUp
              return (
                <div
                  key={product.name}
                  className="group p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${medals[index]?.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${medals[index]?.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} ventes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(product.revenue)}
                      </p>
                      <p className="text-xs text-muted-foreground">FCFA</p>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${gradients[index]} rounded-full transition-all duration-500 group-hover:scale-x-105`}
                      style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
