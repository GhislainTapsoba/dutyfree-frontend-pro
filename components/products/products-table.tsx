"use client"
import Link from "next/link"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreHorizontal, Edit, Trash2, Eye, Package } from "lucide-react"
import { productsService, Product } from "@/lib/api"
import { toast } from "sonner"

interface ProductsTableProps {
  products: Product[]
  onProductDeleted?: () => void
}

export function ProductsTable({ products, onProductDeleted }: ProductsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : []

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    try {
      await productsService.deleteProduct(productToDelete.id)
      toast.success('Produit supprimé avec succès')
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      onProductDeleted?.()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression du produit')
    } finally {
      setIsDeleting(false)
    }
  }

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
            <TableHead className="w-[100px]">Image</TableHead>
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
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {product.image_url?.startsWith('http') ? (
                      <img
                        src={product.image_url}
                        alt={product.name_fr}
                        className="w-full h-full object-cover"
                      />
                    ) : product.image_url?.startsWith('data:') ? (
                      <img
                        src={product.image_url}
                        alt={product.name_fr}
                        className="w-full h-full object-cover"
                      />
                    ) : product.image_url ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/images/${product.image_url.split('/').pop()}`}
                        alt={product.name_fr}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : null}
                    <Package className={`w-6 h-6 text-muted-foreground ${!product.image_url ? '' : 'hidden'}`} />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name_fr}</p>
                    {product.name_en && <p className="text-xs text-muted-foreground">{product.name_en}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-mono text-sm">{product.code}</p>
                    {product.barcode && <p className="text-xs text-muted-foreground">{product.barcode}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category?.name_fr || "Non catégorisé"}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">{formatPrice(product.selling_price_xof)}</TableCell>
                <TableCell className="text-center">{getStockBadge(product.current_stock || 0)}</TableCell>
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
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteClick(product)}
                      >
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit "{productToDelete?.name_fr}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
