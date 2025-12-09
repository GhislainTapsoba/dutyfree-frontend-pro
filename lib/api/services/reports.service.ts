import { api } from '../client'

export interface SalesReport {
  total_sales: number
  total_amount: number
  average_ticket: number
  sales_by_category: Array<{
    category: string
    count: number
    amount: number
  }>
  sales_by_payment: Array<{
    method: string
    count: number
    amount: number
  }>
}

export interface StockReport {
  total_products: number
  low_stock_count: number
  out_of_stock_count: number
  total_value: number
}

export const reportsService = {
  /**
   * Rapport des ventes
   */
  async getSalesReport(params: { period?: 'daily' | 'weekly' | 'monthly'; date?: string; start_date?: string; end_date?: string; group_by?: string }) {
    return api.get<any>('/reports/sales', params)
  },

  /**
   * Rapport du stock
   */
  async getStockReport() {
    return api.get<StockReport>('/reports/stock')
  },

  /**
   * Rapport des paiements
   */
  async getPaymentsReport(params?: { start_date?: string; end_date?: string }) {
    return api.get<any>('/reports/payments', params)
  },

  /**
   * Performance des caissiers
   */
  async getCashiersReport(params?: { start_date?: string; end_date?: string }) {
    return api.get<any>('/reports/cashiers', params)
  },

  /**
   * KPIs
   */
  async getKPIs(params?: { start_date?: string; end_date?: string }) {
    return api.get<any>('/reports/kpi', params)
  },

  /**
   * Rapport des produits les plus vendus
   */
  async getProductsReport(params?: { start_date?: string; end_date?: string; limit?: number }) {
    return api.get<any>('/reports/products', params)
  },

  /**
   * Export CSV
   */
  async exportReport(params: { type: string; start_date?: string; end_date?: string }) {
    return api.get<any>('/reports/export', params)
  },
}
