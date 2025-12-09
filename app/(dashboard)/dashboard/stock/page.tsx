"use client"

import { useEffect, useState } from "react"
import { stockService, productsService, StockItem, StockMovement, Lot } from "@/lib/api"
import { StockOverview } from "@/components/stock/stock-overview"
import { StockMovements } from "@/components/stock/stock-movements"
import { InventoryAlerts } from "@/components/stock/inventory-alerts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, PackagePlus, ArrowRightLeft, Package, AlertTriangle, TrendingUp, Boxes } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

export default function StockPage() {
  const [stockData, setStockData] = useState<any[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [lots, setLots] = useState<Lot[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lotDialogOpen, setLotDialogOpen] = useState(false)
  const [movementDialogOpen, setMovementDialogOpen] = useState(false)
  const [lotForm, setLotForm] = useState({ product_id: "", quantity: "", purchase_price: "", expiry_date: "" })
  const [movementForm, setMovementForm] = useState({ product_id: "", movement_type: "adjustment", quantity: "", reason: "" })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [stockRes, movementsRes, lotsRes, productsRes] = await Promise.all([
        stockService.getStock(),
        stockService.getMovements(),
        stockService.getLots(),
        productsService.getProducts(),
      ])

        if (stockRes.data && Array.isArray(stockRes.data)) {
          setStockData(stockRes.data)
          // Filtrer les alertes (produits avec stock faible ou en rupture)
          const alerts = stockRes.data.filter((item: any) => {
            const qty = item.total_quantity || 0
            const minLevel = item.product?.min_stock_level || 5
            return qty === 0 || qty <= minLevel
          })
          setAlerts(alerts)
        } else {
          setStockData([])
          setAlerts([])
        }

        if (movementsRes.data && Array.isArray(movementsRes.data)) {
          setMovements(movementsRes.data)
        } else {
          setMovements([])
        }

        if (lotsRes.data && Array.isArray(lotsRes.data)) {
          setLots(lotsRes.data)
        } else {
          setLots([])
        }

        if (productsRes.data && Array.isArray(productsRes.data)) {
          setProducts(productsRes.data)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setLoading(false)
      }
  }

  async function handleCreateLot(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:3001/api/stock/lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: lotForm.product_id,
          quantity: Number(lotForm.quantity),
          purchase_price: Number(lotForm.purchase_price) || 0,
          expiry_date: lotForm.expiry_date || null,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Lot créé avec succès")
        setLotDialogOpen(false)
        setLotForm({ product_id: "", quantity: "", purchase_price: "", expiry_date: "" })
        loadData()
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      toast.error("Erreur lors de la création")
    }
  }

  async function handleCreateMovement(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:3001/api/stock/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: movementForm.product_id,
          movement_type: movementForm.movement_type,
          quantity: Number(movementForm.quantity),
          reason: movementForm.reason,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Mouvement enregistré")
        setMovementDialogOpen(false)
        setMovementForm({ product_id: "", movement_type: "adjustment", quantity: "", reason: "" })
        loadData()
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
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
          <h1 className="text-2xl font-bold">Gestion du Stock</h1>
          <p className="text-muted-foreground">Suivez les entrées, sorties et niveaux de stock</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={lotDialogOpen} onOpenChange={setLotDialogOpen}>
            <DialogTrigger asChild>
              <Button><PackagePlus className="w-4 h-4 mr-2" />Nouveau lot</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateLot}>
                <DialogHeader>
                  <DialogTitle>Créer un lot (Entrée de stock)</DialogTitle>
                  <DialogDescription>Enregistrer une réception de marchandise</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label>Produit *</Label>
                    <Select value={lotForm.product_id} onValueChange={(v) => setLotForm({...lotForm, product_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name_fr || p.name_en}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantité *</Label>
                    <Input type="number" min="1" max="100" value={lotForm.quantity} onChange={(e) => setLotForm({...lotForm, quantity: e.target.value})} required placeholder="Entre 1 et 100" />
                    <p className="text-xs text-muted-foreground mt-1">La quantité doit être supérieure à 0 (max: 100)</p>
                  </div>
                  <div>
                    <Label>Prix d'achat (XOF)</Label>
                    <Input type="number" value={lotForm.purchase_price} onChange={(e) => setLotForm({...lotForm, purchase_price: e.target.value})} />
                  </div>
                  <div>
                    <Label>Date d'expiration</Label>
                    <Input type="date" value={lotForm.expiry_date} onChange={(e) => setLotForm({...lotForm, expiry_date: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setLotDialogOpen(false)}>Annuler</Button>
                  <Button type="submit">Créer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><ArrowRightLeft className="w-4 h-4 mr-2" />Mouvement</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateMovement}>
                <DialogHeader>
                  <DialogTitle>Enregistrer un mouvement</DialogTitle>
                  <DialogDescription>Ajustement, transfert, rebut, retour</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label>Produit *</Label>
                    <Select value={movementForm.product_id} onValueChange={(v) => setMovementForm({...movementForm, product_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name_fr || p.name_en}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type *</Label>
                    <Select value={movementForm.movement_type} onValueChange={(v) => setMovementForm({...movementForm, movement_type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adjustment">Ajustement</SelectItem>
                        <SelectItem value="transfer">Transfert</SelectItem>
                        <SelectItem value="waste">Rebut</SelectItem>
                        <SelectItem value="return">Retour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantité * (+ pour ajout, - pour retrait)</Label>
                    <Input type="number" value={movementForm.quantity} onChange={(e) => setMovementForm({...movementForm, quantity: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Raison</Label>
                    <Textarea value={movementForm.reason} onChange={(e) => setMovementForm({...movementForm, reason: e.target.value})} rows={2} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setMovementDialogOpen(false)}>Annuler</Button>
                  <Button type="submit">Enregistrer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards avec Design Moderne */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Boxes className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                Total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Articles en stock</p>
              <p className="text-3xl font-bold">{stockData.length}</p>
              <p className="text-xs text-muted-foreground">produits référencés</p>
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
                Alertes
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Stock faible/Rupture</p>
              <p className="text-3xl font-bold">{alerts.length}</p>
              <p className="text-xs text-muted-foreground">articles à réapprovisionner</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Package className="w-6 h-6 text-violet-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                Lots
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total lots</p>
              <p className="text-3xl font-bold">{lots.length}</p>
              <p className="text-xs text-muted-foreground">sommiers douaniers</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <ArrowRightLeft className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                Mouvements
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Mouvements récents</p>
              <p className="text-3xl font-bold">{movements.length}</p>
              <p className="text-xs text-muted-foreground">entrées/sorties</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="lots">Lots / Sommiers</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StockOverview products={stockData || []} onReload={loadData} />
        </TabsContent>

        <TabsContent value="movements">
          <StockMovements movements={movements || []} onReload={loadData} />
        </TabsContent>

        <TabsContent value="lots">
          <LotsTable lots={lots || []} />
        </TabsContent>

        <TabsContent value="alerts">
          <InventoryAlerts products={alerts || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LotsTable({ lots }: { lots: any[] }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedLot, setSelectedLot] = useState<any>(null)
  const [editForm, setEditForm] = useState({ current_quantity: "", status: "" })

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:3001/api/stock/lots/${selectedLot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_quantity: Number(editForm.current_quantity),
          status: editForm.status,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Lot modifié")
        setEditDialogOpen(false)
        window.location.reload()
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      toast.error("Erreur lors de la modification")
    }
  }

  async function handleDelete(lotId: string) {
    if (!confirm("Supprimer ce lot ?")) return
    try {
      const response = await fetch(`http://localhost:3001/api/stock/lots/${lotId}`, { method: "DELETE" })
      const data = await response.json()
      if (response.ok) {
        toast.success("Lot supprimé")
        window.location.reload()
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Lots et Sommiers (Suivi douanier)</h3>
        <p className="text-sm text-muted-foreground">Traçabilité des marchandises sous régime d'entreposage fictif</p>
      </div>
      <div className="p-4">
        {lots.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucun lot enregistré</p>
        ) : (
          <div className="space-y-3">
            {lots.map((lot) => (
              <div key={lot.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-semibold">{lot.lot_number}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        lot.status === "available"
                          ? "bg-primary/10 text-primary"
                          : lot.status === "depleted"
                            ? "bg-muted text-muted-foreground"
                            : "bg-chart-2/10 text-chart-2"
                      }`}
                    >
                      {lot.status === "available" ? "Disponible" : lot.status === "depleted" ? "Épuisé" : lot.status}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedLot(lot); setEditForm({ current_quantity: lot.current_quantity, status: lot.status }); setEditDialogOpen(true); }}>Modifier</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(lot.id)}>Supprimer</Button>
                  </div>
                </div>
                <p className="text-sm">{lot.product?.name_fr || lot.product?.name_en}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Qté initiale: {lot.initial_quantity}</span>
                  <span>Qté actuelle: {lot.current_quantity}</span>
                  <span>Reçu le: {lot.received_date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Modifier le lot</DialogTitle>
              <DialogDescription>{selectedLot?.lot_number}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Quantité actuelle</Label>
                <Input type="number" value={editForm.current_quantity} onChange={(e) => setEditForm({...editForm, current_quantity: e.target.value})} />
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({...editForm, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="depleted">Épuisé</SelectItem>
                    <SelectItem value="reserved">Réservé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
