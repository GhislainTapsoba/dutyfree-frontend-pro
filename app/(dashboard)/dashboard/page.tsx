"use client"

import { useEffect, useState } from "react"
import { salesService, stockService, productsService, reportsService } from "@/lib/api"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { StockAlerts } from "@/components/dashboard/stock-alerts"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { Loader2, Sparkles, TrendingUp, Users, Plane } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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
          todayRevenue = salesRes.data.reduce((sum: number, sale: any) => sum + Number(sale.total_ttc || sale.final_amount || 0), 0)
          ticketCount = salesRes.data.length
        } else if (salesRes.data) {
          setRecentSales([])
          todayRevenue = 0
          ticketCount = 0
        }

        if (stockRes.data && Array.isArray(stockRes.data)) {
          const uniqueProducts = stockRes.data.filter((p, index, self) =>
            p && p.product_id && self.findIndex(t => t && t.product_id === p.product_id) === index
          )
          setLowStockProducts(uniqueProducts.slice(0, 5))
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Bonjour"
    if (hour < 18) return "Bon après-midi"
    return "Bonsoir"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Plane className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{getGreeting()} !</h1>
                  <p className="text-white/90">Bienvenue au Duty Free de Ouagadougou</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4" />
                  <span className="capitalize">{formatDate(currentTime)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-mono text-lg font-semibold">
                  {formatTime(currentTime)}
                </div>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Ventes aujourd'hui</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.ticketCount}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
                    <Users className="w-3 h-3" />
                    <span>Produits actifs</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards with Colors */}
      <DashboardStats
        todayRevenue={stats.todayRevenue}
        ticketCount={stats.ticketCount}
        totalProducts={stats.totalProducts}
        lowStockCount={stats.lowStockCount}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Chart */}
          <SalesChart />

          {/* Recent Sales */}
          <RecentSales sales={recentSales} />
        </div>

        <div className="space-y-6">
          {/* Top Products */}
          <TopProducts />

          {/* Stock Alerts */}
          <StockAlerts products={lowStockProducts} />
        </div>
      </div>
    </div>
  )
}
