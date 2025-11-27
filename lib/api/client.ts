/**
 * API Client pour communiquer avec le backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL

    // Récupérer le token depuis le localStorage si disponible
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      if (this.token) {
        console.log('[API Client] Token chargé depuis localStorage, longueur:', this.token.length)
      } else {
        console.log('[API Client] Aucun token trouvé dans localStorage')
      }
    }
  }

  /**
   * Définir le token d'authentification
   */
  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        // Stocker dans localStorage
        localStorage.setItem('auth_token', token)
        // Stocker dans les cookies pour le middleware
        document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`
        console.log("Token stocké dans localStorage et cookie")
        console.log("Cookie défini:", document.cookie.includes('auth_token'))
      } else {
        localStorage.removeItem('auth_token')
        // Supprimer le cookie
        document.cookie = 'auth_token=; path=/; max-age=0'
        console.log("Token supprimé du localStorage et cookie")
      }
    }
  }

  /**
   * Récupérer le token actuel
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * Effectuer une requête HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> ?? {}),
    }


    // Ajouter le token d'authentification si disponible
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
      console.log('[API Client] Token présent, longueur:', this.token.length)
      console.log('[API Client] Header Authorization:', headers['Authorization']?.substring(0, 30) + '...')
    } else {
      console.warn('[API Client] Pas de token disponible pour', endpoint)
    }

    console.log('[API Client] Requête:', options.method || 'GET', url)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[API Client] Erreur réponse:', response.status, data)
        return {
          error: data.error || data.message || 'Une erreur est survenue',
        }
      }

      console.log('[API Client] Succès:', url, '- Type de données:', Array.isArray(data) ? 'Array' : typeof data)

      return { data }
    } catch (error) {
      console.error('API Error:', error)
      return {
        error: error instanceof Error ? error.message : 'Erreur réseau',
      }
    }
  }

  /**
   * Requête GET
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    return this.request<T>(url, { method: 'GET' })
  }

  /**
   * Requête POST
   */
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * Requête PUT
   */
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * Requête PATCH
   */
  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * Requête DELETE
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
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
