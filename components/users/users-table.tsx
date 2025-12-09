"use client"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { MoreHorizontal, Edit, Trash2, Key, User, Shield, ShieldCheck, ShieldAlert } from "lucide-react"

interface UsersTableProps {
  users: any[]
  roles: any[]
}

export function UsersTable({ users, roles }: UsersTableProps) {
  // S'assurer que users est toujours un tableau
  console.log('[UsersTable] users reçu:', users, 'Type:', typeof users, 'isArray:', Array.isArray(users))
  const usersList = Array.isArray(users) ? users : []
  console.log('[UsersTable] usersList:', usersList)

  const handleDelete = async (userId: string) => {
    if (!confirm('⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement cet utilisateur ?\n\nCette action est irréversible et supprimera :\n- Le compte utilisateur\n- Toutes ses données associées\n- Son historique d\'activité')) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        alert('✅ Utilisateur supprimé définitivement avec succès')
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`❌ Erreur: ${error.message || 'Impossible de supprimer l\'utilisateur'}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('❌ Erreur lors de la suppression de l\'utilisateur')
    }
  }
  const getRoleIcon = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case "admin":
        return <ShieldAlert className="w-4 h-4 text-destructive" />
      case "supervisor":
        return <ShieldCheck className="w-4 h-4 text-warning" />
      case "stock_manager":
        return <Shield className="w-4 h-4 text-chart-2" />
      default:
        return <User className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case "admin":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "supervisor":
        return "bg-warning/10 text-warning border-warning/20"
      case "stock_manager":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      default:
        return "bg-primary/10 text-primary border-primary/20"
    }
  }

  return (
    <Card className="border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>Utilisateur</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Point de vente</TableHead>
            <TableHead className="text-center">Statut</TableHead>
            <TableHead className="text-center">Dernière connexion</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4" />
                Aucun utilisateur trouvé
              </TableCell>
            </TableRow>
          ) : (
            usersList.map((user) => (
              <TableRow key={user.id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user.first_name?.[0]}
                        {user.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">@{user.username || user.email?.split("@")[0]}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getRoleBadgeColor(user.role?.name)}>
                    {getRoleIcon(user.role?.name)}
                    <span className="ml-1">{user.role?.name || "Non défini"}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.point_of_sales?.name || <span className="text-muted-foreground">Tous</span>}
                </TableCell>
                <TableCell className="text-center">
                  {user.is_active ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20">Actif</Badge>
                  ) : (
                    <Badge variant="secondary">Inactif</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {user.last_login_at
                    ? new Date(user.last_login_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Jamais"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/users/${user.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Key className="w-4 h-4 mr-2" />
                        Réinitialiser MDP
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
