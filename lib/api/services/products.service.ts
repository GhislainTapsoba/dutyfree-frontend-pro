import { api } from '../client'

export interface Product {
  id: string
  code: string
  barcode?: string
  name_fr: string
  name_en: string
  description_fr?: string
  description_en?: string
  category_id: string
  category_name?: string
  price_xof: number
  price_eur: number
  price_usd: number
  tax_rate: number
  stock_quantity: number
  min_stock_level: number
  is_active: boolean
  image_url?: string
  created_at: string
}

export interface Category {
  id: string
  name_fr: string
  name_en: string
  description?: string
  is_active: boolean
}

export interface ProductFilters {
  category?: string
  in_stock?: boolean
  search?: string
  is_active?: boolean
}

export const productsService = {
  /**
   * Liste des produits avec filtres
   */
  async getProducts(filters?: ProductFilters) {
    return api.get<Product[]>('/products', filters)
  },

  /**
   * Détail d'un produit
   */
  async getProduct(id: string) {
    return api.get<Product>(`/products/${id}`)
  },

  /**
   * Créer un produit
   */
  async createProduct(data: Partial<Product>) {
    return api.post<Product>('/products', data)
  },

  /**
   * Modifier un produit
   */
  async updateProduct(id: string, data: Partial<Product>) {
    return api.put<Product>(`/products/${id}`, data)
  },

  /**
   * Supprimer un produit
   */
  async deleteProduct(id: string) {
    return api.delete(`/products/${id}`)
  },

  /**
   * Liste des catégories
   */
  async getCategories() {
    return api.get<Category[]>('/products/categories')
  },

  /**
   * Créer une catégorie
   */
  async createCategory(data: Partial<Category>) {
    return api.post<Category>('/products/categories', data)
  },
}
