"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Minus, User, Plane, ShoppingCart, Percent } from "lucide-react"
import type { CartItem } from "./pos-interface"

interface CartProps {
  items: CartItem[]
  total: number
  currency: any
  currencies: any[]
  passengerInfo: any
  onUpdateItem: (id: string, updates: Partial<CartItem>) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
  onSelectCurrency: (currency: any) => void
  onAddPassenger: () => void
  onCheckout: () => void
}

export function Cart({
  items,
  total,
  currency,
  currencies,
  passengerInfo,
  onUpdateItem,
  onRemoveItem,
  onClearCart,
  onSelectCurrency,
  onAddPassenger,
  onCheckout,
}: CartProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price)
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const taxRate = 0.18 // 18% TVA Burkina Faso
  const taxAmount = total * taxRate
  const totalWithTax = total + taxAmount

  return (
    <div className="flex flex-col h-full">
      {/* Cart Header avec gradient */}
      <div className="p-4 border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold">Panier</h2>
            {totalItems > 0 && (
              <Badge className="bg-gradient-to-r from-primary to-primary/80 shadow-sm">
                {totalItems}
              </Badge>
            )}
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={onClearCart}
            >
              Vider
            </Button>
          )}
        </div>

        {/* Currency Selector */}
        <Select value={currency?.id} onValueChange={(id) => onSelectCurrency(currencies.find((c) => c.id === id))}>
          <SelectTrigger className="bg-background/80 backdrop-blur-sm border-border/50">
            <SelectValue placeholder="Devise" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((curr) => (
              <SelectItem key={curr.id} value={curr.id}>
                {curr.code} - {curr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Passenger Info avec style */}
      <div className="p-4 border-b border-border bg-muted/30">
        <Button
          variant={passengerInfo ? "secondary" : "outline"}
          className="w-full justify-start gap-2"
          onClick={onAddPassenger}
        >
          {passengerInfo ? (
            <>
              <Plane className="w-4 h-4 text-primary" />
              <span className="truncate">
                {passengerInfo.name} - {passengerInfo.flight}
              </span>
            </>
          ) : (
            <>
              <User className="w-4 h-4" />
              <span>Ajouter infos passager</span>
            </>
          )}
        </Button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mb-4" />
            <p>Panier vide</p>
            <p className="text-sm">Ajoutez des produits pour commencer</p>
          </div>
        ) : (
          items.map((item) => {
            const itemTotal = item.unit_price * item.quantity * (1 - item.discount_percent / 100)
            return (
              <div key={item.id} className="p-3 rounded-lg bg-secondary/50 border border-border space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name_fr || item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.unit_price)} {currency?.code} / unité
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {/* Quantity */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={(e) => {
                        e.preventDefault()
                        if (item.quantity > 1) {
                          onUpdateItem(item.id, { quantity: item.quantity - 1 })
                        }
                      }}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = Number.parseInt(e.target.value) || 1
                        const maxQty = item.product.stock_quantity || 100
                        onUpdateItem(item.id, {
                          quantity: Math.max(1, Math.min(newQty, maxQty)),
                        })
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowUp') {
                          e.preventDefault()
                          const maxQty = item.product.stock_quantity || 100
                          if (item.quantity < maxQty) {
                            onUpdateItem(item.id, { quantity: item.quantity + 1 })
                          }
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault()
                          if (item.quantity > 1) {
                            onUpdateItem(item.id, { quantity: item.quantity - 1 })
                          }
                        }
                      }}
                      className="w-14 h-8 text-center bg-secondary border-border"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={(e) => {
                        e.preventDefault()
                        if (item.quantity < (item.product.stock_quantity || 100)) {
                          onUpdateItem(item.id, { quantity: item.quantity + 1 })
                        }
                      }}
                      disabled={item.quantity >= (item.product.stock_quantity || 100)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Discount */}
                  <div className="flex items-center gap-1">
                    <Percent className="w-3 h-3 text-muted-foreground" />
                    <Input
                      type="number"
                      value={item.discount_percent}
                      onChange={(e) => {
                        const newDiscount = Number.parseInt(e.target.value) || 0
                        onUpdateItem(item.id, {
                          discount_percent: Math.max(0, Math.min(newDiscount, 100)),
                        })
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowUp') {
                          e.preventDefault()
                          if (item.discount_percent < 100) {
                            onUpdateItem(item.id, { discount_percent: item.discount_percent + 1 })
                          }
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault()
                          if (item.discount_percent > 0) {
                            onUpdateItem(item.id, { discount_percent: item.discount_percent - 1 })
                          }
                        }
                      }}
                      className="w-14 h-8 text-center bg-secondary border-border"
                      placeholder="0"
                    />
                  </div>

                  {/* Item Total */}
                  <span className="font-semibold text-sm text-primary min-w-[80px] text-right">
                    {formatPrice(itemTotal)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Cart Footer avec style moderne */}
      <div className="p-4 border-t border-border space-y-4 bg-gradient-to-br from-muted/50 to-muted/30">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total HT</span>
            <span className="font-medium">
              {formatPrice(total)} {currency?.code}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TVA (18%)</span>
            <span className="font-medium">{formatPrice(taxAmount)} {currency?.code}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
            <span>Total TTC</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              {formatPrice(totalWithTax)} {currency?.code}
            </span>
          </div>
        </div>

        <Button
          className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          disabled={items.length === 0}
          onClick={onCheckout}
        >
          Encaisser
        </Button>
      </div>
    </div>
  )
}
