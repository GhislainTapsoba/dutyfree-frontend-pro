"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, FileText, Edit, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"
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

interface SupplierInvoice {
  id: string
  supplier_id: string
  invoice_number: string
  invoice_date: string
  due_date: string | null
  subtotal: number
  tax_amount: number
  discount_amount: number
  other_charges: number
  total: number
  status: "pending" | "validated" | "paid" | "disputed" | "cancelled"
  payment_date: string | null
  payment_method: string | null
  notes: string | null
  supplier?: {
    name: string
    code: string
  }
  purchase_order?: {
    order_number: string
  }
}

export default function SupplierInvoicesPage() {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<SupplierInvoice | null>(null)

  const [formData, setFormData] = useState({
    supplier_id: "",
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: "",
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    other_charges: 0,
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [invoicesRes, suppliersRes] = await Promise.all([
        fetch("http://localhost:3001/api/supplier-invoices"),
        fetch("http://localhost:3001/api/suppliers"),
      ])

      const invoicesData = await invoicesRes.json()
      const suppliersData = await suppliersRes.json()

      if (invoicesData.data) setInvoices(invoicesData.data)
      if (suppliersData.data) setSuppliers(suppliersData.data)
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (invoice?: SupplierInvoice) => {
    if (invoice) {
      setEditingInvoice(invoice)
      setFormData({
        supplier_id: invoice.supplier_id,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date.split("T")[0],
        due_date: invoice.due_date ? invoice.due_date.split("T")[0] : "",
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        discount_amount: invoice.discount_amount,
        other_charges: invoice.other_charges,
        notes: invoice.notes || "",
      })
    } else {
      setEditingInvoice(null)
      setFormData({
        supplier_id: "",
        invoice_number: "",
        invoice_date: new Date().toISOString().split("T")[0],
        due_date: "",
        subtotal: 0,
        tax_amount: 0,
        discount_amount: 0,
        other_charges: 0,
        notes: "",
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.supplier_id || !formData.invoice_number) {
      toast.error("Veuillez remplir les champs obligatoires")
      return
    }

    try {
      const url = editingInvoice
        ? `http://localhost:3001/api/supplier-invoices/${editingInvoice.id}`
        : "http://localhost:3001/api/supplier-invoices"

      const response = await fetch(url, {
        method: editingInvoice ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingInvoice ? "Facture modifiée" : "Facture créée")
        setDialogOpen(false)
        loadData()
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleValidate = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/supplier-invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "validated" }),
      })

      if (response.ok) {
        toast.success("Facture validée")
        loadData()
      } else {
        toast.error("Erreur lors de la validation")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur")
    }
  }

  const handleMarkAsPaid = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/supplier-invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          payment_date: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        toast.success("Facture marquée comme payée")
        loadData()
      } else {
        toast.error("Erreur")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur")
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: "En attente", variant: "outline" as const, icon: Clock },
      validated: { label: "Validée", variant: "default" as const, icon: CheckCircle },
      paid: { label: "Payée", variant: "default" as const, icon: CheckCircle },
      disputed: { label: "Litige", variant: "destructive" as const, icon: AlertCircle },
      cancelled: { label: "Annulée", variant: "secondary" as const, icon: XCircle },
    }

    const cfg = config[status as keyof typeof config] || config.pending
    const Icon = cfg.icon

    return (
      <Badge variant={cfg.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    )
  }

  const calculateTotal = () => {
    return (
      formData.subtotal +
      formData.tax_amount +
      formData.other_charges -
      formData.discount_amount
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
          <h1 className="text-2xl font-bold">Factures Fournisseurs</h1>
          <p className="text-muted-foreground">
            Contrôle et validation des factures fournisseurs
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle facture
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingInvoice ? "Modifier la facture" : "Nouvelle facture"}
                </DialogTitle>
                <DialogDescription>
                  Enregistrez une facture fournisseur pour contrôle
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier_id">Fournisseur *</Label>
                    <Select
                      value={formData.supplier_id}
                      onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
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
                    <Label htmlFor="invoice_number">N° Facture *</Label>
                    <Input
                      id="invoice_number"
                      value={formData.invoice_number}
                      onChange={(e) =>
                        setFormData({ ...formData, invoice_number: e.target.value })
                      }
                      placeholder="INV-2025-001"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoice_date">Date facture *</Label>
                    <Input
                      id="invoice_date"
                      type="date"
                      value={formData.invoice_date}
                      onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="due_date">Date échéance</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subtotal">Sous-total (FCFA)</Label>
                    <Input
                      id="subtotal"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.subtotal}
                      onChange={(e) =>
                        setFormData({ ...formData, subtotal: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="tax_amount">Taxes (FCFA)</Label>
                    <Input
                      id="tax_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.tax_amount}
                      onChange={(e) =>
                        setFormData({ ...formData, tax_amount: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount_amount">Remise (FCFA)</Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_amount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="other_charges">Autres frais (FCFA)</Label>
                    <Input
                      id="other_charges"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.other_charges}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          other_charges: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total facture:</span>
                    <span className="text-2xl font-bold">{calculateTotal().toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes internes..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">{editingInvoice ? "Modifier" : "Créer"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Date facture</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead className="text-right">Montant HT</TableHead>
              <TableHead className="text-right">Total TTC</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune facture trouvée</p>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono font-semibold">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.supplier?.name}</div>
                      <div className="text-xs text-muted-foreground">{invoice.supplier?.code}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.invoice_date), "dd MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {invoice.due_date
                      ? format(new Date(invoice.due_date), "dd MMM yyyy", { locale: fr })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {invoice.subtotal.toLocaleString("fr-FR")} FCFA
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {invoice.total.toLocaleString("fr-FR")} FCFA
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {invoice.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleValidate(invoice.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Valider
                        </Button>
                      )}
                      {invoice.status === "validated" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                        >
                          Marquer payée
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(invoice)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
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
