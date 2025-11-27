"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Banknote, CreditCard, Smartphone, Loader2, CheckCircle, Printer, Receipt } from "lucide-react"
import type { CartItem } from "./pos-interface"

interface PaymentModalProps {
  items: CartItem[]
  total: number
  currency: any
  currencies: any[]
  paymentMethods: any[]
  passengerInfo: any
  onClose: () => void
  onComplete: () => void
}

export function PaymentModal({
  items,
  total,
  currency,
  currencies,
  paymentMethods,
  passengerInfo,
  onClose,
  onComplete,
}: PaymentModalProps) {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<string>("cash")
  const [amountReceived, setAmountReceived] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)
  const [splitPayments, setSplitPayments] = useState<{ method: string; amount: number; currency: string }[]>([])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price)
  }

  const change = selectedMethod === "cash" ? Math.max(0, Number.parseFloat(amountReceived || "0") - total) : 0

  const handlePayment = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_percent: item.discount_percent,
          })),
          total_amount: total,
          currency: currency.code,
          payment_method: selectedMethod,
          passenger_info: passengerInfo,
          amount_received: Number.parseFloat(amountReceived || "0"),
          change_given: change,
        }),
      })

      if (!response.ok) throw new Error("Payment failed")

      const data = await response.json()
      setTicketNumber(data.ticket_number)
      setCompleted(true)
    } catch (error) {
      console.error("Payment error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const methodIcons: Record<string, any> = {
    cash: Banknote,
    card: CreditCard,
    mobile_money: Smartphone,
  }

  if (completed) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Paiement réussi !</h2>
            <p className="text-muted-foreground text-center">Ticket #{ticketNumber}</p>
            <div className="text-3xl font-bold text-primary">
              {formatPrice(total)} {currency.code}
            </div>
            {change > 0 && (
              <div className="text-lg">
                Monnaie à rendre:{" "}
                <span className="font-bold text-warning">
                  {formatPrice(change)} {currency.code}
                </span>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
              <Button onClick={onComplete}>
                <Receipt className="w-4 h-4 mr-2" />
                Nouveau ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Paiement</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total */}
          <div className="p-4 rounded-lg bg-secondary text-center">
            <p className="text-sm text-muted-foreground mb-1">Total à payer</p>
            <p className="text-3xl font-bold text-primary">
              {formatPrice(total)} {currency.code}
            </p>
          </div>

          {/* Payment Method */}
          <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="cash" className="gap-2">
                <Banknote className="w-4 h-4" />
                Espèces
              </TabsTrigger>
              <TabsTrigger value="card" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Carte
              </TabsTrigger>
              <TabsTrigger value="mobile_money" className="gap-2">
                <Smartphone className="w-4 h-4" />
                Mobile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cash" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Montant reçu ({currency.code})</Label>
                <Input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder={formatPrice(total)}
                  className="text-xl h-14 text-center bg-secondary border-border"
                />
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  total,
                  Math.ceil(total / 1000) * 1000,
                  Math.ceil(total / 5000) * 5000,
                  Math.ceil(total / 10000) * 10000,
                ].map((amount, idx) => (
                  <Button key={idx} variant="outline" size="sm" onClick={() => setAmountReceived(amount.toString())}>
                    {formatPrice(amount)}
                  </Button>
                ))}
              </div>

              {Number.parseFloat(amountReceived || "0") >= total && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Monnaie à rendre</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(change)} {currency.code}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="card" className="pt-4">
              <div className="p-8 text-center text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-4" />
                <p>En attente du terminal de paiement...</p>
                <p className="text-sm mt-2">Présentez la carte sur le TPE</p>
              </div>
            </TabsContent>

            <TabsContent value="mobile_money" className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Numéro de téléphone</Label>
                  <Input type="tel" placeholder="+226 XX XX XX XX" className="bg-secondary border-border" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-16 bg-transparent">
                    <img src="/orange-money-logo.jpg" alt="Orange Money" className="h-8" />
                  </Button>
                  <Button variant="outline" className="h-16 bg-transparent">
                    <img src="/moov-money-logo.jpg" alt="Moov Money" className="h-8" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Validate Button */}
          <Button
            className="w-full h-12 text-lg"
            onClick={handlePayment}
            disabled={loading || (selectedMethod === "cash" && Number.parseFloat(amountReceived || "0") < total)}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              "Valider le paiement"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
