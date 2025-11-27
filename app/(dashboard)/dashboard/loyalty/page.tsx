"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, CreditCard, Gift, TrendingUp, Users } from "lucide-react"
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
  tier: "bronze" | "silver" | "gold" | "platinum"
  points_balance: number
  total_points_earned: number
  total_spent: number
  issue_date: string
  expiry_date: string | null
  is_active: boolean
  created_at: string
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

  const [formData, setFormData] = useState({
    card_number: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    tier: "bronze" as "bronze" | "silver" | "gold" | "platinum",
    points_balance: 0,
    issue_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
  })

  useEffect(() => {
    loadLoyaltyCards()
  }, [])

  const loadLoyaltyCards = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/loyalty/cards")
      const data = await response.json()
      if (data.data) {
        setCards(data.data)

        // Calculate stats
        const totalCards = data.data.length
        const activeCards = data.data.filter((c: LoyaltyCard) => c.is_active).length
        const totalPoints = data.data.reduce((sum: number, c: LoyaltyCard) => sum + c.points_balance, 0)
        const totalSpent = data.data.reduce((sum: number, c: LoyaltyCard) => sum + c.total_spent, 0)

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
    // Generate card number
    const cardNumber = `LYL-${Date.now().toString().slice(-8)}`
    setFormData({
      card_number: cardNumber,
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      tier: "bronze",
      points_balance: 0,
      issue_date: new Date().toISOString().split("T")[0],
      expiry_date: "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer_name || !formData.customer_phone) {
      toast.error("Veuillez remplir les champs obligatoires")
      return
    }

    try {
      const response = await fetch("http://localhost:3001/api/loyalty/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Carte de fidélité créée avec succès")
        setDialogOpen(false)
        loadLoyaltyCards()
      } else {
        toast.error(data.error || "Erreur lors de la création")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la création")
    }
  }

  const getTierBadge = (tier: string) => {
    const tiers = {
      bronze: { label: "Bronze", className: "bg-orange-900/20 text-orange-400 border-orange-400/30" },
      silver: { label: "Argent", className: "bg-gray-400/20 text-gray-300 border-gray-300/30" },
      gold: { label: "Or", className: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30" },
      platinum: { label: "Platine", className: "bg-purple-500/20 text-purple-400 border-purple-400/30" },
    }
    const config = tiers[tier as keyof typeof tiers] || tiers.bronze
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
                <DialogTitle>Nouvelle carte de fidélité</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle carte pour un client
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="card_number">Numéro de carte</Label>
                  <Input
                    id="card_number"
                    value={formData.card_number}
                    disabled
                    className="font-mono"
                  />
                </div>

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
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Argent</SelectItem>
                      <SelectItem value="gold">Or</SelectItem>
                      <SelectItem value="platinum">Platine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issue_date">Date d'émission</Label>
                    <Input
                      id="issue_date"
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiry_date">Date d'expiration</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    />
                  </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total cartes</p>
              <p className="text-2xl font-bold">{stats.total_cards}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cartes actives</p>
              <p className="text-2xl font-bold">{stats.active_cards}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Points totaux</p>
              <p className="text-2xl font-bold">{stats.total_points.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dépenses totales</p>
              <p className="text-2xl font-bold">{(stats.total_spent / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
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
                        {card.points_balance.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {card.total_spent.toLocaleString("fr-FR")} FCFA
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(card.issue_date), "dd MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={card.is_active ? "default" : "secondary"}>
                      {card.is_active ? "Active" : "Inactive"}
                    </Badge>
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
