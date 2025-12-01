import axios from 'axios'

/**
 * API Client avec Axios pour communiquer avec le backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private axiosInstance: any
  private token: string | null = null

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Intercepteur de requête pour ajouter le token
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: any) => Promise.reject(error)
    )

    // Intercepteur de réponse pour gérer les erreurs
    this.axiosInstance.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        return Promise.reject(error)
      }
    )
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`
        
        // Décoder le token pour extraire le rôle
        try {
          const payload = token.split('.')[1]
          const decoded = JSON.parse(atob(payload))
          const isAdmin = decoded.email === 'admin@dutyfree.com'
          const role = isAdmin ? 'admin' : 'user'
          document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Strict`
          console.log('[API Client] Rôle défini:', role, 'pour email:', decoded.email)
        } catch (error) {
          console.warn('[API Client] Erreur décodage token:', error)
          document.cookie = `user_role=user; path=/; max-age=86400; SameSite=Strict`
        }
      } else {
        document.cookie = 'auth_token=; path=/; max-age=0'
        document.cookie = 'user_role=; path=/; max-age=0'
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token
    
    if (typeof window !== 'undefined') {
      try {
        const cookieToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1]
        
        if (cookieToken && cookieToken !== 'undefined') {
          this.token = cookieToken
          return cookieToken
        }
      } catch (error) {
        // Erreur silencieuse
      }
    }
    
    return null
  }

  private async handleRequest<T>(request: Promise<any>): Promise<ApiResponse<T>> {
    try {
      const response = await request
      // Si le backend retourne { data: [...] }, on extrait le tableau
      // Sinon on retourne la réponse telle quelle
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return { data: response.data.data }
      }
      return { data: response.data }
    } catch (error: any) {
      if (error?.response) {
        const message = error.response?.data?.error || 
                       error.response?.data?.message || 
                       error.message || 
                       'Une erreur est survenue'
        return { error: message }
      }
      return { error: 'Erreur réseau' }
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.handleRequest(this.axiosInstance.get(endpoint, { params }))
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.handleRequest(this.axiosInstance.post(endpoint, body))
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.handleRequest(this.axiosInstance.put(endpoint, body))
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.handleRequest(this.axiosInstance.patch(endpoint, body))
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.handleRequest(this.axiosInstance.delete(endpoint))
  }
}

// Instance singleton du client API
export const apiClient = new ApiClient(API_URL)

// Export des méthodes pour faciliter l'utilisation
export const api = {
  get: <T>(endpoint: string, params?: Record<string, any>) => apiClient.get<T>(endpoint, params),
  post: <T>(endpoint: string, body?: any) => apiClient.post<T>(endpoint, body),
  put: <T>(endpoint: string, body?: any) => apiClient.put<T>(endpoint, body),
  patch: <T>(endpoint: string, body?: any) => apiClient.patch<T>(endpoint, body),
  delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint),
  setToken: (token: string | null) => apiClient.setToken(token),
  getToken: () => apiClient.getToken(),
}
