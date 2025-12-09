"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api/client"
import { toast } from "sonner"
import { Loader2, Plus, Minus, Settings, History, TrendingUp, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LoyaltyCard {
  id: string
  card_number: string
  customer_name: string
  points_balance: number
}

interface PointTransaction {
  id: string
  card_id: string
  transaction_type: "credit" | "debit" | "adjustment" | "purchase" | "refund"
  points: number
  reason: string | null
  created_at: string
  created_by?: string
  balance_after?: number
}

interface PointsHistoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: LoyaltyCard | null
}

export function PointsHistory({ open, onOpenChange, card }: PointsHistoryProps) {
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && card) {
      loadTransactions()
    }
  }, [open, card])

  const loadTransactions = async () => {
    if (!card) return

    setLoading(true)
    try {
      const response = await api.get<PointTransaction[]>(`/loyalty/cards/${card.id}/points/history`)

      if (response.data) {
        setTransactions(response.data)
      } else {
        toast.error("Erreur lors du chargement de l'historique")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement de l'historique")
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "credit":
        return <Plus className="w-4 h-4 text-green-500" />
      case "debit":
      case "purchase":
        return <Minus className="w-4 h-4 text-red-500" />
      case "adjustment":
        return <Settings className="w-4 h-4 text-blue-500" />
      case "refund":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      default:
        return <History className="w-4 h-4 text-gray-500" />
    }
  }

  const getTransactionBadge = (type: string) => {
    const config: Record<string, { label: string; className: string }> = {
      credit: { label: "Crédit", className: "bg-green-900/20 text-green-400 border-green-400/30" },
      debit: { label: "Débit", className: "bg-red-900/20 text-red-400 border-red-400/30" },
      adjustment: { label: "Ajustement", className: "bg-blue-900/20 text-blue-400 border-blue-400/30" },
      purchase: { label: "Achat", className: "bg-purple-900/20 text-purple-400 border-purple-400/30" },
      refund: { label: "Remboursement", className: "bg-green-900/20 text-green-400 border-green-400/30" },
    }

    const typeConfig = config[type] || { label: type, className: "bg-gray-900/20 text-gray-400 border-gray-400/30" }

    return (
      <Badge variant="outline" className={typeConfig.className}>
        {typeConfig.label}
      </Badge>
    )
  }

  if (!card) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Historique des Points - {card.card_number}</DialogTitle>
          <DialogDescription>{card.customer_name}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between -mt-2 mb-4">
          <span className="text-sm text-muted-foreground">Solde actuel:</span>
          <span className="text-lg font-bold text-primary">
            {card.points_balance.toLocaleString()} points
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <History className="w-12 h-12 mb-4 opacity-50" />
            <p>Aucune transaction trouvée</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Solde après</TableHead>
                  <TableHead>Raison</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm">
                      {format(new Date(transaction.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.transaction_type)}
                        {getTransactionBadge(transaction.transaction_type)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold ${
                          transaction.points > 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {transaction.points > 0 ? "+" : ""}
                        {transaction.points.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {transaction.balance_after !== undefined
                        ? transaction.balance_after.toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {transaction.reason || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        {/* Résumé des statistiques */}
        {!loading && transactions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Crédits totaux</p>
                  <p className="text-lg font-bold text-green-500">
                    +{transactions
                      .filter((t) => t.points > 0)
                      .reduce((sum, t) => sum + t.points, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Débits totaux</p>
                  <p className="text-lg font-bold text-red-500">
                    {transactions
                      .filter((t) => t.points < 0)
                      .reduce((sum, t) => sum + t.points, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-bold">{transactions.length}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
