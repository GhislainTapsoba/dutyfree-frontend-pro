import { api } from '../client'

export interface StockItem {
  product_id: string
  product_code: string
  product_name: string
  category_name: string
  quantity: number
  min_stock_level: number
  needs_reorder: boolean
}

export interface StockMovement {
  id: string
  product_id: string
  product_name?: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reference?: string
  notes?: string
  created_by: string
  created_at: string
}

export interface Lot {
  id: string
  reference: string
  product_id: string
  product_name?: string
  quantity_initial: number
  quantity_remaining: number
  customs_declaration?: string
  entry_date: string
  expiry_date?: string
  status: 'active' | 'depleted' | 'expired'
}

export const stockService = {
  /**
   * État du stock
   */
  async getStock(params?: { needs_reorder?: boolean; category?: string }) {
    return api.get<StockItem[]>('/stock', params)
  },

  /**
   * Mouvements de stock
   */
  async getMovements(params?: { product_id?: string; start_date?: string; end_date?: string }) {
    return api.get<StockMovement[]>('/stock/movements', params)
  },

  /**
   * Créer un mouvement de stock
   */
  async createMovement(data: Partial<StockMovement>) {
    return api.post<StockMovement>('/stock/movements', data)
  },

  /**
   * Liste des lots
   */
  async getLots(params?: { product_id?: string; status?: string }) {
    return api.get<Lot[]>('/stock/lots', params)
  },

  /**
   * Créer un lot
   */
  async createLot(data: Partial<Lot>) {
    return api.post<Lot>('/stock/lots', data)
  },
}
