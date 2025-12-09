"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Loader2 } from "lucide-react"
import { reportsService } from "@/lib/api"

interface ChartData {
  name: string
  value: number
}

export function SalesChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadChartData() {
      try {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 6) // Last 7 days

        console.log('Requesting sales from', startDate.toISOString().split("T")[0], 'to', endDate.toISOString().split("T")[0])

        const response = await reportsService.getSalesReport({
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          group_by: "day",
        })

        console.log('Sales chart response:', response)

        // Essayer plusieurs formats de réponse
        let chartData: ChartData[] = []
        const apiData = response.data || response
        
        if (apiData.grouped_data && Array.isArray(apiData.grouped_data) && apiData.grouped_data.length > 0) {
          console.log('Using grouped_data:', apiData.grouped_data)
          chartData = apiData.grouped_data.map((item: any) => {
            // Parser la date en local (pas UTC)
            const [year, month, day] = item.date.split('-').map(Number)
            const date = new Date(year, month - 1, day)
            console.log('Date parsed:', item.date, '->', date.toLocaleDateString('fr-FR'))
            return {
              name: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
              value: Number(item.revenue || 0),
            }
          })
        } else if (apiData.raw_data && Array.isArray(apiData.raw_data)) {
          console.log('Using raw_data, count:', apiData.raw_data.length)
          // Fallback: grouper manuellement par jour
          const grouped: Record<string, { dateStr: string, value: number }> = {}
          
          apiData.raw_data.forEach((item: any) => {
            const dateStr = item.sale_date?.split('T')[0] || item.created_at?.split('T')[0]
            if (!dateStr) return
            
            if (!grouped[dateStr]) {
              grouped[dateStr] = { dateStr, value: 0 }
            }
            grouped[dateStr].value += Number(item.total_ttc || 0)
          })
          
          chartData = Object.values(grouped)
            .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
            .map(item => {
              const [year, month, day] = item.dateStr.split('-').map(Number)
              const date = new Date(year, month - 1, day)
              return {
                name: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                value: item.value
              }
            })
        }
        
        console.log('Final chart data:', chartData)
        setData(chartData)
      } catch (error) {
        console.error("Erreur lors du chargement du graphique:", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    loadChartData()
  }, [])

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center h-[380px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 h-full shadow-lg">
        <CardContent className="flex items-center justify-center h-[380px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.value, 0)
  const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Évolution des ventes
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">7 derniers jours</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Moyenne</p>
          <p className="text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
            {new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(avgRevenue)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
            <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
            <p>Aucune donnée disponible</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="40%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number) => [`${new Intl.NumberFormat("fr-FR").format(value)} FCFA`, "Chiffre d'affaires"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
                dot={{ fill: "#10b981", strokeWidth: 2, r: 5, stroke: "#fff" }}
                activeDot={{ r: 7, strokeWidth: 3, fill: "#10b981", stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        )}
      </CardContent>
    </Card>
  )
}
