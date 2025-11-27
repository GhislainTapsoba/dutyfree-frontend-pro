import { api } from '../client'

export interface Supplier {
  id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  country?: string
  payment_terms?: string
  is_active: boolean
  created_at: string
}

export interface PurchaseOrder {
  id: string
  supplier_id: string
  supplier_name?: string
  order_number: string
  order_date: string
  expected_delivery_date?: string
  status: 'draft' | 'sent' | 'received' | 'cancelled'
  total_amount: number
  currency: string
  items: PurchaseOrderItem[]
  created_at: string
}

export interface PurchaseOrderItem {
  product_id: string
  product_name?: string
  quantity: number
  unit_price: number
  total_price: number
}

export const suppliersService = {
  /**
   * Liste des fournisseurs
   */
  async getSuppliers(params?: { is_active?: boolean }) {
    return api.get<Supplier[]>('/suppliers', params)
  },

  /**
   * Détail d'un fournisseur
   */
  async getSupplier(id: string) {
    return api.get<Supplier>(`/suppliers/${id}`)
  },

  /**
   * Créer un fournisseur
   */
  async createSupplier(data: Partial<Supplier>) {
    return api.post<Supplier>('/suppliers', data)
  },

  /**
   * Modifier un fournisseur
   */
  async updateSupplier(id: string, data: Partial<Supplier>) {
    return api.put<Supplier>(`/suppliers/${id}`, data)
  },

  /**
   * Liste des commandes fournisseurs
   */
  async getPurchaseOrders(params?: { supplier_id?: string; status?: string }) {
    return api.get<PurchaseOrder[]>('/purchase-orders', params)
  },

  /**
   * Détail d'une commande
   */
  async getPurchaseOrder(id: string) {
    return api.get<PurchaseOrder>(`/purchase-orders/${id}`)
  },

  /**
   * Créer une commande fournisseur
   */
  async createPurchaseOrder(data: Partial<PurchaseOrder>) {
    return api.post<PurchaseOrder>('/purchase-orders', data)
  },

  /**
   * Modifier une commande
   */
  async updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>) {
    return api.put<PurchaseOrder>(`/purchase-orders/${id}`, data)
  },

  /**
   * Réceptionner une commande
   */
  async receivePurchaseOrder(id: string, data: { received_items: any[] }) {
    return api.post<PurchaseOrder>(`/purchase-orders/${id}/receive`, data)
  },
}
