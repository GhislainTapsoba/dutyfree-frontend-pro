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

        const response = await reportsService.getSalesReport({
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          period: "daily",
        })

        if (response.data && Array.isArray(response.data)) {
          const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
          const chartData = response.data.map((item: any) => {
            const date = new Date(item.period || item.date)
            return {
              name: dayNames[date.getDay()],
              value: Number(item.total_revenue || item.revenue || 0),
            }
          })
          setData(chartData)
        }
      } catch (error) {
        console.error("Erreur lors du chargement du graphique:", error)
        // Fallback to empty data
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
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">Évolution des ventes</CardTitle>
          <p className="text-sm text-muted-foreground">Cette semaine</p>
        </div>
        <TrendingUp className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`${new Intl.NumberFormat("fr-FR").format(value)} XOF`, "CA"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        )}
      </CardContent>
    </Card>
  )
}
