"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Eye, Truck, CheckCircle2, XCircle, Clock, MoreVertical, Edit, Trash2, FileText, DollarSign, Package } from "lucide-react"
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
      const response = await api.get<PurchaseOrder[]>("/purchase-orders")
      if (response.data) setOrders(response.data)
    } catch (error) {
      console.error("Erreur lors du chargement des bons de commande:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce bon de commande ?")) return
    try {
      const response = await api.delete(`/purchase-orders/${id}`)
      if (response.data || !response.error) {
        toast.success("Bon de commande supprimé")
        loadData()
      } else {
        toast.error(response.error || "Erreur")
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

  const sentOrders = orders.filter(o => o.status === 'sent').length
  const receivedOrders = orders.filter(o => o.status === 'received').length
  const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0)

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

      {/* Stats Cards avec Design Moderne */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                Total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total commandes</p>
              <p className="text-3xl font-bold">{orders.length}</p>
              <p className="text-xs text-muted-foreground">bons créés</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Truck className="w-6 h-6 text-violet-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                Envoyé
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Commandes envoyées</p>
              <p className="text-3xl font-bold">{sentOrders}</p>
              <p className="text-xs text-muted-foreground">en transit</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                Reçu
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Commandes reçues</p>
              <p className="text-3xl font-bold">{receivedOrders}</p>
              <p className="text-xs text-muted-foreground">livrées</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                Valeur
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Valeur totale</p>
              <p className="text-3xl font-bold">{(totalAmount / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">FCFA de commandes</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="border-b bg-muted/30 px-6 py-4">
          <h3 className="text-lg font-semibold">Liste des bons de commande</h3>
          <p className="text-sm text-muted-foreground mt-1">Suivi de vos commandes fournisseurs</p>
        </div>
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
