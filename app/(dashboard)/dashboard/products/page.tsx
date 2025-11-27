"use client"

import { useEffect, useState } from "react"
import { productsService, Product, Category } from "@/lib/api"
import { ProductsTable } from "@/components/products/products-table"
import { ProductFilters } from "@/components/products/product-filters"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
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

      <ProductFilters categories={categories} />
      <ProductsTable products={products} />
    </div>
  )
}
