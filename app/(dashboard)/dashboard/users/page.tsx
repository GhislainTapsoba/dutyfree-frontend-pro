"use client"

import { useEffect, useState } from "react"
import { usersService, User, Role } from "@/lib/api"
import { UsersTable } from "@/components/users/users-table"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [usersRes, rolesRes] = await Promise.all([
          usersService.getUsers(),
          usersService.getRoles(),
        ])

        console.log('usersRes:', usersRes)
        console.log('rolesRes:', rolesRes)
        
        if (usersRes.data?.data) setUsers(usersRes.data.data)
        else if (Array.isArray(usersRes.data)) setUsers(usersRes.data)
        
        if (rolesRes.data?.data) setRoles(rolesRes.data.data)
        else if (Array.isArray(rolesRes.data)) setRoles(rolesRes.data)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les comptes et les accès du personnel</p>
        </div>
        <Link href="/dashboard/users/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </Link>
      </div>

      <UsersTable users={users} roles={roles} />
    </div>
  )
}
