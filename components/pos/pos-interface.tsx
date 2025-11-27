"use client"

import { useState, useMemo } from "react"
import { ProductGrid } from "./product-grid"
import { Cart } from "./cart"
import { PaymentModal } from "./payment-modal"
import { PassengerInfoModal } from "./passenger-info-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ScanBarcode, Grid3X3, List } from "lucide-react"

export interface CartItem {
  id: string
  product: any
  quantity: number
  unit_price: number
  discount_percent: number
}

interface POSInterfaceProps {
  products: any[]
  categories: any[]
  currencies: any[]
  paymentMethods: any[]
}

export function POSInterface({ products, categories, currencies, paymentMethods }: POSInterfaceProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPassengerModal, setShowPassengerModal] = useState(false)
  const [passengerInfo, setPassengerInfo] = useState<any>(null)
  const [selectedCurrency, setSelectedCurrency] = useState(
    Array.isArray(currencies) && currencies.length > 0
      ? currencies.find((c) => c.code === "XOF") || currencies[0]
      : { code: "XOF", name: "Franc CFA", symbol: "XOF" }
  )

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return []
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.includes(searchQuery)
      const matchesCategory = !selectedCategory || product.category_id === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          return prev // Can't add more than stock
        }
        return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          product,
          quantity: 1,
          unit_price: Number(product.price),
          discount_percent: 0,
        },
      ]
    })
  }

  const updateCartItem = (id: string, updates: Partial<CartItem>) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setPassengerInfo(null)
  }

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemTotal = item.unit_price * item.quantity
      const discount = (itemTotal * item.discount_percent) / 100
      return sum + (itemTotal - discount)
    }, 0)
  }, [cart])

  const handlePaymentComplete = () => {
    clearCart()
    setShowPaymentModal(false)
  }

  const handleBarcodeScanned = (barcode: string) => {
    if (!Array.isArray(products)) return
    const product = products.find((p) => p.barcode === barcode)
    if (product) {
      addToCart(product)
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col bg-card rounded-lg border border-border overflow-hidden">
        {/* Search & Filters */}
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher produit, code-barres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Button variant="outline" size="icon">
              <ScanBarcode className="w-4 h-4" />
            </Button>
            <div className="flex border border-border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedCategory(null)}
            >
              Tous
            </Badge>
            {Array.isArray(categories) && categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-auto p-4">
          <ProductGrid
            products={filteredProducts}
            viewMode={viewMode}
            onAddToCart={addToCart}
            currency={selectedCurrency}
          />
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-[400px] flex flex-col bg-card rounded-lg border border-border overflow-hidden">
        <Cart
          items={cart}
          total={cartTotal}
          currency={selectedCurrency}
          currencies={currencies}
          passengerInfo={passengerInfo}
          onUpdateItem={updateCartItem}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onSelectCurrency={setSelectedCurrency}
          onAddPassenger={() => setShowPassengerModal(true)}
          onCheckout={() => setShowPaymentModal(true)}
        />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          items={cart}
          total={cartTotal}
          currency={selectedCurrency}
          currencies={currencies}
          paymentMethods={paymentMethods}
          passengerInfo={passengerInfo}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
        />
      )}

      {/* Passenger Info Modal */}
      {showPassengerModal && (
        <PassengerInfoModal
          onClose={() => setShowPassengerModal(false)}
          onSave={(info) => {
            setPassengerInfo(info)
            setShowPassengerModal(false)
          }}
        />
      )}
    </div>
  )
}
