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
    const fetchUser = async () => {
      try {
        const res = await authService.getCurrentUser()

        if (res.error || !res.data) {
          console.warn("AUTH ERROR:", res.error)
          setRoleCode("guest")
          return
        }

        const data = res.data
        setUser(data)
        setRoleCode(data.role_name || "guest")

      } catch (error) {
        console.error("Error fetching user:", error)
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
