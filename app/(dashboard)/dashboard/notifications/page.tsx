"use client"

import { useEffect, useState } from "react"
import { Bell, Check, CheckCheck, Trash2, Filter, Settings, AlertCircle, Info, AlertTriangle, CheckCircle2, Package, Calendar, Tag, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Notification {
  id: string
  type: "stock_alert" | "expiry_warning" | "order_update" | "promotion" | "system" | "info"
  title: string
  message: string
  priority: "low" | "medium" | "high" | "urgent"
  is_read: boolean
  created_at: string
  action_url?: string
  related_entity_type?: string
  related_entity_id?: string
}

interface NotificationStats {
  total: number
  unread: number
  read: number
  by_type: Record<string, number>
  by_priority: Record<string, number>
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

  useEffect(() => {
    fetchNotifications()
    fetchStats()
  }, [filterType, filterStatus])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: "100",
      })

      if (filterType !== "all") {
        params.append("type", filterType)
      }

      if (filterStatus === "unread") {
        params.append("unread_only", "true")
      }

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]
      
      const response = await fetch(`${API_URL}/notifications?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      const result = await response.json()

      if (response.ok) {
        let data = result.data || []

        // Filter by status on client side if needed
        if (filterStatus === "read") {
          data = data.filter((n: Notification) => n.is_read)
        }

        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]
      
      const response = await fetch(
        `${API_URL}/notifications/stats`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      )
      const result = await response.json()

      if (response.ok) {
        setStats(result.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const markAsRead = async (ids: string[]) => {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, mark_as_read: true }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n))
        )
        setSelectedNotifications(new Set())
        fetchStats()
      }
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
    }
  }

  const deleteNotifications = async (ids: string[]) => {
    try {
      const response = await fetch(`${API_URL}/notifications?ids=${ids.join(",")}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)))
        setSelectedNotifications(new Set())
        fetchStats()
      }
    } catch (error) {
      console.error("Error deleting notifications:", error)
    }
  }

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedNotifications)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedNotifications(newSelection)
  }

  const selectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set())
    } else {
      setSelectedNotifications(new Set(notifications.map((n) => n.id)))
    }
  }

  const getIcon = (type: string, priority: string) => {
    if (priority === "urgent") return <AlertCircle className="w-5 h-5 text-red-500" />

    switch (type) {
      case "stock_alert":
        return <Package className="w-5 h-5 text-orange-500" />
      case "expiry_warning":
        return <Calendar className="w-5 h-5 text-yellow-500" />
      case "order_update":
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />
      case "promotion":
        return <Tag className="w-5 h-5 text-purple-500" />
      case "system":
        return <Server className="w-5 h-5 text-gray-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      urgent: { label: "Urgent", variant: "destructive" as const },
      high: { label: "Élevé", variant: "default" as const },
      medium: { label: "Moyen", variant: "secondary" as const },
      low: { label: "Faible", variant: "outline" as const },
    }
    return config[priority as keyof typeof config] || config.medium
  }

  const getTypeBadge = (type: string) => {
    const config = {
      stock_alert: { label: "Stock", className: "bg-orange-500/10 text-orange-500" },
      expiry_warning: { label: "Péremption", className: "bg-yellow-500/10 text-yellow-500" },
      order_update: { label: "Commande", className: "bg-blue-500/10 text-blue-500" },
      promotion: { label: "Promotion", className: "bg-purple-500/10 text-purple-500" },
      system: { label: "Système", className: "bg-gray-500/10 text-gray-500" },
      info: { label: "Info", className: "bg-blue-500/10 text-blue-500" },
    }
    return config[type as keyof typeof config] || config.info
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "À l'instant"
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`
    if (diffInMinutes < 10080) return `Il y a ${Math.floor(diffInMinutes / 1440)} j`

    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-white/90 mt-1">
              Gérez vos alertes et notifications système
            </p>
          </div>
          <Link href="/dashboard/notifications/preferences">
            <Button variant="secondary" className="bg-white/20 backdrop-blur-sm border-white/20 hover:bg-white/30">
              <Settings className="mr-2 h-4 w-4" />
              Préférences
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non lues</p>
                <p className="text-2xl font-bold text-blue-500">{stats.unread}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lues</p>
                <p className="text-2xl font-bold text-green-500">{stats.read}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgentes</p>
                <p className="text-2xl font-bold text-red-500">
                  {stats.by_priority?.urgent || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="stock_alert">Alertes stock</SelectItem>
                  <SelectItem value="expiry_warning">Péremptions</SelectItem>
                  <SelectItem value="order_update">Commandes</SelectItem>
                  <SelectItem value="promotion">Promotions</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="unread">Non lues</SelectItem>
                <SelectItem value="read">Lues</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {selectedNotifications.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAsRead(Array.from(selectedNotifications))}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Marquer comme lu ({selectedNotifications.size})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteNotifications(Array.from(selectedNotifications))}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer ({selectedNotifications.size})
                </Button>
              </>
            )}
            {stats && stats.unread > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Tout marquer comme lu
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedNotifications.size === notifications.length
                ? "Tout désélectionner"
                : "Tout sélectionner"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Bell className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                  !notification.is_read && "bg-blue-500/5"
                )}
                onClick={() => toggleSelection(notification.id)}
              >
                <div className="flex gap-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    className="mt-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type, notification.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={cn(
                            "text-sm font-medium",
                            !notification.is_read && "font-semibold"
                          )}
                        >
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getPriorityBadge(notification.priority).variant}
                          className="text-xs"
                        >
                          {getPriorityBadge(notification.priority).label}
                        </Badge>
                        <Badge className={cn("text-xs", getTypeBadge(notification.type).className)}>
                          {getTypeBadge(notification.type).label}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </p>
                      {notification.action_url && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = notification.action_url!
                            markAsRead([notification.id])
                          }}
                        >
                          Voir les détails →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

