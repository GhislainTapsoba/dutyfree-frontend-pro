"use client"

import { useEffect, useState } from "react"
import { productsService, paymentsService } from "@/lib/api"
import { POSInterface } from "@/components/pos/pos-interface"
import { Loader2 } from "lucide-react"

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [currencies, setCurrencies] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [productsRes, categoriesRes, currenciesRes, methodsRes] = await Promise.all([
          productsService.getProducts({ is_active: true, in_stock: true }),
          productsService.getCategories(),
          paymentsService.getCurrencies(),
          paymentsService.getPaymentMethods(),
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

        if (currenciesRes.data && Array.isArray(currenciesRes.data)) {
          setCurrencies(currenciesRes.data)
        } else {
          setCurrencies([])
        }

        if (methodsRes.data && Array.isArray(methodsRes.data)) {
          setPaymentMethods(methodsRes.data)
        } else {
          setPaymentMethods([])
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données POS:", error)
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
    <POSInterface
      products={products}
      categories={categories}
      currencies={currencies}
      paymentMethods={paymentMethods}
    />
  )
}
