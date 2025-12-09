import { api } from './client'

/**
 * Vérifie si le token JWT est expiré
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    const exp = decoded.exp

    if (!exp) return false

    // Vérifier si le token expire dans les 5 prochaines minutes
    const now = Math.floor(Date.now() / 1000)
    const expiresIn = exp - now

    console.log(`[Token] Expire dans ${expiresIn} secondes`)

    return expiresIn < 300 // 5 minutes
  } catch (error) {
    console.error('[Token] Erreur lors de la vérification:', error)
    return true
  }
}

/**
 * Récupère les informations du token
 */
export function getTokenInfo(token: string): { exp: number; email: string } | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return {
      exp: decoded.exp,
      email: decoded.email || decoded.user_metadata?.email,
    }
  } catch (error) {
    return null
  }
}

/**
 * Intercepteur pour gérer l'expiration du token
 * Redirige vers la page de connexion si le token est expiré
 */
export function setupTokenExpirationHandler() {
  if (typeof window === 'undefined') return

  // Vérifier le token toutes les minutes
  setInterval(() => {
    const token = api.getToken()

    if (!token) return

    if (isTokenExpired(token)) {
      console.warn('[Token] Token expiré, redirection vers la page de connexion...')

      // Nettoyer le token
      api.setToken(null)

      // Rediriger vers la page de connexion
      window.location.href = '/login?expired=true'
    }
  }, 60000) // Vérifier toutes les 60 secondes
}

/**
 * Hook pour vérifier le token avant chaque requête
 */
export function checkTokenBeforeRequest(): boolean {
  const token = api.getToken()

  if (!token) {
    console.warn('[Token] Aucun token trouvé')
    return false
  }

  if (isTokenExpired(token)) {
    console.warn('[Token] Token expiré')
    api.setToken(null)
    if (typeof window !== 'undefined') {
      window.location.href = '/login?expired=true'
    }
    return false
  }

  return true
}
