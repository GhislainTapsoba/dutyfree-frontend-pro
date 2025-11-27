import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, Clock } from "lucide-react"

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

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Ventes récentes</CardTitle>
        <Receipt className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Aucune vente aujourd'hui</p>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">#{sale.ticket_number}</p>
                    <p className="text-xs text-muted-foreground">{sale.sale_items?.length || 0} article(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {new Intl.NumberFormat("fr-FR").format(sale.final_amount || sale.total_amount || 0)} {sale.currency}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTime(sale.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
