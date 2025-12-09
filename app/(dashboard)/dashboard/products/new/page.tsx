"use client"

import { useEffect, useState } from "react"
import { ProductForm } from "@/components/products/product-form"
import { Loader2 } from "lucide-react"

export default function NewProductPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
        const [categoriesRes, suppliersRes] = await Promise.all([
          fetch(`${apiUrl}/products/categories`).then(r => r.json()),
          fetch(`${apiUrl}/suppliers?is_active=true`).then(r => r.json())
        ])
        
        setCategories(categoriesRes.data || [])
        setSuppliers(suppliersRes.data || [])
      } catch (error) {
        console.error('Error loading data:', error)
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouveau produit</h1>
        <p className="text-muted-foreground">Ajoutez un nouveau produit au catalogue</p>
      </div>

      <ProductForm categories={categories} suppliers={suppliers} />
    </div>
  )
}
