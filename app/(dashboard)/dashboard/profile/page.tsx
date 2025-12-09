"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, User, Mail, Phone, Building, Shield } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/me`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setUser(data.data)
        } else {
          setUser({ error: data.error || 'Erreur de chargement' })
        }
      })
      .catch(err => {
        console.error('Error loading user:', err)
        setUser({ error: 'Erreur de chargement' })
      })
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user.error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-destructive">{user.error}</p>
        <p className="text-sm text-muted-foreground">Veuillez vous reconnecter</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Photo de profil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-lg">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-muted-foreground">{user.role?.name}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="first_name" value={user.first_name} disabled className="pl-10 bg-secondary" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="last_name" value={user.last_name} disabled className="pl-10 bg-secondary" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" value={user.email} disabled className="pl-10 bg-secondary" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" value={user.phone || "Non renseigné"} disabled className="pl-10 bg-secondary" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="role" value={user.role?.name || "Non défini"} disabled className="pl-10 bg-secondary" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pos">Point de vente</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="pos" value={user.point_of_sale?.name || "Tous"} disabled className="pl-10 bg-secondary" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Pour modifier vos informations, contactez un administrateur.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
