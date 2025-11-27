import { api } from '../client'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  role_id: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role_id: string
  role_name?: string
  is_active: boolean
  created_at: string
}

export const authService = {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials) {
    const response = await api.post<{ user: User; token: string }>('/auth/login', credentials)

    if (response.data?.token) {
      api.setToken(response.data.token)
    }

    return response
  },

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterData) {
    return api.post<{ user: User }>('/auth/register', data)
  },

  /**
   * Déconnexion
   */
  async logout() {
    api.setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
  },

  /**
   * Récupérer l'utilisateur connecté
   */
  async getCurrentUser() {
    return api.get<User>('/users/me')
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!api.getToken()
  },
}
