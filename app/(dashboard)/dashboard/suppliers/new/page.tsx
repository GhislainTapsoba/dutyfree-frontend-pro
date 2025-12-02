"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { suppliersService } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewSupplierPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
    tax_number: "",
    notes: "",
    is_active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await suppliersService.createSupplier(formData)
      if (response.data) {
        router.push("/dashboard/suppliers")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/suppliers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nouveau fournisseur</h1>
          <p className="text-muted-foreground">Ajouter un nouveau fournisseur</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du fournisseur *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Personne de contact</Label>
              <Input
                id="contact_person"
                value={formData.contact_person || ""}
                onChange={(e) => handleChange("contact_person", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={formData.country || ""}
                onChange={(e) => handleChange("country", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              <Input
                id="postal_code"
                value={formData.postal_code || ""}
                onChange={(e) => handleChange("postal_code", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_number">Numéro fiscal</Label>
              <Input
                id="tax_number"
                value={formData.tax_number || ""}
                onChange={(e) => handleChange("tax_number", e.target.value)}
                placeholder="IFU ou numéro d'identification fiscale"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange("is_active", checked)}
              />
              <Label htmlFor="is_active">Fournisseur actif</Label>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              placeholder="Notes additionnelles..."
            />
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-border">
            <Link href="/dashboard/suppliers">
              <Button variant="outline" type="button">
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Créer le fournisseur
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}