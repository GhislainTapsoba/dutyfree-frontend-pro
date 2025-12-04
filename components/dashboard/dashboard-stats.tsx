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
      suffix: "FCFA",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      trend: "+12.5%"
    },
    {
      title: "Tickets émis",
      value: ticketCount.toString(),
      suffix: "ventes",
      icon: Receipt,
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      trend: "+8.2%"
    },
    {
      title: "Produits actifs",
      value: totalProducts.toString(),
      suffix: "références",
      icon: Package,
      gradient: "from-violet-500 to-purple-500",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
      trend: "Actif"
    },
    {
      title: "Alertes stock",
      value: lowStockCount.toString(),
      suffix: lowStockCount > 1 ? "produits" : "produit",
      icon: AlertTriangle,
      gradient: lowStockCount > 0 ? "from-orange-500 to-red-500" : "from-gray-400 to-gray-500",
      iconBg: lowStockCount > 0 ? "bg-orange-500/10" : "bg-gray-500/10",
      iconColor: lowStockCount > 0 ? "text-orange-600" : "text-gray-600",
      trend: lowStockCount > 0 ? "Attention" : "OK"
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          {/* Gradient Background */}
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient}`} />

          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center ring-4 ring-background shadow-sm`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${stat.gradient} text-white shadow-sm`}>
                {stat.trend}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className="text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.suffix}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
