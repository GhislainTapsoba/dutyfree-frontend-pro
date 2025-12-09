"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowLeft } from "lucide-react"

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [roles, setRoles] = useState<any[]>([])
  const [pointOfSales, setPointOfSales] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${params.id}`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/roles`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/point-of-sales`).then(r => r.json())
    ]).then(([userData, rolesData, posData]) => {
      setUser(userData.data)
      setRoles(rolesData.data || [])
      setPointOfSales(posData.data || [])
      setLoading(false)
    })
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      })
      if (response.ok) {
        router.push('/dashboard/users')
      }
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Modifier l'utilisateur</h1>
          <p className="text-muted-foreground">{user.first_name} {user.last_name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  value={user.first_name}
                  onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  value={user.last_name}
                  onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={user.phone || ''}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select value={user.role_id} onValueChange={(value) => setUser({ ...user, role_id: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pos">Point de vente</Label>
              <Select value={user.point_of_sale_id || 'null'} onValueChange={(value) => setUser({ ...user, point_of_sale_id: value === 'null' ? null : value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Tous</SelectItem>
                  {pointOfSales.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={user.is_active}
                onCheckedChange={(checked) => setUser({ ...user, is_active: checked })}
              />
              <Label htmlFor="is_active">Compte actif</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</> : 'Enregistrer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
