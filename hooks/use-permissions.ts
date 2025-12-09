"use client"

import { useEffect, useState } from "react"
import { authService } from "@/lib/api/services/auth.service"
import { type Permission, hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/permissions"

interface User {
  id: string
  email: string
  full_name: string
  role_id: string
  role_name?: string
  is_active: boolean
  created_at: string
}

export function usePermissions() {
  const [user, setUser] = useState<User | null>(null)
  const [roleCode, setRoleCode] = useState<string>("guest")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = () => {
      try {
        const userFromToken = authService.getUserFromToken()
        console.log('[usePermissions] User from token:', userFromToken)
        
        if (userFromToken) {
          setUser(userFromToken)
          const role = userFromToken.role_name || "guest"
          setRoleCode(role)
          console.log('[usePermissions] Role set to:', role)
        } else {
          setRoleCode("guest")
          console.log('[usePermissions] No user, role set to: guest')
        }
      } catch (error) {
        console.error("[usePermissions] Error:", error)
        setRoleCode("guest")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return {
    user,
    roleCode,
    loading,
    can: (permission: Permission) => hasPermission(roleCode, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(roleCode, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(roleCode, permissions),
    isAdmin: roleCode === "admin",
    isManager: roleCode === "manager",
    isCashier: roleCode === "cashier",
    isWarehouseman: roleCode === "warehouseman",
    isAccountant: roleCode === "accountant",
  }
}
