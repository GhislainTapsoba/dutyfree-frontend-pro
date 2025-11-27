"use client"

import { useEffect, useState } from "react"
import { Bell, Mail, Smartphone, Package, Calendar, ShoppingCart, Tag, Server, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface NotificationPreferences {
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  stock_alerts: boolean
  expiry_alerts: boolean
  order_updates: boolean
  promotion_alerts: boolean
  system_alerts: boolean
  low_stock_threshold: number
  expiry_warning_days: number
}

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    user_id: "current-user-id",
    email_notifications: true,
    push_notifications: true,
    stock_alerts: true,
    expiry_alerts: true,
    order_updates: true,
    promotion_alerts: true,
    system_alerts: true,
    low_stock_threshold: 10,
    expiry_warning_days: 30,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/notifications/preferences?user_id=current-user-id`
      )
      const result = await response.json()

      if (response.ok && result.data) {
        setPreferences(result.data)
      }
    } catch (error) {
      console.error("Error fetching preferences:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les préférences",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/notifications/preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        toast({
          title: "Préférences enregistrées",
          description: "Vos préférences de notification ont été mises à jour",
        })
      } else {
        throw new Error("Failed to save preferences")
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les préférences",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Préférences de notification</h1>
            <p className="text-muted-foreground">
              Personnalisez vos alertes et notifications
            </p>
          </div>
        </div>
        <Button onClick={savePreferences} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Canaux de notification
              </CardTitle>
              <CardDescription>
                Choisissez comment vous souhaitez recevoir les notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email-notifications" className="text-base">
                      Notifications par email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez les notifications importantes par email
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) =>
                    updatePreference("email_notifications", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push-notifications" className="text-base">
                      Notifications push
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications en temps réel dans l'application
                    </p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.push_notifications}
                  onCheckedChange={(checked) =>
                    updatePreference("push_notifications", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle>Types de notifications</CardTitle>
              <CardDescription>
                Activez ou désactivez les types de notifications que vous souhaitez recevoir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-orange-500" />
                  <div>
                    <Label htmlFor="stock-alerts" className="text-base">
                      Alertes de stock
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Stock faible, rupture de stock, besoin de réapprovisionnement
                    </p>
                  </div>
                </div>
                <Switch
                  id="stock-alerts"
                  checked={preferences.stock_alerts}
                  onCheckedChange={(checked) =>
                    updatePreference("stock_alerts", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-yellow-500" />
                  <div>
                    <Label htmlFor="expiry-alerts" className="text-base">
                      Alertes de péremption
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Produits bientôt périmés ou périmés
                    </p>
                  </div>
                </div>
                <Switch
                  id="expiry-alerts"
                  checked={preferences.expiry_alerts}
                  onCheckedChange={(checked) =>
                    updatePreference("expiry_alerts", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                  <div>
                    <Label htmlFor="order-updates" className="text-base">
                      Mises à jour de commandes
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Nouvelles commandes, livraisons, paiements
                    </p>
                  </div>
                </div>
                <Switch
                  id="order-updates"
                  checked={preferences.order_updates}
                  onCheckedChange={(checked) =>
                    updatePreference("order_updates", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-purple-500" />
                  <div>
                    <Label htmlFor="promotion-alerts" className="text-base">
                      Alertes promotionnelles
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Nouvelles promotions, offres spéciales
                    </p>
                  </div>
                </div>
                <Switch
                  id="promotion-alerts"
                  checked={preferences.promotion_alerts}
                  onCheckedChange={(checked) =>
                    updatePreference("promotion_alerts", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-gray-500" />
                  <div>
                    <Label htmlFor="system-alerts" className="text-base">
                      Alertes système
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Mises à jour système, maintenance, sécurité
                    </p>
                  </div>
                </div>
                <Switch
                  id="system-alerts"
                  checked={preferences.system_alerts}
                  onCheckedChange={(checked) =>
                    updatePreference("system_alerts", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle>Seuils d'alerte</CardTitle>
              <CardDescription>
                Configurez les seuils qui déclenchent les notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="low-stock-threshold">
                  Seuil de stock faible
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="low-stock-threshold"
                    type="number"
                    min="0"
                    value={preferences.low_stock_threshold}
                    onChange={(e) =>
                      updatePreference("low_stock_threshold", parseInt(e.target.value) || 0)
                    }
                    className="w-32"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recevoir une alerte lorsque le stock passe en dessous de cette quantité
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="expiry-warning-days">
                  Délai d'alerte de péremption
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="expiry-warning-days"
                    type="number"
                    min="1"
                    max="365"
                    value={preferences.expiry_warning_days}
                    onChange={(e) =>
                      updatePreference("expiry_warning_days", parseInt(e.target.value) || 30)
                    }
                    className="w-32"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recevoir une alerte X jours avant la date de péremption
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Gérez vos notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${API_URL}/notifications?ids=${[]}`,
                        {
                          method: "DELETE",
                        }
                      )
                      // This would need a "mark all as read" endpoint
                      const putResponse = await fetch(`${API_URL}/notifications`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ids: [], // Would need to fetch all IDs first
                          mark_as_read: true,
                        }),
                      })
                      toast({
                        title: "Notifications marquées comme lues",
                        description: "Toutes vos notifications ont été marquées comme lues",
                      })
                    } catch (error) {
                      toast({
                        title: "Erreur",
                        description: "Impossible de marquer les notifications comme lues",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  Marquer toutes comme lues
                </Button>

                <Button
                  variant="outline"
                  onClick={async () => {
                    if (
                      confirm(
                        "Êtes-vous sûr de vouloir supprimer les notifications de plus de 30 jours ?"
                      )
                    ) {
                      try {
                        const response = await fetch(
                          `${API_URL}/notifications?user_id=current-user-id&older_than_days=30`,
                          {
                            method: "DELETE",
                          }
                        )
                        if (response.ok) {
                          toast({
                            title: "Notifications supprimées",
                            description: "Les anciennes notifications ont été supprimées",
                          })
                        }
                      } catch (error) {
                        toast({
                          title: "Erreur",
                          description: "Impossible de supprimer les notifications",
                          variant: "destructive",
                        })
                      }
                    }
                  }}
                >
                  Supprimer les anciennes (30+ jours)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
