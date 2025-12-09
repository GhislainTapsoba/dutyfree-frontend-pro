"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Building2, Calendar, Package, DollarSign } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [params.id])

  async function loadOrder() {
    try {
      const response = await fetch(`http://localhost:3001/api/purchase-orders/${params.id}`)
      const data = await response.json()
      if (data.data) {
        setOrder(data.data)
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Bon de commande non trouvé</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bon de Commande {order.order_number}</h1>
            <p className="text-muted-foreground">{order.supplier?.name}</p>
          </div>
        </div>
        <Badge>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Fournisseur</p>
                <p className="font-semibold">{order.supplier?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Date commande</p>
                <p className="font-semibold">{format(new Date(order.order_date), "dd MMM yyyy", { locale: fr })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Articles</p>
                <p className="font-semibold">{order.lines?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold">{(order.total || 0).toLocaleString("fr-FR")} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lignes de commande</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Prix unitaire</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.lines?.map((line: any) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{line.product?.name_fr}</p>
                      <p className="text-xs text-muted-foreground">{line.product?.code}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{line.quantity_ordered}</TableCell>
                  <TableCell className="text-right">{(line.unit_price || 0).toLocaleString("fr-FR")} FCFA</TableCell>
                  <TableCell className="text-right font-medium">{(line.line_total || 0).toLocaleString("fr-FR")} FCFA</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Sous-total marchandises:</span>
              <span className="font-medium">{(order.subtotal || 0).toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Frais d'approche:</span>
              <span>{(order.approach_costs || 0).toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>{(order.total || 0).toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
