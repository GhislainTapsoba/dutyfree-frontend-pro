import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, Clock, CreditCard, Banknote, CheckCircle2, ShoppingCart } from "lucide-react"

interface RecentSalesProps {
  sales: any[]
}

export function RecentSales({ sales }: RecentSalesProps) {
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPaymentIcon = (payments?: any[]) => {
    if (!payments || payments.length === 0) return Receipt
    const method = payments[0]?.payment_methods?.code || payments[0]?.payment_method
    switch (method) {
      case "card":
      case "CARD":
        return CreditCard
      case "cash":
      case "CASH":
        return Banknote
      default:
        return Receipt
    }
  }

  const getPaymentLabel = (payments?: any[]) => {
    if (!payments || payments.length === 0) return "N/A"
    const method = payments[0]?.payment_methods?.name || payments[0]?.payment_method
    if (method === "card" || method === "CARD") return "Carte"
    if (method === "cash" || method === "CASH") return "Espèces"
    return method || "N/A"
  }

  const gradients = [
    "from-cyan-500 to-blue-500",
    "from-violet-500 to-purple-500",
    "from-pink-500 to-rose-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
  ]

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          Ventes récentes
        </CardTitle>
        <Badge variant="secondary" className="font-semibold">
          {sales.length} {sales.length > 1 ? "ventes" : "vente"}
        </Badge>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <Receipt className="w-16 h-16 mb-4 opacity-20" />
            <p>Aucune vente aujourd'hui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sales.map((sale, index) => {
              const PaymentIcon = getPaymentIcon(sale.payments)
              const itemCount = sale.sale_lines?.reduce((sum: number, line: any) => sum + (line.quantity || 0), 0) || 0
              return (
                <div
                  key={sale.id}
                  className="group relative p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all hover:shadow-md overflow-hidden"
                >
                  {/* Gradient accent line */}
                  <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${gradients[index % gradients.length]}`} />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center shadow-sm`}>
                        <Receipt className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">#{sale.ticket_number}</p>
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs h-5">
                            <PaymentIcon className="w-3 h-3 mr-1" />
                            {getPaymentLabel(sale.payments)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {itemCount} article{itemCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold bg-gradient-to-r ${gradients[index % gradients.length]} bg-clip-text text-transparent`}>
                        {new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(sale.total_ttc || sale.final_amount || sale.total_amount || 0)}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">{sale.currency_code || sale.currency || "XOF"}</p>
                      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(sale.created_at)}
                      </div>
                    </div>
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
