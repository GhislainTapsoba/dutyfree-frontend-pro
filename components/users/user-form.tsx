"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api/client"
import { toast } from "sonner"

interface UserFormProps {
  user?: any
  roles: any[]
  pointOfSales: any[]
}

export function UserForm({ user, roles, pointOfSales }: UserFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || "",
    password: "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    username: user?.username || "",
    role_id: user?.role_id || "",
    point_of_sale_id: user?.point_of_sale_id || "",
    is_active: user?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let response

      if (user) {
        // Mode édition
        response = await api.put(`/users/${user.id}`, formData)
      } else {
        // Mode création
        response = await api.post("/auth/register", formData)
      }

      if (response.data) {
        toast.success(user ? "Utilisateur modifié avec succès" : "Utilisateur créé avec succès")
        router.push("/dashboard/users")
        router.refresh()
      } else if (response.error) {
        toast.error(response.error)
      }
    } catch (error) {
      console.error("Error saving user:", error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Jean"
                className="bg-secondary border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Dupont"
                className="bg-secondary border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="jdupont"
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jean.dupont@dutyfree.bf"
              className="bg-secondary border-border"
              required
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="bg-secondary border-border"
                required={!user}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Rôle et accès</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rôle *</Label>
            <Select value={formData.role_id} onValueChange={(value) => setFormData({ ...formData, role_id: value })}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Sélectionner un rôle..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name} - {role.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pos">Point de vente assigné</Label>
            <Select
              value={formData.point_of_sale_id}
              onValueChange={(value) => setFormData({ ...formData, point_of_sale_id: value })}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Tous les points de vente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les points de vente</SelectItem>
                {pointOfSales.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div>
              <Label htmlFor="is_active">Compte actif</Label>
              <p className="text-sm text-muted-foreground">L'utilisateur peut se connecter</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : user ? (
            "Mettre à jour"
          ) : (
            "Créer l'utilisateur"
          )}
        </Button>
      </div>
    </form>
  )
}
