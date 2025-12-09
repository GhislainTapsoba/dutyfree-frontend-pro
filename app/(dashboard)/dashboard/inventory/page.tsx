"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, ClipboardList, TrendingUp, TrendingDown, AlertTriangle, MoreVertical, Eye, Edit, Trash2 } from "lucide-react"
import { api } from "@/lib/api/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"

interface Inventory {
  id: string
  code: string
  point_of_sale_id: string | null
  inventory_date: string
  started_at: string | null
  completed_at: string | null
  status: "draft" | "in_progress" | "completed" | "validated"
  total_items_counted: number
  total_variance_value: number
  notes: string | null
  created_at: string
  point_of_sale?: {
    name: string
    code: string
  }
}

interface InventoryStats {
  total_inventories: number
  in_progress: number
  total_variance: number
  avg_variance: number
}

export default function InventoryPage() {
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [stats, setStats] = useState<InventoryStats>({
    total_inventories: 0,
    in_progress: 0,
    total_variance: 0,
    avg_variance: 0,
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    point_of_sale_id: "",
    notes: "",
  })

  useEffect(() => {
    loadInventories()
  }, [])

  async function loadInventories() {
    setLoading(true)
    try {
      const response = await api.get<Inventory[]>("/stock/inventory")
      if (response.data) {
        setInventories(response.data)

        // Calculate stats
        const total = response.data.length
        const inProgress = response.data.filter((inv: Inventory) => inv.status === "in_progress").length
        const totalVar = response.data.reduce((sum: number, inv: Inventory) => sum + Math.abs(inv.total_variance_value || 0), 0)
        const avgVar = total > 0 ? totalVar / total : 0

        setStats({
          total_inventories: total,
          in_progress: inProgress,
          total_variance: totalVar,
          avg_variance: avgVar,
        })
      }
    } catch (error) {
      console.error("Erreur lors du chargement des inventaires:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet inventaire ?")) return
    try {
      const response = await api.delete(`/stock/inventory/${id}`)
      if (response.data || !response.error) {
        toast.success("Inventaire supprimé")
        loadInventories()
      } else {
        toast.error(response.error || "Erreur")
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  async function handleChangeStatus(id: string, newStatus: string) {
    try {
      const response = await api.put<Inventory>(`/stock/inventory/${id}`, { status: newStatus })
      if (response.data) {
        toast.success("Statut modifié")
        loadInventories()
      } else {
        toast.error(response.error || "Erreur")
      }
    } catch (error) {
      toast.error("Erreur lors de la modification")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await api.post<Inventory>("/stock/inventory", formData)

      if (response.data) {
        toast.success("Inventaire créé avec succès")
        setDialogOpen(false)
        loadInventories()
      } else {
        toast.error(response.error || "Erreur lors de la création")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la création")
    }
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

  const getVarianceIndicator = (variance: number) => {
    if (variance === 0) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-muted-foreground" />
          <span>0 FCFA</span>
        </div>
      )
    } else if (variance > 0) {
      return (
        <div className="flex items-center gap-1 text-chart-2">
          <TrendingUp className="w-4 h-4" />
          <span>+{variance.toLocaleString("fr-FR")} FCFA</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-destructive">
          <TrendingDown className="w-4 h-4" />
          <span>{variance.toLocaleString("fr-FR")} FCFA</span>
        </div>
      )
    }
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
          <h1 className="text-2xl font-bold">Inventaires Physiques</h1>
          <p className="text-muted-foreground">
            Gestion des comptages et analyse des écarts de stock
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel inventaire
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nouvel inventaire physique</DialogTitle>
                <DialogDescription>
                  Démarrez une nouvelle session de comptage de stock
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="point_of_sale_id">Point de vente</Label>
                  <Select
                    value={formData.point_of_sale_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, point_of_sale_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un point de vente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les points de vente</SelectItem>
                      {/* Les points de vente seront chargés dynamiquement */}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes sur cet inventaire..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Démarrer l'inventaire</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards avec Design Moderne */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <ClipboardList className="w-6 h-6 text-violet-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                Total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total inventaires</p>
              <p className="text-3xl font-bold">{stats.total_inventories}</p>
              <p className="text-xs text-muted-foreground">sessions créées</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                Actif
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">En cours</p>
              <p className="text-3xl font-bold">{stats.in_progress}</p>
              <p className="text-xs text-muted-foreground">inventaires actifs</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">
                Alerte
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Écart total</p>
              <p className="text-3xl font-bold">{(stats.total_variance / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">FCFA d'écart cumulé</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <TrendingDown className="w-6 h-6 text-amber-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm">
                Moyenne
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Écart moyen</p>
              <p className="text-3xl font-bold">{stats.avg_variance.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">FCFA par inventaire</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="border-b bg-muted/30 px-6 py-4">
          <h3 className="text-lg font-semibold">Liste des inventaires</h3>
          <p className="text-sm text-muted-foreground mt-1">Historique et suivi des comptages de stock</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Inventaire</TableHead>
              <TableHead>Point de vente</TableHead>
              <TableHead>Date de début</TableHead>
              <TableHead>Date de fin</TableHead>
              <TableHead className="text-right">Articles comptés</TableHead>
              <TableHead className="text-right">Écart de valeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun inventaire trouvé</p>
                </TableCell>
              </TableRow>
            ) : (
              inventories.map((inventory) => (
                <TableRow key={inventory.id}>
                  <TableCell className="font-mono font-semibold">
                    {inventory.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{inventory.point_of_sale?.name || "Tous"}</div>
                      <div className="text-xs text-muted-foreground">
                        {inventory.point_of_sale?.code || "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {inventory.started_at
                      ? format(new Date(inventory.started_at), "dd MMM yyyy HH:mm", { locale: fr })
                      : format(new Date(inventory.inventory_date), "dd MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {inventory.completed_at
                      ? format(new Date(inventory.completed_at), "dd MMM yyyy HH:mm", { locale: fr })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {inventory.total_items_counted || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    {getVarianceIndicator(inventory.total_variance_value || 0)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {getStatusBadge(inventory.status)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleChangeStatus(inventory.id, "draft")}>
                          Brouillon
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus(inventory.id, "in_progress")}>
                          En cours
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus(inventory.id, "completed")}>
                          Terminé
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus(inventory.id, "validated")}>
                          Validé
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                          <Link href={`/dashboard/inventory/${inventory.id}`} className="flex items-center cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(inventory.id)} className="text-destructive">
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

      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ClipboardList className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-medium mb-1">Formule d'analyse des écarts</p>
            <p className="text-muted-foreground font-mono text-xs bg-background p-2 rounded border">
              Écart = (Stock début vacation + Entrées période) - Stock fin vacation
            </p>
            <p className="text-muted-foreground mt-2">
              Les écarts positifs indiquent un excédent de stock, les écarts négatifs indiquent un manquant.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
