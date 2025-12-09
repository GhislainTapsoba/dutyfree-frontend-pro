"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Supplier {
  id: string
  name: string
  code: string
}

interface Product {
  id: string
  name_fr: string
  code: string
  purchase_price: number
}

interface OrderLine {
  product_id: string
  quantity: number
  unit_price: number
  total: number
}

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    supplier_id: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery_date: "",
    notes: "",
  })

  const [approachCosts, setApproachCosts] = useState({
    transport: 0,
    insurance: 0,
    customs: 0,
    other: 0,
  })

  const [lines, setLines] = useState<OrderLine[]>([
    { product_id: "", quantity: 1, unit_price: 0, total: 0 },
  ])

  useEffect(() => {
    async function loadData() {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          fetch("http://localhost:3001/api/suppliers"),
          fetch("http://localhost:3001/api/products"),
        ])
        const suppliersData = await suppliersRes.json()
        const productsData = await productsRes.json()

        console.log("Suppliers loaded:", suppliersData.data?.length || 0)
        console.log("Products loaded:", productsData.data?.length || 0)

        if (suppliersData.data) setSuppliers(suppliersData.data)
        if (productsData.data) setProducts(productsData.data)
      } catch (error) {
        console.error("Erreur:", error)
        toast.error("Erreur lors du chargement des données")
      }
    }
    loadData()
  }, [])

  const handleAddLine = () => {
    setLines([...lines, { product_id: "", quantity: 1, unit_price: 0, total: 0 }])
  }

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index))
  }

  const handleLineChange = (index: number, field: keyof OrderLine, value: any) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }

    // Auto-calculate total
    if (field === "quantity" || field === "unit_price") {
      newLines[index].total = newLines[index].quantity * newLines[index].unit_price
    }

    // Auto-fill price when product is selected
    if (field === "product_id") {
      const product = products.find((p) => p.id === value)
      if (product) {
        newLines[index].unit_price = product.purchase_price
        newLines[index].total = newLines[index].quantity * product.purchase_price
      }
    }

    setLines(newLines)
  }

  const calculateSubtotal = () => {
    return lines.reduce((sum, line) => sum + line.total, 0)
  }

  const calculateTotalApproachCosts = () => {
    return Object.values(approachCosts).reduce((sum, cost) => sum + Number(cost), 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalApproachCosts()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.supplier_id) {
      toast.error("Veuillez sélectionner un fournisseur")
      return
    }

    if (lines.some((line) => !line.product_id || line.quantity <= 0)) {
      toast.error("Veuillez remplir toutes les lignes de commande")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:3001/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lines,
          approach_costs: calculateTotalApproachCosts(),
          approach_costs_detail: approachCosts,
          subtotal: calculateSubtotal(),
          total_amount: calculateTotal(),
          status: "draft",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Bon de commande créé avec succès")
        router.push("/dashboard/purchase-orders")
      } else {
        toast.error(data.error || "Erreur lors de la création")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/purchase-orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nouveau Bon de Commande</h1>
          <p className="text-muted-foreground">Créez une commande avec frais d'approche</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* En-tête de commande */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Fournisseur *</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name} ({supplier.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date de commande *</Label>
              <Input
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Date de livraison prévue</Label>
              <Input
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) =>
                  setFormData({ ...formData, expected_delivery_date: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes internes..."
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Lignes de commande */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Lignes de commande</h2>
            <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une ligne
            </Button>
          </div>

          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-5">
                  <Label>Produit</Label>
                  <Select
                    value={line.product_id}
                    onValueChange={(value) => handleLineChange(index, "product_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={products.length === 0 ? "Chargement..." : "Sélectionner un produit"} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Aucun produit disponible
                        </SelectItem>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name_fr} ({product.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) =>
                      handleLineChange(index, "quantity", parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label>Prix unitaire</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unit_price}
                    onChange={(e) =>
                      handleLineChange(index, "unit_price", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label>Total</Label>
                  <Input type="text" value={line.total.toFixed(2)} disabled />
                </div>

                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLine(index)}
                    disabled={lines.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Frais d'approche */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Frais d'approche (Transport, Assurance, Douane...)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Transport</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={approachCosts.transport}
                onChange={(e) =>
                  setApproachCosts({ ...approachCosts, transport: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <Label>Assurance</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={approachCosts.insurance}
                onChange={(e) =>
                  setApproachCosts({ ...approachCosts, insurance: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <Label>Frais de douane</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={approachCosts.customs}
                onChange={(e) =>
                  setApproachCosts({ ...approachCosts, customs: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <Label>Autres frais</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={approachCosts.other}
                onChange={(e) =>
                  setApproachCosts({ ...approachCosts, other: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        </Card>

        {/* Récapitulatif */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total marchandises:</span>
              <span className="font-medium">{calculateSubtotal().toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Frais d'approche:</span>
              <span>{calculateTotalApproachCosts().toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Total commande:</span>
              <span>{calculateTotal().toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/dashboard/purchase-orders">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  )
}
