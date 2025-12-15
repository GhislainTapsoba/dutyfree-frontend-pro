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

export interface AuthUser {
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
   * Debug: Afficher l'état d'authentification
   */
  debugAuth() {
    if (typeof window === 'undefined') return 'Server-side'
    
    try {
      const apiToken = api.getToken()
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]
      
      return {
        apiToken: apiToken ? `${apiToken.substring(0, 10)}...` : null,
        cookieToken: cookieToken ? `${cookieToken.substring(0, 10)}...` : null,
        isAuthenticated: this.isAuthenticated()
      }
    } catch (error) {
      console.warn('[Auth Debug] Erreur:', error)
      return { error: 'Erreur debug' }
    }
  },
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials) {
    const response = await api.post<{ user: AuthUser; token: string }>('/auth/login', credentials)

    if (response.data?.token) {
      api.setToken(response.data.token)
      
      // Stocker les infos utilisateur dans localStorage
      if (typeof window !== 'undefined' && response.data.user) {
        localStorage.setItem('user_data', JSON.stringify(response.data.user))
        console.log('[Auth] Données utilisateur stockées:', response.data.user)
      }
    }

    return response
  },

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterData) {
    return api.post<{ user: AuthUser }>('/auth/register', data)
  },

  /**
   * Déconnexion
   */
  async logout() {
    api.setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data')
      localStorage.removeItem('auth_token')
      document.cookie = 'auth_token=; path=/; max-age=0'
    }
  },

  /**
   * Récupérer l'utilisateur connecté
   */
  async getAuthenticatedUser() {
    return api.get<AuthUser>('/me')
  },

  /**
   * Décoder le token JWT pour extraire les informations utilisateur
   */
  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      return decoded
    } catch (error) {
      console.warn('[Auth] Erreur décodage token:', error)
      return null
    }
  },

  /**
   * Récupérer l'utilisateur depuis le token JWT
   */
  getUserFromToken(): AuthUser | null {
    if (typeof window === 'undefined') return null
    
    // Récupérer les données utilisateur depuis localStorage
    const userDataStr = localStorage.getItem('user_data')
    console.log('[Auth] user_data brut:', userDataStr)
    
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr)
        console.log('[Auth] Données utilisateur récupérées:', userData)
        console.log('[Auth] Role détecté:', userData.role)
        
        const user = {
          id: userData.id,
          email: userData.email,
          full_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
          role_id: userData.role || 'guest',
          role_name: userData.role || 'guest',
          point_of_sale_id: userData.pointOfSaleId,
          is_active: userData.isActive !== false,
          created_at: userData.createdAt || new Date().toISOString()
        }
        
        console.log('[Auth] User final:', user)
        return user
      } catch (error) {
        console.error('[Auth] Erreur parsing user_data:', error)
      }
    } else {
      console.warn('[Auth] Aucune donnée user_data dans localStorage')
    }
    
    return null
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const apiToken = api.getToken()
      if (apiToken) return true
      
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]
      
      if (cookieToken) {
        api.setToken(cookieToken)
        return true
      }
      
      return false
    } catch (error) {
      console.warn('[Auth] Erreur vérification:', error)
      return false
    }
  },
}
