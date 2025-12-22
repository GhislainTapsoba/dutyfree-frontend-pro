"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsService, paymentsService } from '@/lib/api'
import { queryKeys, staleTimeConfig } from '@/lib/providers/query-provider'

// ==========================================
// DONNÉES STATIQUES (Cache long)
// ==========================================

/**
 * Hook pour récupérer les catégories
 * Cache: 1h (données très statiques)
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const response = await productsService.getCategories()
      return response.data || []
    },
    staleTime: staleTimeConfig.static,
    gcTime: staleTimeConfig.static * 24, // 24h en cache
  })
}

/**
 * Hook pour récupérer les devises
 * Cache: 1h (données très statiques)
 */
export function useCurrencies() {
  return useQuery({
    queryKey: queryKeys.currencies,
    queryFn: async () => {
      const response = await paymentsService.getCurrencies()
      return response.data || []
    },
    staleTime: staleTimeConfig.static,
    gcTime: staleTimeConfig.static * 24,
  })
}

/**
 * Hook pour récupérer les méthodes de paiement
 * Cache: 1h (données très statiques)
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: queryKeys.paymentMethods,
    queryFn: async () => {
      const response = await paymentsService.getPaymentMethods()
      return response.data || []
    },
    staleTime: staleTimeConfig.static,
    gcTime: staleTimeConfig.static * 24,
  })
}

// ==========================================
// PRODUITS (Cache moyen)
// ==========================================

/**
 * Hook pour récupérer les produits actifs
 * Cache: 15 minutes
 * Supporte filtres et recherche avec déduplication automatique
 */
export function useProducts(filters?: {
  is_active?: boolean
  in_stock?: boolean
  category_id?: string
  search?: string
}) {
  return useQuery({
    queryKey: filters?.search
      ? queryKeys.products.search(filters.search)
      : filters?.category_id
      ? queryKeys.products.byCategory(filters.category_id)
      : queryKeys.products.active(),
    queryFn: async () => {
      const response = await productsService.getProducts({
        is_active: filters?.is_active ?? true,
        in_stock: filters?.in_stock,
        category_id: filters?.category_id,
        search: filters?.search,
      })
      return response.data || []
    },
    staleTime: staleTimeConfig.semiStatic,
    enabled: true,
    // Garder données précédentes pendant fetch
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook pour récupérer un produit spécifique
 * Cache: 15 minutes
 */
export function useProduct(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.products.detail(id) : [],
    queryFn: async () => {
      if (!id) return null
      const response = await productsService.getProduct(id)
      return response.data || null
    },
    staleTime: staleTimeConfig.semiStatic,
    enabled: !!id,
  })
}

// ==========================================
// PREFETCHING INTELLIGENT
// ==========================================

/**
 * Hook pour précharger les données au survol
 * Utilisé pour améliorer la perception de vitesse
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: async () => {
        const response = await productsService.getProduct(id)
        return response.data || null
      },
      staleTime: staleTimeConfig.semiStatic,
    })
  }
}

/**
 * Hook pour précharger toutes les données POS
 * À appeler au chargement de l'app pour les caissiers
 */
export function usePrefetchPOSData() {
  const queryClient = useQueryClient()

  return () => {
    // Précharger en parallèle
    Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.categories,
        queryFn: async () => {
          const res = await productsService.getCategories()
          return res.data || []
        },
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.currencies,
        queryFn: async () => {
          const res = await paymentsService.getCurrencies()
          return res.data || []
        },
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.paymentMethods,
        queryFn: async () => {
          const res = await paymentsService.getPaymentMethods()
          return res.data || []
        },
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.products.active(),
        queryFn: async () => {
          const res = await productsService.getProducts({ is_active: true, in_stock: true })
          return res.data || []
        },
      }),
    ])
  }
}

// ==========================================
// MUTATIONS OPTIMISTES
// ==========================================

/**
 * Hook pour créer un produit avec mise à jour optimiste
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await productsService.createProduct(data)
      return response.data
    },
    // Mise à jour optimiste du cache
    onMutate: async (newProduct) => {
      // Annuler requêtes en cours
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all })

      // Snapshot de l'ancien état
      const previousProducts = queryClient.getQueryData(queryKeys.products.active())

      // Mise à jour optimiste
      queryClient.setQueryData(queryKeys.products.active(), (old: any) => {
        if (!old) return [newProduct]
        return [...old, { ...newProduct, id: 'temp-' + Date.now() }]
      })

      return { previousProducts }
    },
    // Rollback en cas d'erreur
    onError: (err, newProduct, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(queryKeys.products.active(), context.previousProducts)
      }
    },
    // Refetch après succès
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

// ==========================================
// INVALIDATION INTELLIGENTE
// ==========================================

/**
 * Hook pour invalider sélectivement le cache
 */
export function useInvalidateCache() {
  const queryClient = useQueryClient()

  return {
    invalidateProducts: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),

    invalidateSales: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),

    invalidateDashboard: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats }),

    invalidateAll: () => queryClient.invalidateQueries(),

    clearCache: () => queryClient.clear(),
  }
}

// ==========================================
// OPTIMISATION RÉSEAU
// ==========================================

/**
 * Hook pour désactiver auto-refetch (mode hors ligne)
 */
export function useOfflineMode() {
  const queryClient = useQueryClient()

  return {
    enableOfflineMode: () => {
      queryClient.setDefaultOptions({
        queries: {
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
          retry: false,
        },
      })
    },
    disableOfflineMode: () => {
      queryClient.setDefaultOptions({
        queries: {
          refetchOnWindowFocus: true,
          refetchOnMount: true,
          refetchOnReconnect: true,
          retry: 2,
        },
      })
    },
  }
}
