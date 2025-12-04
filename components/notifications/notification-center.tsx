"use client"

import { useEffect, useState } from "react"
import { Bell, Check, CheckCheck, Trash2, X, AlertCircle, Info, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [open, setOpen] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

  useEffect(() => {
    if (open) {
      fetchNotifications()
      fetchStats()
    }
  }, [open, showUnreadOnly])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        user_id: "current-user-id", // Replace with actual user ID from auth context
        limit: "50",
      })

      if (showUnreadOnly) {
        params.append("unread_only", "true")
      }

      const response = await fetch(`${API_URL}/notifications?${params}`)
      const result = await response.json()

      if (response.ok) {
        setNotifications(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_URL}/notifications/stats?user_id=current-user-id`
      )
      const result = await response.json()

      if (response.ok) {
        setStats(result.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        )
        fetchStats()
      }
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id)

    if (unreadIds.length === 0) return

    try {
      const response = await fetch(`${API_URL}/notifications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unreadIds, mark_as_read: true }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        )
        fetchStats()
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/notifications?ids=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        fetchStats()
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const getIcon = (type: string, priority: string) => {
    if (priority === "urgent")
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
      )

    switch (type) {
      case "stock_alert":
        return (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
        )
      case "expiry_warning":
        return (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-md">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
        )
      case "order_update":
        return (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        )
      case "promotion":
        return (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
            <Info className="w-5 h-5 text-white" />
          </div>
        )
      case "system":
        return (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center shadow-md">
            <Info className="w-5 h-5 text-white" />
          </div>
        )
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center shadow-md">
            <Bell className="w-5 h-5 text-white" />
          </div>
        )
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 border-red-500/20"
      case "high":
        return "bg-orange-500/10 border-orange-500/20"
      case "medium":
        return "bg-blue-500/10 border-blue-500/20"
      case "low":
        return "bg-gray-500/10 border-gray-500/20"
      default:
        return "bg-gray-500/10 border-gray-500/20"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "À l'instant"
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-all h-10 w-10 rounded-lg">
          <div className="relative">
            <Bell className="h-5 w-5" />
            {stats && stats.unread > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-br from-red-500 to-pink-500 border-2 border-background shadow-lg animate-pulse"
              >
                {stats.unread > 99 ? "99+" : stats.unread}
              </Badge>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 rounded-xl border-border/50 shadow-xl" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-card to-card/50">
          <div>
            <h3 className="font-bold text-base">Notifications</h3>
            {stats && (
              <p className="text-xs text-muted-foreground font-medium">
                {stats.unread} non lue{stats.unread !== 1 ? "s" : ""} sur {stats.total}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="text-xs rounded-lg hover:bg-primary/10 font-medium"
            >
              {showUnreadOnly ? "Toutes" : "Non lues"}
            </Button>
            {stats && stats.unread > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={markAllAsRead}
                title="Tout marquer comme lu"
                className="h-8 w-8 rounded-lg hover:bg-primary/10"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <Bell className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {showUnreadOnly
                  ? "Aucune notification non lue"
                  : "Aucune notification"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-all relative group",
                    !notification.is_read && "bg-gradient-to-r from-blue-500/5 to-transparent border-l-2 border-blue-500"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {getIcon(notification.type, notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={cn(
                            "text-sm font-medium",
                            !notification.is_read && "font-bold"
                          )}
                        >
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-medium">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground font-medium">
                          {formatDate(notification.created_at)}
                        </p>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg hover:bg-green-500/10 hover:text-green-600"
                              onClick={() => markAsRead(notification.id)}
                              title="Marquer comme lu"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-red-500/10 hover:text-red-600"
                            onClick={() => deleteNotification(notification.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {notification.action_url && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs mt-2 font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent hover:from-purple-500 hover:to-pink-500"
                          onClick={() => {
                            window.location.href = notification.action_url!
                            markAsRead(notification.id)
                          }}
                        >
                          Voir les détails →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator className="bg-border/50" />
        <div className="p-3 bg-gradient-to-r from-card to-card/50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full rounded-lg hover:bg-primary/10 font-semibold transition-all"
            onClick={() => {
              window.location.href = "/dashboard/notifications"
              setOpen(false)
            }}
          >
            Voir toutes les notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
