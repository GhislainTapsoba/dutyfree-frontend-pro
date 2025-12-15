"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Hotel, Percent, CreditCard, Eye, Edit, Trash2, MoreVertical, Users, UserCheck, Wallet, TrendingUp } from "lucide-react"
import { api } from "@/lib/api/client"
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
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface HotelGuest {
  id: string
  badge_number: string | null
  professional_card: string | null
  chip_card_id: string | null
  guest_name: string
  hotel_name: string | null
  check_in_date: string | null
  check_out_date: string | null
  discount_percentage: number
  electronic_wallet_balance: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export default function HotelGuestsPage() {
  const [guests, setGuests] = useState<HotelGuest[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState<HotelGuest | null>(null)
  const [viewingGuest, setViewingGuest] = useState<HotelGuest | null>(null)

  const [formData, setFormData] = useState({
    badge_number: "",
    professional_card: "",
    chip_card_id: "",
    guest_name: "",
    hotel_name: "",
    check_in_date: new Date().toISOString().split("T")[0],
    check_out_date: "",
    discount_percentage: 10,
    electronic_wallet_balance: 0,
    is_active: true,
  })

  useEffect(() => {
    loadGuests()
  }, [])

  const loadGuests = async () => {
    setLoading(true)
    try {
      const response = await api.get("/hotel-guests")
      if (response.data) {
        setGuests(Array.isArray(response.data) ? response.data : [])
      } else if (response.error) {
        toast.error(response.error)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des clients hébergés:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (guest?: HotelGuest) => {
    if (guest) {
      setEditingGuest(guest)
      setFormData({
        badge_number: guest.badge_number || "",
        professional_card: guest.professional_card || "",
        chip_card_id: guest.chip_card_id || "",
        guest_name: guest.guest_name,
        hotel_name: guest.hotel_name || "",
        check_in_date: guest.check_in_date || new Date().toISOString().split("T")[0],
        check_out_date: guest.check_out_date || "",
        discount_percentage: guest.discount_percentage,
        electronic_wallet_balance: guest.electronic_wallet_balance,
        is_active: guest.is_active,
      })
    } else {
      setEditingGuest(null)
      setFormData({
        badge_number: "",
        professional_card: "",
        chip_card_id: "",
        guest_name: "",
        hotel_name: "",
        check_in_date: new Date().toISOString().split("T")[0],
        check_out_date: "",
        discount_percentage: 10,
        electronic_wallet_balance: 0,
        is_active: true,
      })
    }
    setDialogOpen(true)
  }

  const handleView = async (guest: HotelGuest) => {
    try {
      const response = await api.get<HotelGuest>(`/hotel-guests/${guest.id}`)
      if (response.data) {
        setViewingGuest(response.data)
        setViewDialogOpen(true)
      } else {
        toast.error("Erreur lors du chargement des détails")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
    }
  }

  const handleDelete = async (guest: HotelGuest) => {
    if (!confirm(`Êtes-vous sûr de vouloir désactiver le client ${guest.guest_name} ?`)) {
      return
    }

    try {
      const response = await api.delete(`/hotel-guests/${guest.id}`)
      if (response.data || !response.error) {
        toast.success("Client désactivé avec succès")
        loadGuests()
      } else {
        toast.error(response.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.guest_name) {
      toast.error("Veuillez remplir le nom du client")
      return
    }

    try {
      let response

      if (editingGuest) {
        // Mode édition
        response = await api.put(`/hotel-guests/${editingGuest.id}`, formData)
      } else {
        // Mode création
        response = await api.post("/hotel-guests", formData)
      }

      if (response.data) {
        toast.success(editingGuest ? "Client modifié avec succès" : "Client ajouté avec succès")
        setDialogOpen(false)
        setEditingGuest(null)
        setFormData({
          badge_number: "",
          professional_card: "",
          chip_card_id: "",
          guest_name: "",
          hotel_name: "",
          check_in_date: new Date().toISOString().split("T")[0],
          check_out_date: "",
          discount_percentage: 10,
          electronic_wallet_balance: 0,
          is_active: true,
        })
        loadGuests()
      } else if (response.error) {
        toast.error(response.error)
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const isActive = (guest: HotelGuest) => {
    if (!guest.is_active) return false
    if (!guest.check_out_date) return true
    return new Date(guest.check_out_date) >= new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const activeGuests = guests.filter(g => isActive(g)).length
  const totalWalletBalance = guests.reduce((sum, g) => sum + g.electronic_wallet_balance, 0)
  const avgDiscount = guests.length > 0 ? guests.reduce((sum, g) => sum + g.discount_percentage, 0) / guests.length : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients Hébergés</h1>
          <p className="text-muted-foreground">
            Gestion des remises pour clients hébergés (badge, carte professionnelle, carte à puce)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingGuest ? "Modifier le client hébergé" : "Nouveau client hébergé"}
                </DialogTitle>
                <DialogDescription>
                  Enregistrez un client hébergé avec ses avantages (remise + porte-monnaie électronique)
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guest_name">Nom du client *</Label>
                    <Input
                      id="guest_name"
                      value={formData.guest_name}
                      onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="hotel_name">Hôtel</Label>
                    <Input
                      id="hotel_name"
                      value={formData.hotel_name}
                      onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
                      placeholder="Hôtel Azalaï"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="badge_number">N° Badge</Label>
                    <Input
                      id="badge_number"
                      value={formData.badge_number}
                      onChange={(e) => setFormData({ ...formData, badge_number: e.target.value })}
                      placeholder="BADGE001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="professional_card">Carte pro</Label>
                    <Input
                      id="professional_card"
                      value={formData.professional_card}
                      onChange={(e) => setFormData({ ...formData, professional_card: e.target.value })}
                      placeholder="PRO001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="chip_card_id">Carte à puce</Label>
                    <Input
                      id="chip_card_id"
                      value={formData.chip_card_id}
                      onChange={(e) => setFormData({ ...formData, chip_card_id: e.target.value })}
                      placeholder="CHIP001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="check_in_date">Date d'arrivée *</Label>
                    <Input
                      id="check_in_date"
                      type="date"
                      value={formData.check_in_date}
                      onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="check_out_date">Date de départ</Label>
                    <Input
                      id="check_out_date"
                      type="date"
                      value={formData.check_out_date}
                      onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="badge_number">N° Badge / Carte professionnelle</Label>
                    <Input
                      id="badge_number"
                      value={formData.badge_number}
                      onChange={(e) => setFormData({ ...formData, badge_number: e.target.value })}
                      placeholder="BADGE-12345"
                    />
                  </div>

                  <div>
                    <Label htmlFor="chip_card_id">N° Carte à puce</Label>
                    <Input
                      id="chip_card_id"
                      value={formData.chip_card_id}
                      onChange={(e) => setFormData({ ...formData, chip_card_id: e.target.value })}
                      placeholder="CARD-XXXX-XXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount_percentage">Remise (%) *</Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.discount_percentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_percentage: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="electronic_wallet_balance">Porte-monnaie électronique (FCFA)</Label>
                    <Input
                      id="electronic_wallet_balance"
                      type="number"
                      min="0"
                      value={formData.electronic_wallet_balance}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          electronic_wallet_balance: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Client actif</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">{editingGuest ? "Modifier" : "Créer"}</Button>
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
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                Total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total clients</p>
              <p className="text-3xl font-bold">{guests.length}</p>
              <p className="text-xs text-muted-foreground">clients enregistrés</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <UserCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                Actifs
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Clients actifs</p>
              <p className="text-3xl font-bold">{activeGuests}</p>
              <p className="text-xs text-muted-foreground">en séjour</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Wallet className="w-6 h-6 text-violet-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                Solde total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Porte-monnaie total</p>
              <p className="text-3xl font-bold">{(totalWalletBalance / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">FCFA cumulés</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Percent className="w-6 h-6 text-amber-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                Remise moy.
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Remise moyenne</p>
              <p className="text-3xl font-bold">{avgDiscount.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">sur tous les clients</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Hôtel</TableHead>
              <TableHead>Séjour</TableHead>
              <TableHead>Badge / Cartes</TableHead>
              <TableHead className="text-right">Remise</TableHead>
              <TableHead className="text-right">Porte-monnaie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  <Hotel className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun client hébergé trouvé</p>
                </TableCell>
              </TableRow>
            ) : (
              guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>
                    <div className="font-medium">{guest.guest_name}</div>
                  </TableCell>
                  <TableCell>{guest.hotel_name || "-"}</TableCell>
                  <TableCell className="text-sm">
                    {guest.check_in_date ? (
                      <div>{format(new Date(guest.check_in_date), "dd MMM", { locale: fr })}</div>
                    ) : (
                      "-"
                    )}
                    {guest.check_out_date && (
                      <div className="text-muted-foreground">
                        {format(new Date(guest.check_out_date), "dd MMM", { locale: fr })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {guest.badge_number && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            Badge
                          </Badge>
                          <span className="text-muted-foreground font-mono text-xs">
                            {guest.badge_number}
                          </span>
                        </div>
                      )}
                      {guest.professional_card && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            Carte Pro
                          </Badge>
                          <span className="text-muted-foreground font-mono text-xs">
                            {guest.professional_card}
                          </span>
                        </div>
                      )}
                      {guest.chip_card_id && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            Puce
                          </Badge>
                          <span className="text-muted-foreground font-mono text-xs">
                            {guest.chip_card_id}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 text-primary">
                      <Percent className="w-3 h-3" />
                      <span className="font-semibold">{guest.discount_percentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <CreditCard className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">
                        {guest.electronic_wallet_balance.toLocaleString("fr-FR")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isActive(guest) ? "default" : "secondary"}>
                      {isActive(guest) ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(guest)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(guest)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(guest)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Désactiver
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

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du client hébergé</DialogTitle>
            <DialogDescription>
              Informations complètes sur le client hébergé
            </DialogDescription>
          </DialogHeader>

          {viewingGuest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nom du client</Label>
                  <p className="font-medium">{viewingGuest.guest_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hôtel</Label>
                  <p className="font-medium">{viewingGuest.hotel_name || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">N° Badge</Label>
                  <p className="font-medium font-mono">{viewingGuest.badge_number || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Carte Professionnelle</Label>
                  <p className="font-medium font-mono">{viewingGuest.professional_card || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Carte à Puce</Label>
                  <p className="font-medium font-mono">{viewingGuest.chip_card_id || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date d'arrivée</Label>
                  <p className="font-medium">
                    {viewingGuest.check_in_date
                      ? format(new Date(viewingGuest.check_in_date), "dd MMMM yyyy", { locale: fr })
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date de départ</Label>
                  <p className="font-medium">
                    {viewingGuest.check_out_date
                      ? format(new Date(viewingGuest.check_out_date), "dd MMMM yyyy", { locale: fr })
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Remise</Label>
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-primary" />
                    <p className="text-xl font-semibold text-primary">
                      {viewingGuest.discount_percentage}%
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Porte-monnaie électronique</Label>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xl font-semibold">
                      {viewingGuest.electronic_wallet_balance.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Statut</Label>
                <Badge variant={isActive(viewingGuest) ? "default" : "secondary"} className="mt-1">
                  {isActive(viewingGuest) ? "Actif" : "Inactif"}
                </Badge>
              </div>

              <div className="border-t pt-4 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Créé le:</span>
                  <span>{format(new Date(viewingGuest.created_at), "dd MMM yyyy à HH:mm", { locale: fr })}</span>
                </div>
                {viewingGuest.updated_at && (
                  <div className="flex justify-between mt-1">
                    <span>Modifié le:</span>
                    <span>{format(new Date(viewingGuest.updated_at), "dd MMM yyyy à HH:mm", { locale: fr })}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Hotel className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-medium mb-1">Avantages clients hébergés</p>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Remise automatique sur présentation de badge, carte professionnelle ou carte à puce</li>
              <li>Porte-monnaie électronique rechargeable pour paiements</li>
              <li>Avantages valables sur une escale donnée (période de séjour)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
