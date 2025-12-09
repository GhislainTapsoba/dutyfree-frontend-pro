"use client"

import { useEffect, useState } from "react"
import { paymentsService, PaymentRecord } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Banknote, CreditCard, Smartphone, Receipt, Loader2 } from "lucide-react"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const response = await paymentsService.getPayments()
        console.log('[Payments] response:', response)
        if (response.data?.data) setPayments(response.data.data)
        else if (Array.isArray(response.data)) setPayments(response.data)
        else setPayments([])
      } catch (error) {
        console.error("Erreur lors du chargement des paiements:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // S'assurer que payments est un tableau
  const paymentsList = Array.isArray(payments) ? payments : []
  
  const today = new Date().toISOString().split("T")[0]
  const todayPayments = paymentsList.filter((p) => p.created_at?.startsWith(today))
  const totalToday = todayPayments.reduce((sum, p) => sum + (Number(p.amount_xof) || Number(p.amount_in_base_currency) || 0), 0)

  const getMethodIcon = (code: string) => {
    switch (code) {
      case "cash":
        return <Banknote className="w-5 h-5" />
      case "card":
        return <CreditCard className="w-5 h-5" />
      case "mobile_money":
        return <Smartphone className="w-5 h-5" />
      default:
        return <Receipt className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paiements</h1>
        <p className="text-muted-foreground">Historique des transactions et paiements</p>
      </div>

      {/* Stats Cards avec Design Moderne */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Banknote className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                Jour
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total du jour</p>
              <p className="text-3xl font-bold">{new Intl.NumberFormat("fr-FR").format(totalToday)}</p>
              <p className="text-xs text-muted-foreground">XOF encaissés</p>
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
                Transactions
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Transactions du jour</p>
              <p className="text-3xl font-bold">{todayPayments.length}</p>
              <p className="text-xs text-muted-foreground">paiements effectués</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <CreditCard className="w-6 h-6 text-violet-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                Moyen
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Paiement moyen</p>
              <p className="text-3xl font-bold">
                {todayPayments.length > 0 
                  ? new Intl.NumberFormat("fr-FR").format(Math.round(totalToday / todayPayments.length))
                  : "0"
                }
              </p>
              <p className="text-xs text-muted-foreground">XOF par transaction</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentsList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun paiement enregistré</p>
            ) : (
              paymentsList.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {getMethodIcon(payment.payment_method_id)}
                    </div>
                    <div>
                      <p className="font-medium">Vente #{payment.sale_id}</p>
                      <p className="text-sm text-muted-foreground">{payment.payment_method_name || 'Paiement'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {new Intl.NumberFormat("fr-FR").format(payment.amount)} {payment.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.created_at).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
