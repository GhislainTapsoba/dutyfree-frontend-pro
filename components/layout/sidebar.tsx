"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Plane,
  Boxes,
  CreditCard,
  Truck,
  FileText,
  ChevronLeft,
  ChevronRight,
  Tag,
  Gift,
  UtensilsCrossed,
  ClipboardList,
  Store,
  DollarSign,
  Hotel,
  Receipt,
  FileCheck,
  Bell,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/use-permissions"
import { type Permission } from "@/lib/permissions"

interface SidebarProps {
  user: any
}

interface MenuItem {
  name: string
  href: string
  icon: any
  permission?: Permission
}

const menuItems: { title: string; items: MenuItem[] }[] = [
  {
    title: "Principal",
    items: [
      { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
      { name: "Point de Vente", href: "/dashboard/pos", icon: ShoppingCart, permission: "pos.view" },
      { name: "Notifications", href: "/dashboard/notifications", icon: Bell, permission: "notifications.view" },
    ],
  },
  {
    title: "Gestion",
    items: [
      { name: "Produits", href: "/dashboard/products", icon: Package, permission: "products.view" },
      { name: "Fiches techniques", href: "/dashboard/technical-sheets", icon: FileCheck, permission: "technical_sheets.view" },
      { name: "Stock", href: "/dashboard/stock", icon: Boxes, permission: "stock.view" },
      { name: "Inventaires", href: "/dashboard/inventory", icon: ClipboardList, permission: "inventory.view" },
      { name: "Fournisseurs", href: "/dashboard/suppliers", icon: Truck, permission: "suppliers.view" },
      { name: "Bons de commande", href: "/dashboard/purchase-orders", icon: FileText, permission: "purchase_orders.view" },
      { name: "Factures fournisseurs", href: "/dashboard/supplier-invoices", icon: Receipt, permission: "supplier_invoices.view" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { name: "Promotions", href: "/dashboard/promotions", icon: Tag, permission: "promotions.view" },
      { name: "Fidélité", href: "/dashboard/loyalty", icon: Gift, permission: "loyalty.view" },
      { name: "Menus & Formules", href: "/dashboard/menus", icon: UtensilsCrossed, permission: "menus.view" },
      { name: "Clients hébergés", href: "/dashboard/hotel-guests", icon: Hotel, permission: "hotel_guests.view" },
    ],
  },
  {
    title: "Finance",
    items: [
      { name: "Paiements", href: "/dashboard/payments", icon: CreditCard, permission: "payments.view" },
      { name: "Rapports", href: "/dashboard/reports", icon: BarChart3, permission: "reports.view" },
    ],
  },
  {
    title: "Configuration",
    items: [
      { name: "Points de vente", href: "/dashboard/point-of-sales", icon: Store, permission: "point_of_sales.view" },
      { name: "Devises", href: "/dashboard/currencies", icon: DollarSign, permission: "currencies.view" },
      { name: "Utilisateurs", href: "/dashboard/users", icon: Users, permission: "users.view" },
      { name: "Paramètres", href: "/dashboard/settings", icon: Settings, permission: "settings.view" },
    ],
  },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { can, roleCode, loading } = usePermissions()

  // Charger l'état de la sidebar depuis localStorage au montage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState !== null) {
      setCollapsed(savedState === 'true')
    }
  }, [])

  // Debug: afficher le rôle et les permissions
  useEffect(() => {
    console.log('🔍 Sidebar Debug - Role:', roleCode, 'Loading:', loading)
  }, [roleCode, loading])

  // Sauvegarder l'état de la sidebar dans localStorage à chaque changement
  const toggleCollapsed = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Plane className="w-6 h-6 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg leading-tight">Duty Free</h1>
            <p className="text-xs text-muted-foreground truncate">Ouagadougou</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {menuItems.map((section) => {
          // Filtrer les items visibles selon les permissions
          // Si encore en chargement, afficher tous les items
          const visibleItems = loading
            ? section.items
            : section.items.filter((item) =>
                !item.permission || can(item.permission)
              )

          // Debug: afficher le nombre d'items visibles
          console.log(`📋 Section "${section.title}":`, visibleItems.length, 'items visibles')

          // Ne pas afficher la section si aucun item n'est visible
          if (visibleItems.length === 0) return null

          return (
            <div key={section.title}>
              {!collapsed && (
                <h2 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h2>
              )}
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent",
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-center" onClick={toggleCollapsed}>
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Réduire</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
