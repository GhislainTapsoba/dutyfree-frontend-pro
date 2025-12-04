"use client"

import { useEffect, useState } from "react"
import { usersService, User, Role } from "@/lib/api"
import { UsersTable } from "@/components/users/users-table"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Users, UserCheck, Shield, UserCog } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"

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

  const activeUsers = users.filter(u => u.is_active).length
  const adminUsers = users.filter(u => u.role?.name === 'Admin' || u.role?.name === 'admin').length

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

      {/* Stats Cards avec Design Moderne */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                Total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total utilisateurs</p>
              <p className="text-3xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">comptes créés</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <UserCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                Actifs
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Utilisateurs actifs</p>
              <p className="text-3xl font-bold">{activeUsers}</p>
              <p className="text-xs text-muted-foreground">comptes activés</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Shield className="w-6 h-6 text-violet-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                Admins
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Administrateurs</p>
              <p className="text-3xl font-bold">{adminUsers}</p>
              <p className="text-xs text-muted-foreground">accès complet</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <UserCog className="w-6 h-6 text-amber-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                Rôles
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Rôles définis</p>
              <p className="text-3xl font-bold">{roles.length}</p>
              <p className="text-xs text-muted-foreground">niveaux d'accès</p>
            </div>
          </div>
        </Card>
      </div>

      <UsersTable users={users} roles={roles} />
    </div>
  )
}
