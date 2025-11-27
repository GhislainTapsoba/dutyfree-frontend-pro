"use client"

import { type Permission } from "@/lib/permissions"
import { usePermissions } from "@/hooks/use-permissions"

interface CanProps {
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * Composant pour affichage conditionnel basé sur les permissions
 *
 * @example
 * <Can permission="products.create">
 *   <Button>Créer un produit</Button>
 * </Can>
 *
 * @example
 * <Can permissions={["products.edit", "products.delete"]} requireAll={false}>
 *   <Button>Modifier</Button>
 * </Can>
 */
export function Can({ permission, permissions, requireAll = true, fallback = null, children }: CanProps) {
  const { can, canAll, canAny, loading } = usePermissions()

  if (loading) {
    return null
  }

  let hasAccess = false

  if (permission) {
    hasAccess = can(permission)
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions)
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
