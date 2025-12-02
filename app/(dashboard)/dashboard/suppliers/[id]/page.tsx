"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Building2, FileText, Edit } from "lucide-react"
import { toast } from "sonner"

export default function SupplierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [supplier, setSupplier] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSupplier()
  }, [params.id])

  async function loadSupplier() {
    try {
      const response = await fetch(`http://localhost:3001/api/suppliers/${params.id}`)
      const data = await response.json()
      if (data.data) {
        setSupplier(data.data)
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Fournisseur non trouvé</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
            <p className="text-muted-foreground font-mono">{supplier.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={supplier.is_active ? "default" : "secondary"}>
            {supplier.is_active ? "Actif" : "Inactif"}
          </Badge>
          <Button onClick={() => router.push(`/dashboard/suppliers/${params.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nom du fournisseur</p>
              <p className="font-medium">{supplier.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Code</p>
              <p className="font-mono">{supplier.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Personne de contact</p>
              <p className="font-medium">{supplier.contact_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conditions de paiement</p>
              <p>{supplier.payment_terms || 30} jours</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{supplier.email || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p>{supplier.phone || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p>{supplier.address || "-"}</p>
                <p className="text-sm">{supplier.country || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informations fiscales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Numéro fiscal</p>
              <p className="font-mono">{supplier.tax_id || "-"}</p>
            </div>
          </CardContent>
        </Card>

        {supplier.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{supplier.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
