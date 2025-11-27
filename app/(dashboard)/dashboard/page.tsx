"use client"

import { useEffect, useState } from "react"
import { salesService, stockService, productsService, reportsService } from "@/lib/api"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { StockAlerts } from "@/components/dashboard/stock-alerts"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    ticketCount: 0,
    totalProducts: 0,
    lowStockCount: 0,
  })
  const [recentSales, setRecentSales] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      try {
        const today = new Date().toISOString().split("T")[0]

        const [salesRes, stockRes, productsRes, kpisRes] = await Promise.all([
          salesService.getSales({ start_date: today, end_date: today }),
          stockService.getStock({ needs_reorder: true }),
          productsService.getProducts({ is_active: true }),
          reportsService.getKPIs({ start_date: today, end_date: today }),
        ])

        // Calculate stats
        let todayRevenue = 0
        let ticketCount = 0

        if (salesRes.data && Array.isArray(salesRes.data)) {
          setRecentSales(salesRes.data.slice(0, 5))
          todayRevenue = salesRes.data.reduce((sum: number, sale: any) => sum + Number(sale.final_amount || 0), 0)
          ticketCount = salesRes.data.length
        } else if (salesRes.data) {
          // Si data n'est pas un tableau, c'est peut-être un objet de rapport
          setRecentSales([])
          todayRevenue = 0
          ticketCount = 0
        }

        if (stockRes.data && Array.isArray(stockRes.data)) {
          setLowStockProducts(stockRes.data.slice(0, 5))
        } else {
          setLowStockProducts([])
        }

        setStats({
          todayRevenue,
          ticketCount,
          totalProducts: productsRes.data?.length || 0,
          lowStockCount: stockRes.data?.length || 0,
        })
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité Duty Free</p>
      </div>

      <DashboardStats
        todayRevenue={stats.todayRevenue}
        ticketCount={stats.ticketCount}
        totalProducts={stats.totalProducts}
        lowStockCount={stats.lowStockCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <TopProducts />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentSales sales={recentSales} />
        <StockAlerts products={lowStockProducts} />
      </div>
    </div>
  )
}
