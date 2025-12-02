"use client"

import { useEffect, useState } from "react"
import { suppliersService, Supplier } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, Phone, Mail, MapPin, Loader2, MoreHorizontal, Edit, Trash2, Ban } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Link from "next/link"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)

  const handleDeactivate = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver ce fournisseur ?")) return
    
    try {
      const response = await fetch(`http://localhost:3001/api/suppliers/${id}`, {
        method: "DELETE",
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success("Fournisseur désactivé")
        const res = await suppliersService.getSuppliers()
        if (res.data) setSuppliers(res.data)
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors de la désactivation")
    }
  }

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("⚠️ ATTENTION : Supprimer définitivement ce fournisseur ? Cette action est irréversible !")) return
    
    try {
      const response = await fetch(`http://localhost:3001/api/suppliers/${id}/permanent`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        toast.success("Fournisseur supprimé définitivement")
        const res = await suppliersService.getSuppliers()
        if (res.data) setSuppliers(res.data)
      } else {
        const data = await response.json()
        toast.error(data.error || "Erreur")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors de la suppression")
    }
  }

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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowInactive(!showInactive)}>
            {showInactive ? "Masquer inactifs" : "Afficher inactifs"}
          </Button>
          <Link href="/dashboard/suppliers/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau fournisseur
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers?.filter(s => showInactive || s.is_active).map((supplier) => (
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

            <div className="mt-4 pt-4 border-t border-border flex gap-2">
              <Link href={`/dashboard/suppliers/${supplier.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Voir détails
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/suppliers/${supplier.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Link>
                  </DropdownMenuItem>
                  {supplier.is_active && (
                    <DropdownMenuItem 
                      className="text-warning"
                      onClick={() => handleDeactivate(supplier.id)}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Désactiver
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => handlePermanentDelete(supplier.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer définitivement
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}

        {suppliers?.filter(s => showInactive || s.is_active).length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4" />
            <p>{showInactive ? "Aucun fournisseur enregistré" : "Aucun fournisseur actif"}</p>
          </div>
        )}
      </div>
    </div>
  )
}
