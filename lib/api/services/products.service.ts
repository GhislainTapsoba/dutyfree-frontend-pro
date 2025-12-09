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
  supplier_id?: string
  purchase_price?: number
  selling_price_xof: number
  selling_price_eur?: number
  selling_price_usd?: number
  tax_rate: number
  is_tax_included?: boolean
  min_stock_level: number
  max_stock_level?: number
  current_stock?: number
  is_active: boolean
  is_promotional?: boolean
  image_url?: string
  category?: {
    id: string
    code: string
    name_fr: string
    name_en: string
  }
  supplier?: {
    id: string
    code: string
    name: string
  }
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  code: string
  name_fr: string
  name_en: string
  parent_id?: string
  sort_order: number
  is_active: boolean
  created_at: string
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

  /**
   * Upload image produit
   */
  async uploadImage(id: string, file: File) {
    return api.post(`/products/${id}/image`, { file })
  },

  /**
   * Ajuster le stock
   */
  async adjustStock(id: string, quantity: number, reason?: string) {
    return api.post(`/products/${id}/stock`, { quantity, reason })
  },
}
