"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [saleData, setSaleData] = useState<any>(null)
  const [splitPayments, setSplitPayments] = useState<{ method: string; amount: number; currency: string }[]>([])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price)
  }

  const change = selectedMethod === "cash" ? Math.max(0, Number.parseFloat(amountReceived || "0") - total) : 0

  const handlePayment = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_percentage: item.discount_percent,
            discount_amount: 0,
          })),
          currency_code: currency.code,
          discount_amount: 0,
          customer_name: passengerInfo?.name,
          flight_reference: passengerInfo?.flight,
          payments: [{
            payment_method_id: null,
            amount: selectedMethod === 'cash' ? Number.parseFloat(amountReceived || "0") : total,
            currency_code: currency.code,
          }],
        }),
      })

      if (!response.ok) throw new Error("Payment failed")

      const result = await response.json()
      setSaleData(result.data)
      setTicketNumber(result.data?.ticket_number || 'N/A')
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
          <DialogDescription className="sr-only">Ticket de caisse</DialogDescription>
          <div className="bg-white text-black p-6 rounded font-mono text-xs space-y-1">
            {/* Header */}
            <p className="text-center font-bold text-sm">DUTY FREE OUAGADOUGOU</p>
            <p className="text-center text-[10px]">Aéroport International</p>
            <p className="text-center text-[10px]">Ouagadougou, Burkina Faso</p>
            <p className="text-center italic mt-2">Bienvenue</p>
            
            <hr className="border-dashed border-gray-400 my-2" />
            
            {/* Ticket Info */}
            <p>Ticket: {ticketNumber}</p>
            <p>Date: {new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</p>
            {passengerInfo?.name && <p>Client: {passengerInfo.name}</p>}
            {passengerInfo?.flight && <p>Vol: {passengerInfo.flight}</p>}
            
            <hr className="border-dashed border-gray-400 my-2" />
            
            {/* Items */}
            {items.map((item, idx) => (
              <div key={idx}>
                <p>{item.product.name_fr}</p>
                <p className="flex justify-between">
                  <span>{item.quantity} x {formatPrice(item.unit_price)}</span>
                  <span>{formatPrice(item.quantity * item.unit_price)} {currency.code}</span>
                </p>
              </div>
            ))}
            
            <hr className="border-dashed border-gray-400 my-2" />
            
            {/* Totals */}
            <p className="flex justify-between">
              <span>Sous-total:</span>
              <span>{formatPrice(saleData?.subtotal || total)} {currency.code}</span>
            </p>
            {saleData?.tax_amount > 0 && (
              <p className="flex justify-between">
                <span>TVA:</span>
                <span>{formatPrice(saleData.tax_amount)} {currency.code}</span>
              </p>
            )}
            <p className="flex justify-between font-bold text-sm">
              <span>TOTAL:</span>
              <span>{formatPrice(saleData?.total_ttc || total)} {currency.code}</span>
            </p>
            
            <hr className="border-dashed border-gray-400 my-2" />
            
            {/* Payment */}
            <p className="flex justify-between">
              <span>Payé:</span>
              <span>{formatPrice(selectedMethod === 'cash' ? Number.parseFloat(amountReceived || "0") : total)} {currency.code}</span>
            </p>
            {change > 0 && (
              <p className="flex justify-between font-bold">
                <span>Monnaie:</span>
                <span>{formatPrice(change)} {currency.code}</span>
              </p>
            )}
            
            <hr className="border-dashed border-gray-400 my-2" />
            
            {/* Footer */}
            <p className="text-center italic mt-2">Merci de votre visite</p>
            <p className="text-center italic">Bon voyage !</p>
            
            <div className="flex items-center justify-center mt-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={handlePrint} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            <Button onClick={onComplete} className="flex-1">
              <Receipt className="w-4 h-4 mr-2" />
              Nouveau
            </Button>
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
          <DialogDescription>Sélectionnez le mode de paiement et validez la transaction</DialogDescription>
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
