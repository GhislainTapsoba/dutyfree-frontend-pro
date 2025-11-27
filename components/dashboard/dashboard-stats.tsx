import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Receipt, Package, AlertTriangle } from "lucide-react"

interface DashboardStatsProps {
  todayRevenue: number
  ticketCount: number
  totalProducts: number
  lowStockCount: number
}

export function DashboardStats({ todayRevenue, ticketCount, totalProducts, lowStockCount }: DashboardStatsProps) {
  const stats = [
    {
      title: "CA du jour",
      value: new Intl.NumberFormat("fr-FR").format(todayRevenue),
      suffix: "XOF",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Tickets émis",
      value: ticketCount.toString(),
      suffix: "aujourd'hui",
      icon: Receipt,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Produits actifs",
      value: totalProducts.toString(),
      suffix: "références",
      icon: Package,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      title: "Alertes stock",
      value: lowStockCount.toString(),
      suffix: "produits",
      icon: AlertTriangle,
      color: lowStockCount > 0 ? "text-destructive" : "text-muted-foreground",
      bgColor: lowStockCount > 0 ? "bg-destructive/10" : "bg-muted/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.suffix}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
