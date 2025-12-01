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
        
        if (userFromToken) {
          setUser(userFromToken)
          setRoleCode(userFromToken.role_name || "guest")
          console.log('🔍 Sidebar Debug - Role:', userFromToken.role_name, 'Loading:', false)
        } else {
          setRoleCode("guest")
          console.log('🔍 Sidebar Debug - Role: guest Loading:', false)
        }
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
