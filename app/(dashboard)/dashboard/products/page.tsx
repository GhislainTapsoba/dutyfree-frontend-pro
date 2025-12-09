"use client"

import { useEffect, useState } from "react"
import { productsService, Product, Category } from "@/lib/api"
import { ProductsTable } from "@/components/products/products-table"
import { ProductFilters } from "@/components/products/product-filters"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Package, DollarSign, Tag, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsService.getProducts(),
        productsService.getCategories(),
      ])

      if (productsRes.data && Array.isArray(productsRes.data)) {
        setProducts(productsRes.data)
      } else {
        setProducts([])
      }

      if (categoriesRes.data && Array.isArray(categoriesRes.data)) {
        setCategories(categoriesRes.data)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      setProducts([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const activeProducts = products.filter(p => p.is_active).length
  const totalValue = products.reduce((sum, p) => sum + ((p.selling_price_eur || p.selling_price_usd || p.selling_price_xof || 0) * 1), 0)
  const avgPrice = products.length > 0 ? totalValue / products.length : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-muted-foreground">Gérez votre catalogue de produits Duty Free</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
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
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                Total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total produits</p>
              <p className="text-3xl font-bold">{products.length}</p>
              <p className="text-xs text-muted-foreground">références au catalogue</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                Actif
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Produits actifs</p>
              <p className="text-3xl font-bold">{activeProducts}</p>
              <p className="text-xs text-muted-foreground">en vente actuellement</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Tag className="w-6 h-6 text-violet-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                Catégories
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Catégories</p>
              <p className="text-3xl font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground">familles de produits</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                Prix moyen
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Prix moyen</p>
              <p className="text-3xl font-bold">{avgPrice.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">FCFA par produit</p>
            </div>
          </div>
        </Card>
      </div>

      <ProductFilters categories={categories} />
      <ProductsTable products={products} onProductDeleted={loadData} />
    </div>
  )
}
