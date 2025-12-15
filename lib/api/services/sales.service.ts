import { api } from '../client'

export interface SaleLine {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price_ht: number
  unit_price_ttc: number
  discount_rate?: number
  discount_amount?: number
  tax_rate: number
  tax_amount: number
  total_ht: number
  total_ttc: number
  lot_id?: string
  product?: {
    id: string
    code: string
    name_fr: string
    name_en: string
    barcode?: string
  }
}

export interface SalePayment {
  id: string
  sale_id: string
  payment_method_id: string
  amount: number
  currency_code: string
  exchange_rate: number
  amount_in_base_currency: number
  status: string
  card_last_digits?: string
  authorization_code?: string
  transaction_reference?: string
  created_at: string
  payment_method?: {
    code: string
    name: string
    type: string
  }
}

export interface Sale {
  id: string
  ticket_number: string
  cash_session_id: string
  cash_register_id?: string
  point_of_sale_id?: string
  seller_id: string
  passenger_id?: string
  total_ht: number
  total_discount: number
  total_tax: number
  total_ttc: number
  status: 'draft' | 'completed' | 'cancelled' | 'refunded'
  created_at: string
  updated_at?: string
  seller?: {
    id: string
    first_name: string
    last_name: string
    employee_id?: string
  }
  cash_register?: {
    id: string
    code: string
    name: string
  }
  point_of_sale?: {
    id: string
    code: string
    name: string
  }
  lines: SaleLine[]
  payments: SalePayment[]
}

// Legacy interfaces for backward compatibility
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
