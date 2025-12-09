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

interface ReportsDashboardProps{
  salesData: any
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
  const safeSalesData = Array.isArray(salesData) ? salesData : (Array.isArray((salesData as any)?.raw_data) ? (salesData as any).raw_data : [])
  const safePaymentData = Array.isArray(paymentData) ? paymentData : []
  const safeTopProducts = Array.isArray(topProducts) ? topProducts : []
  const safeSalesByCategory = Array.isArray(salesByCategory) ? salesByCategory : []
  const safeCashierStats = Array.isArray(cashierStats) ? cashierStats : []

  // Calculate KPIs from summary data passed as props
  const totalRevenue = (salesData as any)?.summary?.total_revenue_ttc || (safeSalesData.reduce((sum, s) => sum + Number(s.total_ttc || s.total_amount || 0), 0))
  const ticketCount = (salesData as any)?.summary?.ticket_count || safeSalesData.length
  const avgTicket = (salesData as any)?.summary?.average_ticket || (ticketCount > 0 ? totalRevenue / ticketCount : 0)

  // Group sales by day for chart
  const salesByDay = safeSalesData.reduce((acc: any, sale) => {
    const dateStr = sale.sale_date || sale.created_at
    if (!dateStr) return acc
    const day = new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
    acc[day] = (acc[day] || 0) + Number(sale.total_ttc || sale.total_amount || 0)
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

  const COLORS = [
    "#10B981", // Vert émeraude - Espèces
    "#3B82F6", // Bleu - Carte
    "#F59E0B", // Orange - Mobile Money
    "#8B5CF6", // Violet - TPE
    "#EF4444", // Rouge - Autre
    "#06B6D4", // Cyan
  ]

  // Calculate top selling products - data already formatted from API
  const productSales = safeTopProducts.reduce((acc: any, item) => {
    const name = item.name || item.products?.name_fr || item.products?.name || "Inconnu"
    if (!acc[name]) {
      acc[name] = { name, quantity: 0, revenue: 0 }
    }
    acc[name].quantity += Number(item.quantity || 0)
    acc[name].revenue += Number(item.revenue || item.total_price || 0)
    return acc
  }, {})

  const topProductsList = Object.values(productSales)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10) as any[]

  const handleExport = async (format: string) => {
    setExporting(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      
      if (format === 'pdf') {
        // Générer PDF côté client
        const { default: jsPDF } = await import('jspdf')
        const autoTable = (await import('jspdf-autotable')).default
        
        const doc = new jsPDF()
        
        doc.setFontSize(16)
        doc.text('Rapport des Ventes', 105, 15, { align: 'center' } as any)
        doc.setFontSize(10)
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 22, { align: 'center' } as any)
        
        const tableData = safeSalesData.slice(0, 50).map(sale => [
          sale.ticket_number,
          new Date(sale.sale_date).toLocaleDateString('fr-FR'),
          sale.total_ttc?.toFixed(2) || '0',
          sale.tax_amount?.toFixed(2) || '0',
          sale.discount_amount?.toFixed(2) || '0',
          sale.currency_code,
          sale.status,
          sale.users ? `${sale.users.first_name} ${sale.users.last_name}` : '',
          sale.point_of_sales?.name || sale.point_of_sale?.name || ''
        ])
        
        autoTable(doc, {
          startY: 30,
          head: [['Ticket', 'Date', 'Montant TTC', 'TVA', 'Remise', 'Devise', 'Statut', 'Caissier', 'Point de vente']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 6 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 20 },
            2: { cellWidth: 20 },
            3: { cellWidth: 15 },
            4: { cellWidth: 15 },
            5: { cellWidth: 15 },
            6: { cellWidth: 20 },
            7: { cellWidth: 25 },
            8: { cellWidth: 30 }
          }
        })
        
        if (safeSalesData.length > 50) {
          doc.text(`... et ${safeSalesData.length - 50} autres ventes`, 105, (doc as any).lastAutoTable.finalY + 10, { align: 'center' } as any)
        }
        
        doc.save(`rapport-ventes-${period}.pdf`)
      } else {
        const response = await fetch(`${API_URL}/reports/export?type=sales&format=${format}&start_date=${startOfMonth}&end_date=${endOfMonth}`)
        
        if (!response.ok) {
          throw new Error('Erreur lors de l\'export')
        }
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `rapport-ventes-${period}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Export error:", error)
      alert('Erreur lors de l\'export. Veuillez réessayer.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header avec gradient moderne */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Rapports & Analytics</h1>
            <p className="text-white/90 text-lg">Analyse détaillée de votre activité Duty Free</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px] bg-white/10 backdrop-blur-md border-white/20 text-white">
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
            <Button 
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20" 
              variant="outline" 
              onClick={() => handleExport("csv")} 
              disabled={exporting}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button 
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20" 
              variant="outline" 
              onClick={() => handleExport("pdf")} 
              disabled={exporting}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards avec Design Moderne */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                CA
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
              <p className="text-3xl font-bold">{new Intl.NumberFormat("fr-FR").format(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">XOF sur la période</p>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium">+12.5%</span>
              <span className="text-muted-foreground">vs précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Receipt className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                Tickets
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Tickets émis</p>
              <p className="text-3xl font-bold">{ticketCount}</p>
              <p className="text-xs text-muted-foreground">transactions totales</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <BarChart3 className="w-6 h-6 text-violet-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                Moyen
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Ticket moyen</p>
              <p className="text-3xl font-bold">{new Intl.NumberFormat("fr-FR").format(Math.round(avgTicket))}</p>
              <p className="text-xs text-muted-foreground">XOF par transaction</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                Taux
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Taux de capture</p>
              <p className="text-3xl font-bold">
                {(salesData as any)?.kpis?.capture_rate 
                  ? `${((salesData as any).kpis.capture_rate * 100).toFixed(1)}%`
                  : "--"}
              </p>
              <p className="text-xs text-muted-foreground">
                {(salesData as any)?.kpis?.capture_rate ? "clients convertis" : "données passagers manquantes"}
              </p>
            </div>
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
            <CardContent className="p-6">
              <div className="w-full" style={{ height: '350px', minHeight: '350px' }}>
                {chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Aucune donnée disponible pour la période sélectionnée
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                    <YAxis
                      stroke="#6B7280"
                      fontSize={12}
                      tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      }}
                      formatter={(value: number) => [`${new Intl.NumberFormat("fr-FR").format(value)} XOF`, "CA"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#2563EB"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                )}
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
            <CardContent className="p-6">
              <div className="w-full" style={{ height: '400px', minHeight: '400px' }}>
                {topProductsList.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Aucune donnée disponible pour la période sélectionnée
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProductsList} layout="vertical">
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                    <XAxis
                      type="number"
                      stroke="#6B7280"
                      fontSize={12}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#6B7280"
                      fontSize={11}
                      width={150}
                      tickFormatter={(v) => (v.length > 20 ? v.substring(0, 20) + "..." : v)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      }}
                      formatter={(value: number) => [`${new Intl.NumberFormat("fr-FR").format(value)} XOF`, "CA"]}
                    />
                    <Bar dataKey="revenue" fill="url(#colorBar)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                )}
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
              <CardContent className="p-6">
                <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
                  {pieData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Aucune donnée disponible pour la période sélectionnée
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke="#FFFFFF"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        }}
                        formatter={(value: number) => [`${new Intl.NumberFormat("fr-FR").format(value)} XOF`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  )}
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
                    const revenue = cashier.total_revenue || 0
                    const ticketsCount = cashier.sales_count || 0
                    const avgTicket = cashier.average_ticket || 0
                    const initials = cashier.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??'

                    return (
                      <div
                        key={cashier.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium">{cashier.name}</p>
                            <p className="text-sm text-muted-foreground">{ticketsCount} tickets</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{new Intl.NumberFormat("fr-FR").format(revenue)} XOF</p>
                          <p className="text-xs text-muted-foreground">
                            Moy: {new Intl.NumberFormat("fr-FR").format(avgTicket)} XOF/ticket
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
