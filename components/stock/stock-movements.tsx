"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpCircle, ArrowDownCircle, RotateCcw, Package } from "lucide-react"

interface StockMovementsProps {
  movements: any[]
}

export function StockMovements({ movements }: StockMovementsProps) {
  // Ensure movements is always an array
  const safeMovements = Array.isArray(movements) ? movements : []

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <ArrowUpCircle className="w-5 h-5 text-primary" />
      case "out":
        return <ArrowDownCircle className="w-5 h-5 text-destructive" />
      case "adjustment":
        return <RotateCcw className="w-5 h-5 text-warning" />
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getMovementLabel = (type: string) => {
    switch (type) {
      case "in":
        return "Entrée"
      case "out":
        return "Sortie"
      case "adjustment":
        return "Ajustement"
      case "sale":
        return "Vente"
      default:
        return type
    }
  }

  return (
    <Card className="border-border">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Historique des mouvements</h3>
      </div>
      <div className="divide-y divide-border">
        {safeMovements.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucun mouvement enregistré</p>
        ) : (
          safeMovements.map((movement) => (
            <div key={movement.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                {getMovementIcon(movement.movement_type)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{movement.products?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {movement.reference || "Pas de référence"} • Par {movement.users?.first_name || "Système"}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${movement.movement_type === "in" ? "text-primary" : "text-destructive"}`}>
                  {movement.movement_type === "in" ? "+" : "-"}
                  {movement.quantity}
                </p>
                <Badge variant="outline" className="text-xs">
                  {getMovementLabel(movement.movement_type)}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground w-24 text-right">
                {new Date(movement.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
