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
  companySettings: any
  cashSession: any
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
  companySettings,
  cashSession,
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
    // Validation
    if (selectedMethod === 'cash' && Number.parseFloat(amountReceived || "0") < total) {
      alert("Montant insuffisant")
      return
    }

    setLoading(true)
    try {
      const { offlineManager } = await import('@/lib/offline/offline-manager')
      const isOnline = offlineManager.getStatus().isOnline
      
      // Trouver l'ID de la méthode de paiement
      const methodMap: Record<string, string> = {
        cash: 'CASH',
        card: 'CARD',
        mobile_money: 'MOBILE'
      }
      const methodCode = methodMap[selectedMethod]
      const paymentMethod = paymentMethods.find(m => m.code === methodCode)
      
      if (!paymentMethod) {
        throw new Error(`Méthode de paiement ${selectedMethod} non disponible`)
      }

      const saleData = {
        cash_session_id: cashSession?.id,
        lines: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percent,
          discount_amount: 0,
        })),
        currency_code: currency.code,
        discount_amount: 0,
        customer_name: passengerInfo?.name || 'Client',
        flight_reference: passengerInfo?.flight,
        payments: [{
          payment_method_id: paymentMethod.id,
          amount: total,
          currency_code: currency.code,
        }],
      }

      if (!isOnline) {
        await offlineManager.addToQueue('/sales', 'POST', saleData)
        alert('Mode hors ligne: Vente enregistrée localement. Elle sera synchronisée automatiquement.')
        onComplete()
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('API Error:', error)
        console.error('Request body was:', {
          lines: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          currency_code: currency.code,
          payments: [{
            payment_method_id: paymentMethod.id,
            amount: total,
            currency_code: currency.code,
          }],
        })
        throw new Error(error.error || error.details || "Erreur lors de l'enregistrement")
      }

      const result = await response.json()
      setSaleData(result.data)
      setTicketNumber(result.data?.ticket_number || 'N/A')
      setCompleted(true)
    } catch (error: any) {
      console.error("Payment error:", error)
      alert(error.message || "Erreur lors du paiement")
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
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogDescription className="sr-only">Ticket de caisse</DialogDescription>
          <div className="bg-white text-black p-6 rounded font-mono text-xs space-y-1 overflow-y-auto max-h-[60vh]">
            {/* Header */}
            {companySettings?.logo_url && (
              <div className="flex justify-center mb-2">
                <img src={companySettings.logo_url} alt="Logo" className="max-h-12 object-contain" />
              </div>
            )}
            <p className="text-center font-bold text-sm">{companySettings?.name || 'DUTY FREE OUAGADOUGOU'}</p>
            <p className="text-center text-[10px]">{companySettings?.address || 'Aéroport International'}</p>
            {companySettings?.phone && <p className="text-center text-[10px]">Tél: {companySettings.phone}</p>}
            {companySettings?.tax_id && <p className="text-center text-[10px]">NIF: {companySettings.tax_id}</p>}
            {companySettings?.header && <p className="text-center italic mt-2">{companySettings.header}</p>}
            
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
            {companySettings?.footer ? (
              <p className="text-center italic mt-2">{companySettings.footer}</p>
            ) : (
              <>
                <p className="text-center italic mt-2">Merci de votre visite</p>
                <p className="text-center italic">Bon voyage !</p>
              </>
            )}
            
            <div className="flex items-center justify-center mt-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          {/* Actions - Fixed at bottom */}
          <div className="flex gap-3 mt-4 pt-4 border-t">
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
              {/* Montant à payer */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Montant à payer</p>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(total)} {currency.code}
                </p>
              </div>

              {/* Montant reçu */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Montant reçu ({currency.code})</Label>
                <Input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="0"
                  className="text-3xl h-16 text-center font-bold bg-white border-2 border-primary/30 focus:border-primary"
                  autoFocus
                />
              </div>

              {/* Boutons rapides */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Montants rapides</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    total,
                    Math.ceil(total / 1000) * 1000,
                    Math.ceil(total / 5000) * 5000,
                    Math.ceil(total / 10000) * 10000,
                  ].map((amount, idx) => (
                    <Button 
                      key={idx} 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAmountReceived(amount.toString())}
                      className="h-12 font-semibold hover:bg-primary hover:text-white transition-colors"
                    >
                      {formatPrice(amount)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Monnaie à rendre */}
              {Number.parseFloat(amountReceived || "0") > 0 && (
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  Number.parseFloat(amountReceived || "0") >= total
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wide ${
                        Number.parseFloat(amountReceived || "0") >= total
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}>
                        {Number.parseFloat(amountReceived || "0") >= total ? 'Monnaie à rendre' : 'Montant insuffisant'}
                      </p>
                      <p className={`text-3xl font-bold ${
                        Number.parseFloat(amountReceived || "0") >= total
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}>
                        {Number.parseFloat(amountReceived || "0") >= total 
                          ? formatPrice(change) 
                          : formatPrice(total - Number.parseFloat(amountReceived || "0"))
                        } {currency.code}
                      </p>
                    </div>
                    {Number.parseFloat(amountReceived || "0") >= total && (
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="card" className="pt-4">
              <div className="p-6 text-center space-y-4">
                <CreditCard className="w-16 h-16 mx-auto text-primary" />
                <div>
                  <p className="font-semibold text-lg">Paiement par carte bancaire</p>
                  <p className="text-sm text-muted-foreground mt-2">1. Présentez la carte sur le TPE externe</p>
                  <p className="text-sm text-muted-foreground">2. Attendez la validation du paiement</p>
                  <p className="text-sm text-muted-foreground">3. Cliquez sur "Valider" ci-dessous</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(total)} {currency.code}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mobile_money" className="pt-4">
              <div className="p-6 text-center space-y-4">
                <Smartphone className="w-16 h-16 mx-auto text-primary" />
                <div>
                  <p className="font-semibold text-lg">Paiement Mobile Money</p>
                  <p className="text-sm text-muted-foreground mt-2">1. Client compose le code sur son téléphone</p>
                  <p className="text-sm text-muted-foreground">2. Attendez la confirmation du paiement</p>
                  <p className="text-sm text-muted-foreground">3. Cliquez sur "Valider" ci-dessous</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(total)} {currency.code}
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <div className="px-4 py-2 bg-orange-500 text-white rounded font-semibold">Orange Money</div>
                  <div className="px-4 py-2 bg-blue-600 text-white rounded font-semibold">Moov Money</div>
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
                Enregistrement...
              </>
            ) : selectedMethod === "cash" ? (
              "Confirmer le paiement"
            ) : (
              "Paiement reçu - Valider"
            )}
          </Button>
          
          {selectedMethod !== "cash" && (
            <p className="text-xs text-center text-muted-foreground">
              Cliquez uniquement après avoir reçu la confirmation du paiement
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
