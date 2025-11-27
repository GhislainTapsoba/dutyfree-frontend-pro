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

  return (
    <div className="flex flex-col h-full">
      {/* Cart Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Panier</h2>
            {totalItems > 0 && <Badge variant="secondary">{totalItems}</Badge>}
          </div>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onClearCart}>
              Vider
            </Button>
          )}
        </div>

        {/* Currency Selector */}
        <Select value={currency?.id} onValueChange={(id) => onSelectCurrency(currencies.find((c) => c.id === id))}>
          <SelectTrigger className="bg-secondary border-border">
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

      {/* Passenger Info */}
      <div className="p-4 border-b border-border">
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
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
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
                      onClick={() => item.quantity > 1 && onUpdateItem(item.id, { quantity: item.quantity - 1 })}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateItem(item.id, {
                          quantity: Math.min(Number.parseInt(e.target.value) || 1, item.product.stock_quantity),
                        })
                      }
                      className="w-14 h-8 text-center bg-secondary border-border"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() =>
                        item.quantity < item.product.stock_quantity &&
                        onUpdateItem(item.id, { quantity: item.quantity + 1 })
                      }
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
                      onChange={(e) =>
                        onUpdateItem(item.id, {
                          discount_percent: Math.min(Number.parseInt(e.target.value) || 0, 100),
                        })
                      }
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

      {/* Cart Footer */}
      <div className="p-4 border-t border-border space-y-4 bg-secondary/30">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total</span>
            <span>
              {formatPrice(total)} {currency?.code}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TVA (0%)</span>
            <span>0 {currency?.code}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">
              {formatPrice(total)} {currency?.code}
            </span>
          </div>
        </div>

        <Button className="w-full h-12 text-lg" disabled={items.length === 0} onClick={onCheckout}>
          Encaisser
        </Button>
      </div>
    </div>
  )
}
