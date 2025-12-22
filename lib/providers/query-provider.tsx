"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

// Configuration optimale du QueryClient
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Temps avant de considérer les données comme stale
        staleTime: 1000 * 60 * 5, // 5 minutes par défaut

        // Durée de conservation en cache
        gcTime: 1000 * 60 * 30, // 30 minutes (anciennement cacheTime)

        // Retry automatique sur erreurs
        retry: (failureCount, error: any) => {
          // Ne pas retry sur 401/403/404
          if (error?.response?.status && [401, 403, 404].includes(error.response.status)) {
            return false
          }
          // Retry 2 fois maximum
          return failureCount < 2
        },

        // Délai entre retries (exponential backoff)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch automatique
        refetchOnWindowFocus: true, // Refetch quand l'utilisateur revient
        refetchOnMount: true, // Refetch au mount si stale
        refetchOnReconnect: true, // Refetch après reconnexion internet

        // Ne pas suspendre par défaut
        suspense: false,

        // Déduplication automatique des requêtes identiques
        structuralSharing: true,
      },
      mutations: {
        // Retry mutations échouées
        retry: 1,

        // Timeout pour mutations
        networkMode: 'online',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: toujours créer un nouveau client
    return makeQueryClient()
  } else {
    // Browser: réutiliser le client existant
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  )
}

// Hook personnalisés pour queries fréquentes

export const queryKeys = {
  // Données statiques (cache long)
  categories: ['categories'] as const,
  currencies: ['currencies'] as const,
  paymentMethods: ['paymentMethods'] as const,
  pointOfSales: ['pointOfSales'] as const,

  // Produits
  products: {
    all: ['products'] as const,
    active: () => [...queryKeys.products.all, 'active'] as const,
    byCategory: (categoryId: string) => [...queryKeys.products.all, 'category', categoryId] as const,
    detail: (id: string) => [...queryKeys.products.all, id] as const,
    search: (query: string) => [...queryKeys.products.all, 'search', query] as const,
  },

  // Ventes
  sales: {
    all: ['sales'] as const,
    today: () => [...queryKeys.sales.all, 'today'] as const,
    byDate: (date: string) => [...queryKeys.sales.all, 'date', date] as const,
    detail: (id: string) => [...queryKeys.sales.all, id] as const,
  },

  // Dashboard
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    kpis: ['dashboard', 'kpis'] as const,
  },

  // Session
  session: {
    current: (userId: string) => ['session', 'current', userId] as const,
  },
}

// Configuration de stale time par type de données
export const staleTimeConfig = {
  // Données très statiques (changent rarement)
  static: 1000 * 60 * 60, // 1 heure

  // Données semi-statiques
  semiStatic: 1000 * 60 * 15, // 15 minutes

  // Données dynamiques
  dynamic: 1000 * 60 * 5, // 5 minutes

  // Données temps réel
  realtime: 1000 * 30, // 30 secondes
}
