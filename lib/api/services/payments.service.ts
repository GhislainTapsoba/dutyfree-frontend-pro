import { api } from '../client'

export interface PaymentMethod {
  id: string
  name: string
  code: string
  is_active: boolean
}

export interface Currency {
  code: string
  name: string
  symbol: string
  exchange_rate_to_xof: number
  is_active: boolean
}

export interface PaymentRecord {
  id: string
  sale_id: string
  payment_method_id: string
  payment_method_name?: string
  currency: string
  amount: number
  amount_xof: number
  exchange_rate: number
  reference?: string
  created_at: string
}

export const paymentsService = {
  /**
   * Liste des paiements
   */
  async getPayments(params?: { start_date?: string; end_date?: string; method?: string }) {
    return api.get<PaymentRecord[]>('/payments', params)
  },

  /**
   * Créer un paiement
   */
  async createPayment(data: Partial<PaymentRecord>) {
    return api.post<PaymentRecord>('/payments', data)
  },

  /**
   * Méthodes de paiement disponibles
   */
  async getPaymentMethods() {
    return api.get<PaymentMethod[]>('/payments/methods')
  },

  /**
   * Liste des devises
   */
  async getCurrencies() {
    return api.get<Currency[]>('/currencies')
  },

  /**
   * Mettre à jour le taux de change d'une devise
   */
  async updateCurrency(code: string, data: Partial<Currency>) {
    return api.put<Currency>(`/currencies/${code}`, data)
  },

  /**
   * Convertir un montant
   */
  async convertAmount(data: { amount: number; from_currency: string; to_currency: string }) {
    return api.post<{ amount: number; rate: number }>('/currencies/convert', data)
  },
}
