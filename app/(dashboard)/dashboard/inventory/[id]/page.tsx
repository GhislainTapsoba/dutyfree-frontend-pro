"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Package, CheckCircle, Play, CheckCheck, Shield } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

export default function InventoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [inventory, setInventory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInventory()
  }, [params.id])

  async function loadInventory() {
    try {
      const response = await fetch(`http://localhost:3001/api/stock/inventory/${params.id}`)
      const data = await response.json()
      if (data.data) {
        setInventory(data.data)
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  async function handleChangeStatus(newStatus: string) {
    try {
      const response = await fetch(`http://localhost:3001/api/stock/inventory/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        toast.success("Statut modifié")
        loadInventory()
      } else {
        const data = await response.json()
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      toast.error("Erreur lors de la modification")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!inventory) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Inventaire non trouvé</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Brouillon", variant: "outline" as const },
      in_progress: { label: "En cours", variant: "default" as const },
      completed: { label: "Terminé", variant: "outline" as const },
      validated: { label: "Validé", variant: "default" as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Inventaire {inventory.code}</h1>
            <p className="text-muted-foreground">
              {inventory.point_of_sale?.name || "Tous les points de vente"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(inventory.status)}
          {inventory.status === "draft" && (
            <Button onClick={() => handleChangeStatus("in_progress")}>
              <Play className="w-4 h-4 mr-2" />
              Démarrer
            </Button>
          )}
          {inventory.status === "in_progress" && (
            <Button onClick={() => handleChangeStatus("completed")}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Terminer
            </Button>
          )}
          {inventory.status === "completed" && (
            <Button onClick={() => handleChangeStatus("validated")}>
              <Shield className="w-4 h-4 mr-2" />
              Valider
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Date d'inventaire</p>
            <p className="text-lg font-semibold">
              {format(new Date(inventory.inventory_date), "dd MMM yyyy", { locale: fr })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Articles comptés</p>
            <p className="text-lg font-semibold">{inventory.lines?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Écart total</p>
            <p className="text-lg font-semibold">{inventory.total_variance_value || 0} FCFA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Statut</p>
            <p className="text-lg font-semibold capitalize">{inventory.status}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lignes d'inventaire</CardTitle>
        </CardHeader>
        <CardContent>
          {!inventory.lines || inventory.lines.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Aucune ligne d'inventaire</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Qté théorique</TableHead>
                  <TableHead className="text-right">Qté comptée</TableHead>
                  <TableHead className="text-right">Écart</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.lines.map((line: any) => {
                  const variance = (line.counted_quantity || 0) - (line.theoretical_quantity || 0)
                  return (
                    <TableRow key={line.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{line.product?.name_fr || line.product?.name_en}</p>
                          <p className="text-xs text-muted-foreground font-mono">{line.product?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{line.theoretical_quantity || 0}</TableCell>
                      <TableCell className="text-right font-mono">{line.counted_quantity || "-"}</TableCell>
                      <TableCell className="text-right">
                        {line.counted_quantity !== null && line.counted_quantity !== undefined ? (
                          <span className={variance === 0 ? "text-muted-foreground" : variance > 0 ? "text-chart-2" : "text-destructive"}>
                            {variance > 0 ? "+" : ""}{variance}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {line.counted_quantity !== null && line.counted_quantity !== undefined ? (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Compté
                          </Badge>
                        ) : (
                          <Badge variant="secondary">En attente</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {inventory.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{inventory.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
