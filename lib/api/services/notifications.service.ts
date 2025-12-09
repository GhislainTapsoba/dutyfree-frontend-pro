import { api } from '../client'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  created_at: string
}

export interface NotificationStats {
  total: number
  unread: number
}

export const notificationsService = {
  /**
   * Récupérer toutes les notifications
   */
  async getNotifications(params?: { limit?: number; offset?: number; unread_only?: boolean }) {
    return api.get<Notification[]>('/notifications', params)
  },

  /**
   * Récupérer les statistiques des notifications
   */
  async getStats() {
    return api.get<NotificationStats>('/notifications/stats')
  },

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string) {
    return api.put<Notification>(`/notifications/${notificationId}/read`, {})
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead() {
    return api.put<{ success: boolean }>('/notifications/read-all', {})
  },

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string) {
    return api.delete(`/notifications/${notificationId}`)
  },
}
