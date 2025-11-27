"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp, Download, Calendar, Receipt, Users, BarChart3 } from "lucide-react"

interface ReportsDashboardProps {
  salesData: any[]
  paymentData: any[]
  topProducts: any[]
  salesByCategory: any[]
  cashierStats: any[]
}

export function ReportsDashboard({
  salesData,
  paymentData,
  topProducts,
  salesByCategory,
  cashierStats,
}: ReportsDashboardProps) {
  const [period, setPeriod] = useState("month")
  const [exporting, setExporting] = useState(false)

  // Ensure all data are arrays
  const safeSalesData = Array.isArray(salesData) ? salesData : []
  const safePaymentData = Array.isArray(paymentData) ? paymentData : []
  const safeTopProducts = Array.isArray(topProducts) ? topProducts : []
  const safeSalesByCategory = Array.isArray(salesByCategory) ? salesByCategory : []
  const safeCashierStats = Array.isArray(cashierStats) ? cashierStats : []

  // Calculate KPIs
  const totalRevenue = safeSalesData.reduce((sum, s) => sum + Number(s.total_amount), 0)
  const ticketCount = safeSalesData.length
  const avgTicket = ticketCount > 0 ? totalRevenue / ticketCount : 0

  // Group sales by day for chart
  const salesByDay = safeSalesData.reduce((acc: any, sale) => {
    const day = new Date(sale.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
    acc[day] = (acc[day] || 0) + Number(sale.total_amount)
    return acc
  }, {})

  const chartData = Object.entries(salesByDay).map(([day, value]) => ({
    name: day,
    value: value as number,
  }))

  // Group payments by method
  const paymentsByMethod = safePaymentData.reduce((acc: any, payment) => {
    const method = payment.payment_methods?.name || "Autre"
    acc[method] = (acc[method] || 0) + Number(payment.amount)
    return acc
  }, {})

  const pieData = Object.entries(paymentsByMethod).map(([name, value]) => ({
    name,
    value: value as number,
  }))

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

  // Calculate top selling products
  const productSales = safeTopProducts.reduce((acc: any, item) => {
    const name = item.products?.name || "Inconnu"
    if (!acc[name]) {
      acc[name] = { name, quantity: 0, revenue: 0 }
    }
    acc[name].quantity += item.quantity
    acc[name].revenue += Number(item.total_price)
    return acc
  }, {})

  const topProductsList = Object.values(productSales)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10) as any[]

  const handleExport = async (format: string) => {
    setExporting(true)
    try {
      const response = await fetch(`/api/reports/export?format=${format}&period=${period}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rapport-${period}.${format}`
      a.click()
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rapports & Analytics</h1>
          <p className="text-muted-foreground">Analyse détaillée de votre activité Duty Free</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px] bg-secondary border-border">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport("csv")} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold mt-1">{new Intl.NumberFormat("fr-FR").format(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">XOF</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium">+12.5%</span>
              <span className="text-muted-foreground">vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets émis</p>
                <p className="text-2xl font-bold mt-1">{ticketCount}</p>
                <p className="text-xs text-muted-foreground mt-1">transactions</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket moyen</p>
                <p className="text-2xl font-bold mt-1">
                  {new Intl.NumberFormat("fr-FR").format(Math.round(avgTicket))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">XOF / ticket</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de capture</p>
                <p className="text-2xl font-bold mt-1">--</p>
                <p className="text-xs text-muted-foreground mt-1">passagers</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-chart-5/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-chart-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Données passagers non renseignées</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different reports */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="cashiers">Caissiers</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Évolution du chiffre d'affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${new Intl.NumberFormat("fr-FR").format(value)} XOF`, "CA"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Top 10 produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsList} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      width={150}
                      tickFormatter={(v) => (v.length > 20 ? v.substring(0, 20) + "..." : v)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${new Intl.NumberFormat("fr-FR").format(value)} XOF`, "CA"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Répartition par mode de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${new Intl.NumberFormat("fr-FR").format(value)} XOF`]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Détail par méthode</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pieData.map((method, index) => {
                    const total = pieData.reduce((sum, m) => sum + m.value, 0)
                    const percent = total > 0 ? (method.value / total) * 100 : 0
                    return (
                      <div key={method.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{method.name}</span>
                          </div>
                          <span className="font-semibold">
                            {new Intl.NumberFormat("fr-FR").format(method.value)} XOF
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{percent.toFixed(1)}%</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cashiers Tab */}
        <TabsContent value="cashiers" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Performance par caissier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeCashierStats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
                ) : (
                  safeCashierStats.slice(0, 10).map((cashier) => {
                    const cashierSales = Array.isArray(cashier.sales) ? cashier.sales : []
                    const revenue = cashierSales.reduce((sum: number, s: any) => sum + Number(s.total_amount), 0)
                    const ticketsCount = cashierSales.length

                    return (
                      <div
                        key={cashier.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                            {cashier.first_name?.[0]}
                            {cashier.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium">
                              {cashier.first_name} {cashier.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{ticketsCount} tickets</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{new Intl.NumberFormat("fr-FR").format(revenue)} XOF</p>
                          <p className="text-xs text-muted-foreground">
                            Moy: {new Intl.NumberFormat("fr-FR").format(ticketsCount > 0 ? revenue / ticketsCount : 0)}{" "}
                            XOF/ticket
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
