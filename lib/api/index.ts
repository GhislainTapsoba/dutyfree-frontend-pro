/**
 * Point d'entrée central pour tous les services API
 */

// ✅ Exports relatifs corrects
export * from './client'
export * from './services/auth.service'
export * from './services/products.service'
export * from './services/sales.service'
export * from './services/stock.service'
export * from './services/users.service'
export * from './services/reports.service'
export * from './services/suppliers.service'
export * from './services/payments.service'
export * from './services/notifications.service'

// ✅ Imports relatifs corrects APRÈS exports
import { authService } from './services/auth.service'
import { productsService } from './services/products.service'
import { salesService } from './services/sales.service'
import { stockService } from './services/stock.service'
import { usersService } from './services/users.service'
import { reportsService } from './services/reports.service'
import { suppliersService } from './services/suppliers.service'
import { paymentsService } from './services/payments.service'
import { notificationsService } from './services/notifications.service'

export const services = {
  auth: authService,
  products: productsService,
  sales: salesService,
  stock: stockService,
  users: usersService,
  reports: reportsService,
  suppliers: suppliersService,
  payments: paymentsService,
  notifications: notificationsService,
} as const
