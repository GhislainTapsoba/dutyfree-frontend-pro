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
  Wallet,
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
      { name: "Session de Caisse", href: "/dashboard/cash-session", icon: CreditCard, permission: "pos.view" },
      { name: "Notifications", href: "/dashboard/notifications", icon: Bell, permission: "notifications.view" },
    ],
  },
  {
    title: "Gestion",
    items: [
      { name: "Catégories", href: "/dashboard/categories", icon: Tag, permission: "categories.view" },
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



  // Sauvegarder l'état de la sidebar dans localStorage à chaque changement
  const toggleCollapsed = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  // Gradients pour les sections
  const sectionGradients: Record<string, string> = {
    Principal: "from-blue-500 to-cyan-500",
    Gestion: "from-purple-500 to-pink-500",
    Marketing: "from-amber-500 to-orange-500",
    Finance: "from-emerald-500 to-teal-500",
    Configuration: "from-violet-500 to-indigo-500",
  }

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border/50 bg-gradient-to-b from-sidebar via-sidebar/98 to-sidebar/95 transition-all duration-300 shadow-lg",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-background">
          <Plane className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Duty Free
            </h1>
            <p className="text-xs text-muted-foreground truncate font-medium">Ouagadougou</p>
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

          // Ne pas afficher la section si aucun item n'est visible
          if (visibleItems.length === 0) return null

          const gradient = sectionGradients[section.title] || "from-gray-500 to-gray-600"

          return (
            <div key={section.title}>
              {!collapsed && (
                <div className="px-3 mb-2 flex items-center gap-2">
                  <div className={`h-1 w-1 rounded-full bg-gradient-to-r ${gradient}`} />
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h2>
                </div>
              )}
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r " + gradient + " text-white font-semibold shadow-md"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 font-medium",
                        )}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        )}
                        <div className={cn(
                          "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                          isActive && "drop-shadow-sm"
                        )}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        {!collapsed && <span className="relative z-10">{item.name}</span>}
                        {!collapsed && isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
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
      <div className="p-3 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center hover:bg-primary/10 transition-all rounded-xl h-10"
          onClick={toggleCollapsed}
        >
          {collapsed ? (
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="font-medium">Réduire</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
