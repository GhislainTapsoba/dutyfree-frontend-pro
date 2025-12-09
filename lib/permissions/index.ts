/**
 * Système de gestion des permissions basé sur les rôles
 */

export type Permission =
  // Dashboard
  | "dashboard.view"

  // Point de vente
  | "pos.view"
  | "pos.create_sale"
  | "pos.cancel_sale"
  | "pos.apply_discount"
  | "pos.apply_promotion"

  // Catégories
  | "categories.view"
  | "categories.create"
  | "categories.edit"
  | "categories.delete"

  // Produits
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  | "products.manage_prices"

  // Fiches techniques
  | "technical_sheets.view"
  | "technical_sheets.edit"

  // Stock
  | "stock.view"
  | "stock.manage"
  | "stock.adjust"

  // Inventaires
  | "inventory.view"
  | "inventory.create"
  | "inventory.validate"

  // Fournisseurs
  | "suppliers.view"
  | "suppliers.create"
  | "suppliers.edit"
  | "suppliers.delete"

  // Bons de commande
  | "purchase_orders.view"
  | "purchase_orders.create"
  | "purchase_orders.edit"
  | "purchase_orders.delete"
  | "purchase_orders.validate"

  // Factures fournisseurs
  | "supplier_invoices.view"
  | "supplier_invoices.create"
  | "supplier_invoices.validate"
  | "supplier_invoices.delete"

  // Promotions
  | "promotions.view"
  | "promotions.create"
  | "promotions.edit"
  | "promotions.delete"

  // Fidélité
  | "loyalty.view"
  | "loyalty.manage"

  // Menus & Formules
  | "menus.view"
  | "menus.create"
  | "menus.edit"
  | "menus.delete"

  // Clients hébergés
  | "hotel_guests.view"
  | "hotel_guests.create"
  | "hotel_guests.edit"
  | "hotel_guests.delete"

  // Paiements
  | "payments.view"
  | "payments.manage"
  | "payments.refund"

  // Rapports
  | "reports.view"
  | "reports.export"
  | "reports.financial"

  // Points de vente (configuration)
  | "point_of_sales.view"
  | "point_of_sales.create"
  | "point_of_sales.edit"
  | "point_of_sales.delete"

  // Devises
  | "currencies.view"
  | "currencies.manage"

  // Utilisateurs
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "users.manage_roles"

  // Paramètres
  | "settings.view"
  | "settings.edit"

  // Notifications
  | "notifications.view"
  | "notifications.manage"

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Administrateur - Accès complet
  admin: [
    "dashboard.view",
    "pos.view",
    "pos.create_sale",
    "pos.cancel_sale",
    "pos.apply_discount",
    "pos.apply_promotion",
    "categories.view",
    "categories.create",
    "categories.edit",
    "categories.delete",
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "products.manage_prices",
    "technical_sheets.view",
    "technical_sheets.edit",
    "stock.view",
    "stock.manage",
    "stock.adjust",
    "inventory.view",
    "inventory.create",
    "inventory.validate",
    "suppliers.view",
    "suppliers.create",
    "suppliers.edit",
    "suppliers.delete",
    "purchase_orders.view",
    "purchase_orders.create",
    "purchase_orders.edit",
    "purchase_orders.delete",
    "purchase_orders.validate",
    "supplier_invoices.view",
    "supplier_invoices.create",
    "supplier_invoices.validate",
    "supplier_invoices.delete",
    "promotions.view",
    "promotions.create",
    "promotions.edit",
    "promotions.delete",
    "loyalty.view",
    "loyalty.manage",
    "menus.view",
    "menus.create",
    "menus.edit",
    "menus.delete",
    "hotel_guests.view",
    "hotel_guests.create",
    "hotel_guests.edit",
    "hotel_guests.delete",
    "payments.view",
    "payments.manage",
    "payments.refund",
    "reports.view",
    "reports.export",
    "reports.financial",
    "point_of_sales.view",
    "point_of_sales.create",
    "point_of_sales.edit",
    "point_of_sales.delete",
    "currencies.view",
    "currencies.manage",
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "users.manage_roles",
    "settings.view",
    "settings.edit",
    "notifications.view",
    "notifications.manage",
  ],

  // Superviseur - Gestion opérationnelle complète
  supervisor: [
    "dashboard.view",
    "pos.view",
    "pos.create_sale",
    "pos.cancel_sale",
    "pos.apply_discount",
    "pos.apply_promotion",
    "categories.view",
    "products.view",
    "technical_sheets.view",
    "stock.view",
    "stock.manage",
    "inventory.view",
    "inventory.create",
    "suppliers.view",
    "purchase_orders.view",
    "supplier_invoices.view",
    "promotions.view",
    "loyalty.view",
    "menus.view",
    "hotel_guests.view",
    "payments.view",
    "reports.view",
    "reports.export",
    "notifications.view",
  ],

  // Gestionnaire de stock
  stock_manager: [
    "dashboard.view",
    "products.view",
    "categories.view",
    "technical_sheets.view",
    "stock.view",
    "stock.manage",
    "stock.adjust",
    "inventory.view",
    "inventory.create",
    "suppliers.view",
    "purchase_orders.view",
    "supplier_invoices.view",
    "reports.view",
    "notifications.view",
  ],

  // Gestionnaire - Gestion opérationnelle
  manager: [
    "dashboard.view",
    "pos.view",
    "pos.create_sale",
    "pos.cancel_sale",
    "pos.apply_discount",
    "pos.apply_promotion",
    "categories.view",
    "categories.create",
    "categories.edit",
    "products.view",
    "products.create",
    "products.edit",
    "products.manage_prices",
    "technical_sheets.view",
    "technical_sheets.edit",
    "stock.view",
    "stock.manage",
    "stock.adjust",
    "inventory.view",
    "inventory.create",
    "inventory.validate",
    "suppliers.view",
    "suppliers.create",
    "suppliers.edit",
    "purchase_orders.view",
    "purchase_orders.create",
    "purchase_orders.edit",
    "purchase_orders.validate",
    "supplier_invoices.view",
    "supplier_invoices.create",
    "supplier_invoices.validate",
    "promotions.view",
    "promotions.create",
    "promotions.edit",
    "loyalty.view",
    "loyalty.manage",
    "menus.view",
    "menus.create",
    "menus.edit",
    "hotel_guests.view",
    "hotel_guests.create",
    "hotel_guests.edit",
    "payments.view",
    "payments.manage",
    "reports.view",
    "reports.export",
    "reports.financial",
    "point_of_sales.view",
    "currencies.view",
    "users.view",
    "settings.view",
    "notifications.view",
  ],

  // Caissier - Point de vente et consultation
  cashier: [
    "dashboard.view",
    "pos.view",
    "pos.create_sale",
    "pos.apply_promotion",
    "products.view",
    "stock.view",
    "loyalty.view",
    "hotel_guests.view",
    "payments.view",
    "notifications.view",
  ],

  // Magasinier - Gestion du stock
  warehouseman: [
    "dashboard.view",
    "products.view",
    "technical_sheets.view",
    "stock.view",
    "stock.manage",
    "stock.adjust",
    "inventory.view",
    "inventory.create",
    "suppliers.view",
    "purchase_orders.view",
    "purchase_orders.create",
    "supplier_invoices.view",
    "reports.view",
    "notifications.view",
  ],

  // Comptable - Finances et rapports
  accountant: [
    "dashboard.view",
    "products.view",
    "purchase_orders.view",
    "supplier_invoices.view",
    "supplier_invoices.create",
    "supplier_invoices.validate",
    "payments.view",
    "payments.manage",
    "reports.view",
    "reports.export",
    "reports.financial",
    "currencies.view",
    "notifications.view",
  ],

  // Guest - Permissions par défaut (affichage minimum)
  guest: [
    "dashboard.view",
    "notifications.view",
  ],
}

/**
 * Vérifier si un rôle a une permission
 */
export function hasPermission(roleCode: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[roleCode] || []
  return permissions.includes(permission)
}

/**
 * Vérifier si un rôle a toutes les permissions spécifiées
 */
export function hasAllPermissions(roleCode: string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(roleCode, permission))
}

/**
 * Vérifier si un rôle a au moins une des permissions spécifiées
 */
export function hasAnyPermission(roleCode: string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(roleCode, permission))
}

/**
 * Obtenir toutes les permissions d'un rôle
 */
export function getRolePermissions(roleCode: string): Permission[] {
  return ROLE_PERMISSIONS[roleCode] || []
}

/**
 * Configuration des pages et leurs permissions requises
 */
export const PAGE_PERMISSIONS: Record<string, Permission[]> = {
  "/dashboard": ["dashboard.view"],
  "/dashboard/pos": ["pos.view"],
  "/dashboard/categories": ["categories.view"],
  "/dashboard/products": ["products.view"],
  "/dashboard/products/new": ["products.create"],
  "/dashboard/technical-sheets": ["technical_sheets.view"],
  "/dashboard/stock": ["stock.view"],
  "/dashboard/inventory": ["inventory.view"],
  "/dashboard/suppliers": ["suppliers.view"],
  "/dashboard/suppliers/new": ["suppliers.create"],
  "/dashboard/purchase-orders": ["purchase_orders.view"],
  "/dashboard/purchase-orders/new": ["purchase_orders.create"],
  "/dashboard/supplier-invoices": ["supplier_invoices.view"],
  "/dashboard/promotions": ["promotions.view"],
  "/dashboard/loyalty": ["loyalty.view"],
  "/dashboard/menus": ["menus.view"],
  "/dashboard/hotel-guests": ["hotel_guests.view"],
  "/dashboard/payments": ["payments.view"],
  "/dashboard/reports": ["reports.view"],
  "/dashboard/point-of-sales": ["point_of_sales.view"],
  "/dashboard/currencies": ["currencies.view"],
  "/dashboard/users": ["users.view"],
  "/dashboard/settings": ["settings.view"],
  "/dashboard/notifications": ["notifications.view"],
}

/**
 * Vérifier si un utilisateur peut accéder à une page
 */
export function canAccessPage(roleCode: string, pathname: string): boolean {
  // Chercher la permission exacte ou la plus proche
  let requiredPermissions: Permission[] | undefined

  // Vérifier la route exacte
  if (PAGE_PERMISSIONS[pathname]) {
    requiredPermissions = PAGE_PERMISSIONS[pathname]
  } else {
    // Vérifier les routes parentes (ex: /dashboard/products/123 -> /dashboard/products)
    const pathSegments = pathname.split("/").filter(Boolean)
    for (let i = pathSegments.length; i > 0; i--) {
      const testPath = "/" + pathSegments.slice(0, i).join("/")
      if (PAGE_PERMISSIONS[testPath]) {
        requiredPermissions = PAGE_PERMISSIONS[testPath]
        break
      }
    }
  }

  // Si aucune permission n'est requise, permettre l'accès
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true
  }

  // Vérifier si l'utilisateur a au moins une des permissions requises
  return hasAnyPermission(roleCode, requiredPermissions)
}
