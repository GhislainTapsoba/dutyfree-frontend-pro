"use client"

import { useEffect, useState } from "react"
import { paymentsService, PaymentRecord, salesService, Sale, productsService, Product } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Banknote, CreditCard, Smartphone, Receipt, Loader2, Eye, User, ShoppingBag } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingPayment, setViewingPayment] = useState<PaymentRecord | null>(null)
  const [saleDetails, setSaleDetails] = useState<Sale | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const response = await paymentsService.getPayments()
        console.log('[Payments] response:', response)
        if ((response.data as any)?.data) setPayments((response.data as any).data)
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

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await productsService.getProducts()
        console.log('[Products] Raw response:', response)
        if (Array.isArray(response.data)) {
          console.log('[Products] Setting products from array:', response.data.length)
          setProducts(response.data)
        } else if ((response.data as any)?.data) {
          console.log('[Products] Setting products from nested data:', (response.data as any).data.length)
          setProducts((response.data as any).data)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error)
      }
    }
    loadProducts()
  }, [])

  async function handleViewDetails(payment: PaymentRecord) {
    setViewingPayment(payment)
    setLoadingDetails(true)
    setSaleDetails(null) // Reset previous details
    setDetailsError(null) // Reset error
    try {
      console.log('[Payment Details] Fetching sale for ID:', payment.sale_id)
      const response = await salesService.getSale(payment.sale_id)
      console.log('[Payment Details] Raw response:', response)
      console.log('[Payment Details] Response data:', response.data)
      console.log('[Payment Details] Response error:', response.error)

      // Check if there's an error in the response
      if (response.error) {
        setDetailsError(response.error)
        return
      }

      let saleData = null

      // Try different response formats
      if ((response.data as any)?.data) {
        saleData = (response.data as any).data
        console.log('[Payment Details] Using nested data format')
      } else if (response.data) {
        saleData = response.data
        console.log('[Payment Details] Using direct data format')
      }

      console.log('[Payment Details] Sale data:', saleData)

      if (saleData) {
        setSaleDetails(saleData as Sale)
        setDetailsError(null)
      } else {
        console.error('[Payment Details] No sale data found')
        setDetailsError('Aucune donnée de vente trouvée')
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des détails:", error)
      console.error("Error details:", error?.response?.data || error?.message)
      const errorMsg = error?.response?.data?.message || error?.message || 'Erreur inconnue'
      setDetailsError(`Erreur: ${errorMsg}`)
    } finally {
      setLoadingDetails(false)
    }
  }

  function getProductDetails(productId: string) {
    return products.find(p => p.id === productId)
  }

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
  const totalToday = todayPayments.reduce((sum, p) => sum + (Number(p.amount_xof) || Number((p as any).amount_in_base_currency) || 0), 0)

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
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors"
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
                  <div className="flex items-center gap-4">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(payment)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={!!viewingPayment} onOpenChange={() => { setViewingPayment(null); setSaleDetails(null); setDetailsError(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Détails du Ticket de Caisse
              {viewingPayment && <span className="text-sm text-muted-foreground font-normal">- Vente #{viewingPayment.sale_id}</span>}
            </DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Chargement des détails...</p>
            </div>
          ) : detailsError ? (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">⚠️ Détails de vente non disponibles</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Les informations détaillées de cette vente ne sont pas disponibles dans le système.
                  Voici les informations du paiement:
                </p>
              </div>

              {/* Afficher au moins les informations du paiement */}
              {viewingPayment && (
                <div className="space-y-4">
                  <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold mb-2">Informations du paiement</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">ID de vente</p>
                        <p className="font-medium">{viewingPayment.sale_id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Référence</p>
                        <p className="font-medium">{viewingPayment.reference || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Méthode</p>
                        <p className="font-medium">{viewingPayment.payment_method_name || viewingPayment.payment_method_id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {new Date(viewingPayment.created_at).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Montant payé</p>
                        <p className="text-2xl font-bold text-primary">
                          {new Intl.NumberFormat("fr-FR").format(viewingPayment.amount)} {viewingPayment.currency}
                        </p>
                      </div>
                      {viewingPayment.currency !== 'XOF' && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Équivalent XOF</p>
                          <p className="text-xl font-bold">
                            {new Intl.NumberFormat("fr-FR").format(viewingPayment.amount_xof)} XOF
                          </p>
                        </div>
                      )}
                    </div>

                    {viewingPayment.exchange_rate && viewingPayment.exchange_rate !== 1 && (
                      <div className="text-xs text-muted-foreground">
                        Taux de change: {viewingPayment.exchange_rate}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : saleDetails ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                      <Receipt className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ticket</p>
                      <p className="text-2xl font-bold text-primary">{saleDetails.ticket_number || 'N/A'}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg ${
                    saleDetails.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                    saleDetails.status === 'cancelled' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                    'bg-gradient-to-r from-amber-500 to-orange-500'
                  } text-white`}>
                    {saleDetails.status === 'completed' ? '✓ Complété' :
                     saleDetails.status === 'cancelled' ? '✕ Annulé' :
                     saleDetails.status === 'refunded' ? '↺ Remboursé' : saleDetails.status}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 bg-background/50 rounded-lg p-3 border border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vendeur</p>
                      <p className="font-semibold truncate">
                        {saleDetails.seller ?
                          `${saleDetails.seller.first_name} ${saleDetails.seller.last_name}` :
                          'N/A'}
                      </p>
                      {saleDetails.seller?.employee_id && (
                        <p className="text-xs text-muted-foreground">ID: {saleDetails.seller.employee_id}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-background/50 rounded-lg p-3 border border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Point de vente</p>
                      <p className="font-semibold truncate">{saleDetails.point_of_sale?.name || saleDetails.cash_register?.name || 'N/A'}</p>
                      {(saleDetails.point_of_sale?.code || saleDetails.cash_register?.code) && (
                        <p className="text-xs text-muted-foreground">{saleDetails.point_of_sale?.code || saleDetails.cash_register?.code}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-background/50 rounded-lg p-3 border border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date & Heure</p>
                      <p className="font-semibold">
                        {new Date(saleDetails.created_at).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(saleDetails.created_at).toLocaleString("fr-FR", {
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="bg-secondary/30 rounded-lg p-5 border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">Articles vendus</h3>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {saleDetails.lines?.length || 0} article{(saleDetails.lines?.length || 0) > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="space-y-2">
                  {!saleDetails.lines || saleDetails.lines.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Aucun article trouvé</p>
                  ) : (
                    saleDetails.lines.map((line, index) => {
                    const productName = line.product?.name_fr || `Produit #${line.product_id}`
                    const productCode = line.product?.code || line.product?.barcode || ''

                    return (
                      <div key={index} className="bg-background border border-border/50 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {line.quantity}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-base truncate">{productName}</p>
                                {productCode && (
                                  <p className="text-xs text-muted-foreground font-mono">{productCode}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">{new Intl.NumberFormat("fr-FR").format(line.total_ttc)} <span className="text-sm">XOF</span></p>
                          </div>
                        </div>

                        <div className="bg-secondary/30 rounded-md p-2 space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Prix unitaire TTC</span>
                            <span className="font-medium">{new Intl.NumberFormat("fr-FR").format(line.unit_price_ttc)} XOF</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total HT</span>
                            <span className="font-medium">{new Intl.NumberFormat("fr-FR").format(line.total_ht)} XOF</span>
                          </div>
                          {line.discount_amount && line.discount_amount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-amber-600 font-medium">
                                ⚡ Remise {line.discount_rate ? `(${line.discount_rate}%)` : ''}
                              </span>
                              <span className="text-amber-600 font-semibold">-{new Intl.NumberFormat("fr-FR").format(line.discount_amount)} XOF</span>
                            </div>
                          )}
                          {line.tax_amount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">TVA ({line.tax_rate}%)</span>
                              <span className="font-medium">+{new Intl.NumberFormat("fr-FR").format(line.tax_amount)} XOF</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                  )}
                </div>
              </div>

              {/* Totals Section */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-xl p-6 shadow-lg">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-base">
                    <span className="text-muted-foreground font-medium">Total HT</span>
                    <span className="font-semibold">{new Intl.NumberFormat("fr-FR").format(saleDetails.total_ht)} XOF</span>
                  </div>
                  {saleDetails.total_discount > 0 && (
                    <div className="flex items-center justify-between text-base">
                      <span className="text-amber-600 font-medium flex items-center gap-2">
                        <span className="text-lg">⚡</span> Remise totale
                      </span>
                      <span className="text-amber-600 font-bold">-{new Intl.NumberFormat("fr-FR").format(saleDetails.total_discount)} XOF</span>
                    </div>
                  )}
                  {saleDetails.total_tax > 0 && (
                    <div className="flex items-center justify-between text-base">
                      <span className="text-muted-foreground font-medium">TVA totale</span>
                      <span className="font-semibold">+{new Intl.NumberFormat("fr-FR").format(saleDetails.total_tax)} XOF</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4 bg-primary/20" />

                <div className="flex items-center justify-between bg-primary/10 rounded-lg p-4 border border-primary/30">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total à payer</p>
                    <p className="text-3xl font-black text-primary">
                      {new Intl.NumberFormat("fr-FR").format(saleDetails.total_ttc)} <span className="text-xl">XOF</span>
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                    <Receipt className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-secondary/30 rounded-lg p-5 border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">Moyens de paiement</h3>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-semibold">
                    {saleDetails.payments?.length || 0} paiement{(saleDetails.payments?.length || 0) > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="space-y-3">
                  {!saleDetails.payments || saleDetails.payments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Aucun moyen de paiement trouvé</p>
                  ) : (
                    saleDetails.payments.map((payment, index) => {
                      const methodType = payment.payment_method?.type || payment.payment_method?.code || 'other'
                      const methodName = payment.payment_method?.name || 'Paiement'

                      return (
                        <div key={index} className="bg-background border border-border/50 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md ${
                                methodType === 'cash' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                methodType === 'card' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                methodType === 'mobile_money' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                                'bg-gradient-to-br from-gray-500 to-slate-600'
                              }`}>
                                {methodType === 'cash' && <Banknote className="w-6 h-6 text-white" />}
                                {methodType === 'card' && <CreditCard className="w-6 h-6 text-white" />}
                                {methodType === 'mobile_money' && <Smartphone className="w-6 h-6 text-white" />}
                                {!['cash', 'card', 'mobile_money'].includes(methodType) && <Receipt className="w-6 h-6 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-base mb-1">{methodName}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="font-mono font-semibold">{payment.currency_code}</span>
                                  {payment.card_last_digits && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono">**** {payment.card_last_digits}</span>
                                    </>
                                  )}
                                  {payment.transaction_reference && payment.transaction_reference.length < 20 && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono truncate">{payment.transaction_reference}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                {new Intl.NumberFormat("fr-FR").format(payment.amount)} <span className="text-sm">{payment.currency_code}</span>
                              </p>
                              {payment.currency_code !== 'XOF' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  ≈ {new Intl.NumberFormat("fr-FR").format(payment.amount_in_base_currency)} XOF
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucun détail disponible</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
