"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, FileText, Edit, CheckCircle, XCircle, AlertCircle, Clock, Eye, Trash2, MoreHorizontal, DollarSign, Receipt } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<SupplierInvoice | null>(null)
  const [viewingInvoice, setViewingInvoice] = useState<SupplierInvoice | null>(null)

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

  const handleView = (invoice: SupplierInvoice) => {
    setViewingInvoice(invoice)
    setViewDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/supplier-invoices/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Facture supprimée")
        loadData()
      } else {
        const data = await response.json()
        toast.error(data.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression")
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

  const pendingInvoices = invoices.filter(i => i.status === 'pending').length
  const paidInvoices = invoices.filter(i => i.status === 'paid').length
  const totalAmount = invoices.reduce((sum, i) => sum + i.total, 0)
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0)

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

      {/* Stats Cards avec Design Moderne */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                Total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total factures</p>
              <p className="text-3xl font-bold">{invoices.length}</p>
              <p className="text-xs text-muted-foreground">factures enregistrées</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">
                En attente
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Factures en attente</p>
              <p className="text-3xl font-bold">{pendingInvoices}</p>
              <p className="text-xs text-muted-foreground">à valider</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                Payées
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Factures payées</p>
              <p className="text-3xl font-bold">{paidInvoices}</p>
              <p className="text-xs text-muted-foreground">réglées</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <DollarSign className="w-6 h-6 text-violet-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                Montant
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Montant total</p>
              <p className="text-3xl font-bold">{(totalAmount / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">FCFA de factures</p>
            </div>
          </div>
        </Card>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => handleView(invoice)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>

                        {invoice.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleValidate(invoice.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Valider
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenDialog(invoice)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(invoice.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </>
                        )}

                        {invoice.status === "validated" && (
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marquer comme payée
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog de visualisation */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de la facture</DialogTitle>
            <DialogDescription>
              Informations complètes de la facture fournisseur
            </DialogDescription>
          </DialogHeader>

          {viewingInvoice && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">N° Facture</Label>
                  <p className="font-mono font-semibold text-lg">{viewingInvoice.invoice_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className="mt-1">{getStatusBadge(viewingInvoice.status)}</div>
                </div>
              </div>

              {/* Fournisseur */}
              <div>
                <Label className="text-muted-foreground">Fournisseur</Label>
                <p className="font-semibold text-lg">
                  {viewingInvoice.supplier?.name}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({viewingInvoice.supplier?.code})
                  </span>
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date facture</Label>
                  <p className="font-medium">
                    {format(new Date(viewingInvoice.invoice_date), "dd MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date échéance</Label>
                  <p className="font-medium">
                    {viewingInvoice.due_date
                      ? format(new Date(viewingInvoice.due_date), "dd MMMM yyyy", { locale: fr })
                      : "Non définie"}
                  </p>
                </div>
              </div>

              {/* Montants */}
              <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium">{viewingInvoice.subtotal.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-medium">{viewingInvoice.tax_amount.toLocaleString("fr-FR")} FCFA</span>
                </div>
                {viewingInvoice.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Remise</span>
                    <span className="font-medium">- {viewingInvoice.discount_amount.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                )}
                {viewingInvoice.other_charges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Autres frais</span>
                    <span className="font-medium">{viewingInvoice.other_charges.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold text-lg">Total TTC</span>
                  <span className="font-bold text-2xl">{viewingInvoice.total.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>

              {/* Bon de commande */}
              {viewingInvoice.purchase_order && (
                <div>
                  <Label className="text-muted-foreground">Bon de commande associé</Label>
                  <p className="font-medium">{viewingInvoice.purchase_order.order_number}</p>
                </div>
              )}

              {/* Notes */}
              {viewingInvoice.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{viewingInvoice.notes}</p>
                </div>
              )}

              {/* Informations de paiement */}
              {viewingInvoice.payment_date && (
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                  <Label className="text-muted-foreground">Payée le</Label>
                  <p className="font-medium">
                    {format(new Date(viewingInvoice.payment_date), "dd MMMM yyyy à HH:mm", { locale: fr })}
                  </p>
                  {viewingInvoice.payment_method && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Méthode: {viewingInvoice.payment_method}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
