import { api } from '@/lib/api/client'  // ✅ Chemin absolu alias

export interface User {
  id: string
  email: string
  full_name: string
  role_id: string
  role_name?: string
  is_active: boolean
  created_at: string
}

export interface Role {
  id: string
  name: string
  description?: string
}

export const usersService = {
  /**
   * Liste des utilisateurs
   */
  async getUsers(params?: { role_id?: string; is_active?: boolean }) {
    return api.get<User[]>('/users', params)
  },

  /**
   * Détail d'un utilisateur
   */
  async getUser(id: string) {
    return api.get<User>(`/users/${id}`)
  },

  /**
   * Modifier un utilisateur
   */
  async updateUser(id: string, data: Partial<User>) {
    return api.put<User>(`/users/${id}`, data)
  },

  /**
   * Historique d'activité d'un utilisateur
   */
  async getUserActivity(id: string) {
    return api.get<any[]>(`/users/${id}/activity`)
  },

  /**
   * Liste des rôles
   */
  async getRoles() {
    return api.get<Role[]>('/roles')
  },
} as const  // ✅ TypeScript readonly
