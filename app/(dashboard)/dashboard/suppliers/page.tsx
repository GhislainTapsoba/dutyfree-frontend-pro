"use client"

import { useEffect, useState } from "react"
import { suppliersService, Supplier } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, Phone, Mail, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const response = await suppliersService.getSuppliers()
        if (response.data) setSuppliers(response.data)
      } catch (error) {
        console.error("Erreur lors du chargement des fournisseurs:", error)
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
          <h1 className="text-2xl font-bold">Fournisseurs</h1>
          <p className="text-muted-foreground">Gérez vos fournisseurs et leurs informations</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau fournisseur
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers?.map((supplier) => (
          <Card key={supplier.id} className="border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <Badge variant={supplier.is_active ? "default" : "secondary"}>
                {supplier.is_active ? "Actif" : "Inactif"}
              </Badge>
            </div>

            <h3 className="font-semibold text-lg mb-1">{supplier.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">Fournisseur</p>

            <div className="space-y-2 text-sm">
              {supplier.contact_person && <p className="text-muted-foreground">{supplier.contact_person}</p>}
              {supplier.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{supplier.email}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{supplier.phone}</span>
                </div>
              )}
              {supplier.country && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{supplier.country}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Link href={`/dashboard/suppliers/${supplier.id}`}>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Voir détails
                </Button>
              </Link>
            </div>
          </Card>
        ))}

        {(!suppliers || suppliers.length === 0) && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4" />
            <p>Aucun fournisseur enregistré</p>
          </div>
        )}
      </div>
    </div>
  )
}
