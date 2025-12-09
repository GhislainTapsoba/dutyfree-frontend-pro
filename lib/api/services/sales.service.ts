import { api } from '../client'

export interface SaleItem {
  product_id: string
  quantity: number
  unit_price: number
  discount_amount?: number
  tax_amount?: number
}

export interface Payment {
  method: 'cash' | 'card' | 'mobile_money' | 'other'
  currency: string
  amount: number
  amount_xof: number
}

export interface Sale {
  id: string
  ticket_number: string
  cash_session_id: string
  cashier_id: string
  cashier_name?: string
  passenger_id?: string
  passenger_name?: string
  total_amount: number
  discount_amount: number
  tax_amount: number
  final_amount: number
  currency: string
  status: 'completed' | 'cancelled' | 'refunded'
  items: SaleItem[]
  payments: Payment[]
  created_at: string
}

export interface CreateSaleData {
  cash_session_id: string
  cashier_id: string
  passenger_id?: string
  items: SaleItem[]
  payments: Payment[]
}

export const salesService = {
  /**
   * Liste des ventes
   */
  async getSales(params?: { start_date?: string; end_date?: string; cashier_id?: string }) {
    return api.get<Sale[]>('/sales', params)
  },

  /**
   * Détail d'une vente
   */
  async getSale(id: string) {
    return api.get<Sale>(`/sales/${id}`)
  },

  /**
   * Créer une vente
   */
  async createSale(data: CreateSaleData) {
    return api.post<Sale>('/sales', data)
  },

  /**
   * Obtenir le reçu d'une vente
   */
  async getReceipt(id: string) {
    return api.get<any>(`/sales/${id}/receipt`)
  },

  /**
   * Rechercher une vente par numéro de ticket
   */
  async getSaleByTicket(ticketNumber: string) {
    return api.get<Sale>(`/sales/by-ticket/${ticketNumber}`)
  },
}
