import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package } from "lucide-react"

interface StockAlertsProps {
  products: any[]
}

export function StockAlerts({ products }: StockAlertsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Alertes stock</CardTitle>
        <AlertTriangle className="w-5 h-5 text-warning" />
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Aucune alerte de stock</p>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{product.name_fr || product.name_en}</p>
                    <p className="text-xs text-muted-foreground">{product.code}</p>
                  </div>
                </div>
                <Badge variant="destructive" className="font-mono">
                  {product.current_stock || 0} unités
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
