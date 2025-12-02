"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Eye, Truck, CheckCircle2, XCircle, Clock, MoreVertical, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface PurchaseOrder {
  id: string
  order_number: string
  supplier_id: string
  order_date: string
  expected_delivery_date: string | null
  status: "draft" | "sent" | "partial" | "received" | "cancelled"
  subtotal: number
  approach_costs: number
  total: number
  notes: string | null
  created_at: string
  supplier?: {
    name: string
    code: string
  }
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/purchase-orders")
      const data = await response.json()
      if (data.data) setOrders(data.data)
    } catch (error) {
      console.error("Erreur lors du chargement des bons de commande:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce bon de commande ?")) return
    try {
      const response = await fetch(`http://localhost:3001/api/purchase-orders/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Bon de commande supprimé")
        loadData()
      } else {
        const data = await response.json()
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Brouillon", variant: "secondary" as const, icon: Clock },
      sent: { label: "Envoyé", variant: "default" as const, icon: Truck },
      partial: { label: "Partiel", variant: "outline" as const, icon: Clock },
      received: { label: "Reçu", variant: "default" as const, icon: CheckCircle2 },
      cancelled: { label: "Annulé", variant: "destructive" as const, icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bons de Commande</h1>
          <p className="text-muted-foreground">
            Gérez vos commandes fournisseurs et les frais d'approche
          </p>
        </div>
        <Link href="/dashboard/purchase-orders/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle commande
          </Button>
        </Link>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Date commande</TableHead>
              <TableHead>Livraison prévue</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Sous-total</TableHead>
              <TableHead className="text-right">Frais approche</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  Aucun bon de commande trouvé
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-semibold">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.supplier?.name}</div>
                      <div className="text-xs text-muted-foreground">{order.supplier?.code}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.order_date), "dd MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {order.expected_delivery_date
                      ? format(new Date(order.expected_delivery_date), "dd MMM yyyy", { locale: fr })
                      : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {(order.subtotal || 0).toLocaleString("fr-FR")} FCFA
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {(order.approach_costs || 0).toLocaleString("fr-FR")} FCFA
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {(order.total || 0).toLocaleString("fr-FR")} FCFA
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/purchase-orders/${order.id}`} className="flex items-center cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/purchase-orders/${order.id}/edit`} className="flex items-center cursor-pointer">
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(order.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
