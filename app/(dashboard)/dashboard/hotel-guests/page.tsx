"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Hotel, Percent, CreditCard } from "lucide-react"
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

interface HotelGuest {
  id: string
  guest_code: string
  full_name: string
  hotel_name: string
  room_number: string | null
  check_in_date: string
  check_out_date: string | null
  badge_number: string | null
  card_number: string | null
  discount_percentage: number
  electronic_wallet_balance: number
  is_active: boolean
  created_at: string
}

export default function HotelGuestsPage() {
  const [guests, setGuests] = useState<HotelGuest[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    guest_code: "",
    full_name: "",
    hotel_name: "",
    room_number: "",
    check_in_date: new Date().toISOString().split("T")[0],
    check_out_date: "",
    badge_number: "",
    card_number: "",
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
      const response = await fetch("http://localhost:3001/api/hotel-guests")
      const data = await response.json()
      if (data.data) setGuests(data.data)
    } catch (error) {
      console.error("Erreur lors du chargement des clients hébergés:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.full_name || !formData.hotel_name) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const response = await fetch("http://localhost:3001/api/hotel-guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Client hébergé ajouté avec succès")
        setDialogOpen(false)
        loadGuests()
      } else {
        toast.error(data.error || "Erreur lors de la création")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la création")
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
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nouveau client hébergé</DialogTitle>
                <DialogDescription>
                  Enregistrez un client hébergé avec ses avantages (remise + porte-monnaie électronique)
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guest_code">Code client</Label>
                    <Input
                      id="guest_code"
                      value={formData.guest_code}
                      onChange={(e) => setFormData({ ...formData, guest_code: e.target.value })}
                      placeholder="AUTO"
                    />
                  </div>

                  <div>
                    <Label htmlFor="full_name">Nom complet *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hotel_name">Hôtel *</Label>
                    <Input
                      id="hotel_name"
                      value={formData.hotel_name}
                      onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
                      placeholder="Hôtel Azalaï"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="room_number">N° Chambre</Label>
                    <Input
                      id="room_number"
                      value={formData.room_number}
                      onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                      placeholder="101"
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
                    <Label htmlFor="card_number">N° Carte à puce</Label>
                    <Input
                      id="card_number"
                      value={formData.card_number}
                      onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
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
                <Button type="submit">Créer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Hôtel</TableHead>
              <TableHead>Séjour</TableHead>
              <TableHead>Badge / Carte</TableHead>
              <TableHead className="text-right">Remise</TableHead>
              <TableHead className="text-right">Porte-monnaie</TableHead>
              <TableHead>Statut</TableHead>
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
                  <TableCell className="font-mono font-semibold">{guest.guest_code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{guest.full_name}</div>
                    {guest.room_number && (
                      <div className="text-xs text-muted-foreground">Chambre {guest.room_number}</div>
                    )}
                  </TableCell>
                  <TableCell>{guest.hotel_name}</TableCell>
                  <TableCell className="text-sm">
                    <div>{format(new Date(guest.check_in_date), "dd MMM", { locale: fr })}</div>
                    {guest.check_out_date && (
                      <div className="text-muted-foreground">
                        {format(new Date(guest.check_out_date), "dd MMM", { locale: fr })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
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
                      {guest.card_number && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            Carte
                          </Badge>
                          <span className="text-muted-foreground font-mono text-xs">
                            {guest.card_number}
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

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
