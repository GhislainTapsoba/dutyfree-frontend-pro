"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, CreditCard, Gift, TrendingUp, Users, Eye, Pencil, Trash2, MoreVertical, Coins, History } from "lucide-react"
import { api } from "@/lib/api/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { PointsManagement } from "@/components/loyalty/points-management"
import { PointsHistory } from "@/components/loyalty/points-history"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LoyaltyCard {
  id: string
  card_number: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  tier: "bronze" | "silver" | "gold" | "platinum" | "standard"
  points_balance: number
  total_points_earned: number
  total_amount_spent: number
  issue_date: string
  expiry_date: string | null
  is_active: boolean
  created_at: string
  transactions?: any[]
}

interface LoyaltyStats {
  total_cards: number
  active_cards: number
  total_points: number
  total_spent: number
}

export default function LoyaltyPage() {
  const [cards, setCards] = useState<LoyaltyCard[]>([])
  const [stats, setStats] = useState<LoyaltyStats>({
    total_cards: 0,
    active_cards: 0,
    total_points: 0,
    total_spent: 0,
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<LoyaltyCard | null>(null)
  const [viewingCard, setViewingCard] = useState<LoyaltyCard | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<LoyaltyCard | null>(null)

  const [formData, setFormData] = useState({
    card_number: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    tier: "standard" as "bronze" | "silver" | "gold" | "platinum" | "standard",
    is_active: true,
    expiry_date: "",
  })

  useEffect(() => {
    loadLoyaltyCards()
  }, [])

  const loadLoyaltyCards = async () => {
    setLoading(true)
    try {
      const response = await api.get<LoyaltyCard[]>("/loyalty/cards")
      if (response.data) {
        // Normaliser les données avec valeurs par défaut
        const normalizedCards = response.data.map(card => ({
          ...card,
          points_balance: card.points_balance || 0,
          total_points_earned: card.total_points_earned || 0,
          total_amount_spent: card.total_amount_spent || 0,
          issue_date: card.issue_date || card.created_at || new Date().toISOString(),
          created_at: card.created_at || new Date().toISOString(),
        }))

        setCards(normalizedCards)

        // Calculate stats
        const totalCards = normalizedCards.length
        const activeCards = normalizedCards.filter((c: LoyaltyCard) => c.is_active).length
        const totalPoints = normalizedCards.reduce((sum: number, c: LoyaltyCard) => sum + (c.points_balance || 0), 0)
        const totalSpent = normalizedCards.reduce((sum: number, c: LoyaltyCard) => sum + (c.total_amount_spent || 0), 0)

        setStats({ total_cards: totalCards, active_cards: activeCards, total_points: totalPoints, total_spent: totalSpent })
      }
    } catch (error) {
      console.error("Erreur lors du chargement des cartes de fidélité:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = () => {
    setEditingCard(null)
    setFormData({
      card_number: "",
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      tier: "standard",
      is_active: true,
      expiry_date: "",
    })
    setDialogOpen(true)
  }

  const handleEdit = (card: LoyaltyCard) => {
    setEditingCard(card)
    setFormData({
      card_number: card.card_number,
      customer_name: card.customer_name,
      customer_email: card.customer_email || "",
      customer_phone: card.customer_phone || "",
      tier: card.tier,
      is_active: card.is_active,
      expiry_date: card.expiry_date || "",
    })
    setDialogOpen(true)
  }

  const handleView = async (card: LoyaltyCard) => {
    try {
      const response = await api.get<LoyaltyCard>(`/loyalty/cards/${card.id}`)
      if (response.data) {
        setViewingCard(response.data)
        setViewDialogOpen(true)
      } else {
        toast.error("Erreur lors du chargement des détails")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
    }
  }

  const handleDelete = async (card: LoyaltyCard) => {
    if (!confirm(`Êtes-vous sûr de vouloir désactiver la carte ${card.card_number} ?`)) {
      return
    }

    try {
      const response = await api.delete(`/loyalty/cards/${card.id}`)
      if (response.data || !response.error) {
        toast.success("Carte désactivée avec succès")
        loadLoyaltyCards()
      } else {
        toast.error(response.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleManagePoints = (card: LoyaltyCard) => {
    setSelectedCard(card)
    setPointsDialogOpen(true)
  }

  const handleViewHistory = (card: LoyaltyCard) => {
    setSelectedCard(card)
    setHistoryDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer_name || !formData.customer_phone) {
      toast.error("Veuillez remplir les champs obligatoires")
      return
    }

    try {
      let response

      if (editingCard) {
        // Mode édition
        response = await api.put<LoyaltyCard>(`/loyalty/cards/${editingCard.id}`, formData)
      } else {
        // Mode création
        response = await api.post<LoyaltyCard>("/loyalty/cards", formData)
      }

      if (response.data) {
        toast.success(editingCard ? "Carte modifiée avec succès" : "Carte créée avec succès")
        setDialogOpen(false)
        setEditingCard(null)
        loadLoyaltyCards()
      } else if (response.error) {
        toast.error(response.error)
      }
    } catch (error) {
      console.error(error)
      toast.error(editingCard ? "Erreur lors de la modification" : "Erreur lors de la création")
    }
  }

  const getTierBadge = (tier: string) => {
    const tiers = {
      standard: { label: "Standard", className: "bg-blue-900/20 text-blue-400 border-blue-400/30" },
      bronze: { label: "Bronze", className: "bg-orange-900/20 text-orange-400 border-orange-400/30" },
      silver: { label: "Argent", className: "bg-gray-400/20 text-gray-300 border-gray-300/30" },
      gold: { label: "Or", className: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30" },
      platinum: { label: "Platine", className: "bg-purple-500/20 text-purple-400 border-purple-400/30" },
    }
    const config = tiers[tier as keyof typeof tiers] || tiers.standard
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>
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
          <h1 className="text-2xl font-bold">Programme de Fidélité</h1>
          <p className="text-muted-foreground">
            Gérez les cartes de fidélité et les points clients
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle carte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCard ? "Modifier la carte de fidélité" : "Nouvelle carte de fidélité"}
                </DialogTitle>
                <DialogDescription>
                  {editingCard
                    ? `Modifiez les informations de la carte ${editingCard.card_number}`
                    : "Créez une nouvelle carte pour un client"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {editingCard && (
                  <div>
                    <Label htmlFor="card_number">Numéro de carte</Label>
                    <Input
                      id="card_number"
                      value={formData.card_number}
                      disabled
                      className="font-mono"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="customer_name">Nom du client *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customer_phone">Téléphone *</Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="+226 XX XX XX XX"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="client@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="tier">Niveau</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value: any) => setFormData({ ...formData, tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Argent</SelectItem>
                      <SelectItem value="gold">Or</SelectItem>
                      <SelectItem value="platinum">Platine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expiry_date">Date d'expiration (optionnelle)</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>

                {editingCard && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">
                      Carte active
                    </Label>
                  </div>
                )}
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

      {/* Stats Cards avec Design Moderne */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                Total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total cartes</p>
              <p className="text-3xl font-bold">{stats.total_cards}</p>
              <p className="text-xs text-muted-foreground">cartes émises</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                Actif
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Cartes actives</p>
              <p className="text-3xl font-bold">{stats.active_cards}</p>
              <p className="text-xs text-muted-foreground">clients fidèles</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Gift className="w-6 h-6 text-violet-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                Points
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Points totaux</p>
              <p className="text-3xl font-bold">{stats.total_points.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">points en circulation</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                CA
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Dépenses totales</p>
              <p className="text-3xl font-bold">{(stats.total_spent / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">FCFA de transactions</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="border-b bg-muted/30 px-6 py-4">
          <h3 className="text-lg font-semibold">Cartes de fidélité</h3>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos clients et leurs points de fidélité</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Carte</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Total dépensé</TableHead>
              <TableHead>Émission</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune carte de fidélité trouvée</p>
                </TableCell>
              </TableRow>
            ) : (
              cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-mono font-semibold">{card.card_number}</TableCell>
                  <TableCell>
                    <div className="font-medium">{card.customer_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {card.customer_phone && <div>{card.customer_phone}</div>}
                      {card.customer_email && (
                        <div className="text-muted-foreground text-xs">{card.customer_email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTierBadge(card.tier)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Gift className="w-3 h-3 text-primary" />
                      <span className="font-semibold text-primary">
                        {(card.points_balance || 0).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(card.total_amount_spent || 0).toLocaleString("fr-FR")} FCFA
                  </TableCell>
                  <TableCell className="text-sm">
                    {card.issue_date ? format(new Date(card.issue_date), "dd MMM yyyy", { locale: fr }) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={card.is_active ? "default" : "secondary"}>
                      {card.is_active ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => handleView(card)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManagePoints(card)}>
                          <Coins className="w-4 h-4 mr-2" />
                          Gérer les points
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewHistory(card)}>
                          <History className="w-4 h-4 mr-2" />
                          Historique
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(card)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(card)}
                          className="text-destructive"
                        >
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

      {/* Dialogues de gestion des points */}
      <PointsManagement
        open={pointsDialogOpen}
        onOpenChange={setPointsDialogOpen}
        card={selectedCard}
        onSuccess={loadLoyaltyCards}
      />

      <PointsHistory
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        card={selectedCard}
      />

      {/* Dialog de visualisation des détails */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la carte de fidélité</DialogTitle>
            <DialogDescription>
              Informations complètes de la carte {viewingCard?.card_number}
            </DialogDescription>
          </DialogHeader>

          {viewingCard && (
            <div className="space-y-6">
              {/* Informations de la carte */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Numéro de carte</Label>
                  <p className="font-mono font-semibold text-lg">{viewingCard.card_number}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Niveau</Label>
                  <div>{getTierBadge(viewingCard.tier)}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Nom du client</Label>
                  <p className="font-medium">{viewingCard.customer_name}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Téléphone</Label>
                  <p>{viewingCard.customer_phone || "-"}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="text-sm">{viewingCard.customer_email || "-"}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Statut</Label>
                  <Badge variant={viewingCard.is_active ? "default" : "secondary"}>
                    {viewingCard.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Statistiques de points */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Solde actuel</p>
                  <p className="text-2xl font-bold text-primary">
                    {(viewingCard.points_balance || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total gagné</p>
                  <p className="text-2xl font-bold text-green-500">
                    {(viewingCard.total_points_earned || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total dépensé</p>
                  <p className="text-2xl font-bold">
                    {(viewingCard.total_amount_spent || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Date d'émission</Label>
                  <p>
                    {viewingCard.issue_date
                      ? format(new Date(viewingCard.issue_date), "dd MMMM yyyy", { locale: fr })
                      : "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Date d'expiration</Label>
                  <p>
                    {viewingCard.expiry_date
                      ? format(new Date(viewingCard.expiry_date), "dd MMMM yyyy", { locale: fr })
                      : "Aucune"}
                  </p>
                </div>
              </div>

              {/* Dernières transactions */}
              {viewingCard.transactions && viewingCard.transactions.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Dernières transactions</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {viewingCard.transactions.slice(0, 5).map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-md text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {transaction.transaction_type === "earn" && "Gain de points"}
                            {transaction.transaction_type === "redeem" && "Utilisation de points"}
                            {transaction.transaction_type === "adjust" && "Ajustement"}
                          </p>
                          {transaction.description && (
                            <p className="text-xs text-muted-foreground">{transaction.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(transaction.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              transaction.points > 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {transaction.points > 0 ? "+" : ""}
                            {transaction.points}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Solde: {transaction.points_balance_after}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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
