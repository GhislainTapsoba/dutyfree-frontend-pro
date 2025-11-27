"use client"

import { useEffect, useState } from "react"
import { stockService, productsService, StockItem, StockMovement, Lot } from "@/lib/api"
import { StockOverview } from "@/components/stock/stock-overview"
import { StockMovements } from "@/components/stock/stock-movements"
import { InventoryAlerts } from "@/components/stock/inventory-alerts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export default function StockPage() {
  const [stockData, setStockData] = useState<any[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [stockRes, movementsRes, lotsRes] = await Promise.all([
          stockService.getStock(),
          stockService.getMovements(),
          stockService.getLots(),
        ])

        if (stockRes.data && Array.isArray(stockRes.data)) {
          setStockData(stockRes.data)
          // Filtrer les alertes (produits avec stock faible)
          const lowStock = stockRes.data.filter((item: any) => item.needs_reorder || item.quantity <= 10)
          setAlerts(lowStock)
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
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion du Stock</h1>
        <p className="text-muted-foreground">Suivez les entrées, sorties et niveaux de stock</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="lots">Lots / Sommiers</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StockOverview products={stockData || []} />
        </TabsContent>

        <TabsContent value="movements">
          <StockMovements movements={movements || []} />
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
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      lot.status === "active"
                        ? "bg-primary/10 text-primary"
                        : lot.status === "cleared"
                          ? "bg-chart-2/10 text-chart-2"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {lot.status === "active" ? "Actif" : lot.status === "cleared" ? "Apuré" : lot.status}
                  </span>
                </div>
                <p className="text-sm">{lot.products?.name}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Qté initiale: {lot.initial_quantity}</span>
                  <span>Qté restante: {lot.remaining_quantity}</span>
                  <span>Sommier: {lot.sommier_number || "-"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
