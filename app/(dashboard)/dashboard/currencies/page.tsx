"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, DollarSign, Edit, RefreshCw, Coins, CheckCircle2, Star } from "lucide-react"
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

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  exchange_rate: number
  is_default: boolean
  is_active: boolean
  updated_at: string
}

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null)

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    exchange_rate: 1,
    is_default: false,
    is_active: true,
  })

  useEffect(() => {
    loadCurrencies()
  }, [])

  const loadCurrencies = async () => {
    setLoading(true)
    try {
      const response = await api.get("/currencies")
      if (response.data) {
        setCurrencies(response.data)
      } else if (response.error) {
        toast.error(response.error)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des devises:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (currency?: Currency) => {
    if (currency) {
      setEditingCurrency(currency)
      setFormData({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        exchange_rate: currency.exchange_rate,
        is_default: currency.is_default,
        is_active: currency.is_active,
      })
    } else {
      setEditingCurrency(null)
      setFormData({
        code: "",
        name: "",
        symbol: "",
        exchange_rate: 1,
        is_default: false,
        is_active: true,
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.name || !formData.symbol) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const response = editingCurrency
        ? await api.put(`/currencies/${editingCurrency.code}`, formData)
        : await api.post("/currencies", formData)

      if (response.data) {
        toast.success(editingCurrency ? "Devise modifiée" : "Devise créée")
        setDialogOpen(false)
        loadCurrencies()
      } else if (response.error) {
        toast.error(response.error)
      }
    } catch (error) {
      console.error(error)
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

  const activeCurrencies = currencies.filter(c => c.is_active).length
  const defaultCurrency = currencies.find(c => c.is_default)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Devises</h1>
          <p className="text-muted-foreground">
            Gérez les devises et taux de change (XOF, EUR, USD)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCurrencies}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <DollarSign className="w-4 h-4 mr-2" />
                Nouvelle devise
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingCurrency ? "Modifier la devise" : "Nouvelle devise"}
                  </DialogTitle>
                  <DialogDescription>
                    Configurez les informations de la devise
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Code (ISO) *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value.toUpperCase() })
                        }
                        placeholder="XOF"
                        maxLength={3}
                        required
                        disabled={!!editingCurrency}
                      />
                    </div>

                    <div>
                      <Label htmlFor="symbol">Symbole *</Label>
                      <Input
                        id="symbol"
                        value={formData.symbol}
                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                        placeholder="FCFA"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Franc CFA"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="exchange_rate">Taux de change *</Label>
                    <Input
                      id="exchange_rate"
                      type="number"
                      min="0"
                      step="0.000001"
                      value={formData.exchange_rate}
                      onChange={(e) =>
                        setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) || 1 })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Taux par rapport à la devise par défaut
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_default: checked })
                      }
                    />
                    <Label htmlFor="is_default">Devise par défaut</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Devise active</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">{editingCurrency ? "Modifier" : "Créer"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards avec Design Moderne */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Coins className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                Total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total devises</p>
              <p className="text-3xl font-bold">{currencies.length}</p>
              <p className="text-xs text-muted-foreground">configurées</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                Actives
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Devises actives</p>
              <p className="text-3xl font-bold">{activeCurrencies}</p>
              <p className="text-xs text-muted-foreground">en utilisation</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                Par défaut
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Devise par défaut</p>
              <p className="text-3xl font-bold">{defaultCurrency?.code || "-"}</p>
              <p className="text-xs text-muted-foreground">{defaultCurrency?.symbol || "Non définie"}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Symbole</TableHead>
              <TableHead className="text-right">Taux de change</TableHead>
              <TableHead>Par défaut</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière mise à jour</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune devise trouvée</p>
                </TableCell>
              </TableRow>
            ) : (
              currencies.map((currency) => (
                <TableRow key={currency.id}>
                  <TableCell className="font-mono font-semibold">{currency.code}</TableCell>
                  <TableCell className="font-medium">{currency.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{currency.symbol}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {currency.exchange_rate.toFixed(6)}
                  </TableCell>
                  <TableCell>
                    {currency.is_default && <Badge variant="default">Par défaut</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={currency.is_active ? "default" : "secondary"}>
                      {currency.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(currency.updated_at), "dd MMM yyyy HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(currency)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
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
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-medium mb-1">À propos des taux de change</p>
            <p className="text-muted-foreground">
              Les taux de change sont utilisés pour convertir automatiquement les prix entre devises.
              Assurez-vous de les mettre à jour régulièrement pour refléter les taux actuels du marché.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
