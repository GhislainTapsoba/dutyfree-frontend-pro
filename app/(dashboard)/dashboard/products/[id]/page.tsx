"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { productsService, Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Package, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProduct() {
      if (!params.id) return
      
      setLoading(true)
      try {
        const response = await productsService.getProduct(params.id as string)
        if (response.data) {
          setProduct(response.data)
        }
      } catch (error) {
        console.error("Erreur lors du chargement du produit:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Produit non trouvé</h2>
        <p className="text-muted-foreground mb-4">Le produit demandé n'existe pas ou a été supprimé.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name_fr}</h1>
            <p className="text-muted-foreground">{product.name_en}</p>
          </div>
        </div>
        <Link href={`/dashboard/products/${product.id}/edit`}>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image du produit */}
        <Card>
          <CardContent className="p-6">
            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name_fr}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations générales */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Code produit</label>
                <p className="font-mono">{product.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Code-barres</label>
                <p className="font-mono">{product.barcode || "Non défini"}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Catégorie</label>
              <p>{product.category?.name_fr || "Non catégorisé"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Fournisseur</label>
              <p>{product.supplier?.name || "Non défini"}</p>
            </div>

            {product.description_fr && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description (FR)</label>
                <p>{product.description_fr}</p>
              </div>
            )}

            {product.description_en && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description (EN)</label>
                <p>{product.description_en}</p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-muted-foreground">Statut</label>
              {product.is_active ? (
                <Badge className="bg-primary/10 text-primary border-primary/20">Actif</Badge>
              ) : (
                <Badge variant="secondary">Inactif</Badge>
              )}
              {product.is_promotional && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">Promotion</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prix */}
        <Card>
          <CardHeader>
            <CardTitle>Prix de vente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">XOF (FCFA)</label>
              <p className="text-lg font-semibold">{formatPrice(product.selling_price_xof)} FCFA</p>
            </div>
            {product.selling_price_eur && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">EUR</label>
                <p className="text-lg font-semibold">{formatPrice(product.selling_price_eur)} €</p>
              </div>
            )}
            {product.selling_price_usd && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">USD</label>
                <p className="text-lg font-semibold">{formatPrice(product.selling_price_usd)} $</p>
              </div>
            )}
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Taux de TVA</label>
              <p>{product.tax_rate}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion du stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Stock actuel</label>
              <p className="text-lg font-semibold">{product.current_stock || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Stock minimum</label>
              <p>{product.min_stock_level}</p>
            </div>
            {product.max_stock_level && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stock maximum</label>
                <p>{product.max_stock_level}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations système */}
        <Card>
          <CardHeader>
            <CardTitle>Informations système</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Créé le</label>
              <p>{new Date(product.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Modifié le</label>
              <p>{new Date(product.updated_at).toLocaleDateString("fr-FR")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}