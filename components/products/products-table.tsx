"use client"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { MoreHorizontal, Edit, Trash2, Eye, Package } from "lucide-react"

interface ProductsTableProps {
  products: any[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : []

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price)
  }

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Rupture</Badge>
    }
    if (quantity <= 10) {
      return <Badge className="bg-warning text-warning-foreground">Faible ({quantity})</Badge>
    }
    return <Badge variant="secondary">{quantity}</Badge>
  }

  return (
    <Card className="border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead>SKU / Code-barres</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead className="text-right">Prix (XOF)</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead className="text-center">Statut</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4" />
                Aucun produit trouvé
              </TableCell>
            </TableRow>
          ) : (
            safeProducts.map((product) => (
              <TableRow key={product.id} className="border-border">
                <TableCell>
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    {product.name_en && <p className="text-xs text-muted-foreground">{product.name_en}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-mono text-sm">{product.sku}</p>
                    {product.barcode && <p className="text-xs text-muted-foreground">{product.barcode}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.product_categories?.name || "Non catégorisé"}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">{formatPrice(product.price)}</TableCell>
                <TableCell className="text-center">{getStockBadge(product.stock_quantity)}</TableCell>
                <TableCell className="text-center">
                  {product.is_active ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20">Actif</Badge>
                  ) : (
                    <Badge variant="secondary">Inactif</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/products/${product.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
