"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Eye, MoreVertical, Layers, CheckCircle, XCircle, FolderOpen } from "lucide-react"
import { api } from "@/lib/api/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface Category {
  id: string
  code: string
  name_fr: string
  name_en: string
  parent_id?: string
  sort_order: number
  is_active: boolean
  created_at: string
  image_url?: string
}

interface CategoryStats {
  total: number
  active: number
  inactive: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<CategoryStats>({ total: 0, active: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name_fr: '',
    name_en: '',
    sort_order: 0,
    image_url: ''
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFormData({...formData, image_url: base64})
        setImagePreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await api.get<Category[]>('/products/categories')
      if (response.data) {
        setCategories(response.data)

        // Calculate stats
        const total = response.data.length
        const active = response.data.filter(c => c.is_active).length
        const inactive = total - active
        setStats({ total, active, inactive })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name_fr || !formData.name_en) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      let response
      if (editingCategory) {
        response = await api.put<Category>(`/products/categories/${editingCategory.id}`, formData)
      } else {
        response = await api.post<Category>('/products/categories', formData)
      }

      if (response.data) {
        toast.success(editingCategory ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès')
        setIsDialogOpen(false)
        resetForm()
        loadCategories()
      } else if (response.error) {
        toast.error(response.error)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (category: Category) => {
    console.log('Edit category:', category)
    setEditingCategory(category)
    setFormData({
      name_fr: category.name_fr,
      name_en: category.name_en,
      sort_order: category.sort_order,
      image_url: category.image_url || ''
    })
    setImagePreview(category.image_url || null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return
    }

    try {
      const response = await api.delete(`/products/categories/${id}`)
      if (response.data || !response.error) {
        toast.success('Catégorie supprimée avec succès')
        loadCategories()
      } else {
        toast.error(response.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({ name_fr: '', name_en: '', sort_order: 0, image_url: '' })
    setEditingCategory(null)
    setImagePreview(null)
  }

  const handleView = async (category: Category) => {
    try {
      const response = await api.get<Category>(`/products/categories/${category.id}`)
      if (response.data) {
        setViewingCategory(response.data)
        setViewDialogOpen(true)
      } else {
        toast.error('Erreur lors du chargement des détails')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors du chargement')
    }
  }

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
          <h1 className="text-2xl font-bold">Catégories de Produits</h1>
          <p className="text-muted-foreground">Gérez les catégories de votre catalogue Duty Free</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? `Modifiez les informations de la catégorie ${editingCategory.code}`
                  : "Créez une nouvelle catégorie de produits"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nom (Français)</Label>
                <Input
                  value={formData.name_fr}
                  onChange={(e) => setFormData({...formData, name_fr: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Nom (Anglais)</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Ordre de tri</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({...formData, sort_order: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Image de la catégorie</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Ou entrez une URL:</p>
                <Input
                  value={formData.image_url.startsWith('data:') ? '' : formData.image_url}
                  onChange={(e) => {
                    setFormData({...formData, image_url: e.target.value})
                    setImagePreview(e.target.value)
                  }}
                  placeholder="https://..."
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Prévisualisation"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Modifier' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards avec Design Moderne */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                Total
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total catégories</p>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">dans le catalogue</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                Actif
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Catégories actives</p>
              <p className="text-3xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">visibles aux clients</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center ring-4 ring-background shadow-sm">
                <XCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">
                Inactif
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Catégories inactives</p>
              <p className="text-3xl font-bold">{stats.inactive}</p>
              <p className="text-xs text-muted-foreground">temporairement masquées</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="border-b bg-muted/30 px-6 py-4">
          <h3 className="text-lg font-semibold">Liste des catégories</h3>
          <p className="text-sm text-muted-foreground mt-1">Gérez toutes vos catégories de produits</p>
        </div>
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Nom (FR)</TableHead>
                <TableHead>Nom (EN)</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {category.image_url?.startsWith('data:') || category.image_url?.startsWith('http') ? (
                        <img
                          src={category.image_url}
                          alt={category.name_fr}
                          className="w-full h-full object-cover"
                        />
                      ) : category.image_url ? (
                        <img
                          src={`http://localhost:3001/api/images/${category.image_url.split('/').pop()}`}
                          alt={category.name_fr}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {category.name_fr?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{category.code}</TableCell>
                  <TableCell className="font-medium">{category.name_fr}</TableCell>
                  <TableCell>{category.name_en}</TableCell>
                  <TableCell className="font-mono text-sm">{category.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(category.created_at), "dd MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(category)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(category.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </Card>

      {/* Modal de détails */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la catégorie</DialogTitle>
            <DialogDescription>
              Informations complètes de la catégorie {viewingCategory?.code}
            </DialogDescription>
          </DialogHeader>

          {viewingCategory && (
            <div className="space-y-4">
              {/* Image */}
              {viewingCategory.image_url && (
                <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {viewingCategory.image_url.startsWith('data:') || viewingCategory.image_url.startsWith('http') ? (
                    <img
                      src={viewingCategory.image_url}
                      alt={viewingCategory.name_fr}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={`http://localhost:3001/api/images/${viewingCategory.image_url.split('/').pop()}`}
                      alt={viewingCategory.name_fr}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Code</Label>
                  <p className="font-mono text-sm bg-secondary p-2 rounded">{viewingCategory.code}</p>
                </div>
                <div>
                  <Label>Ordre de tri</Label>
                  <p className="font-mono text-sm bg-secondary p-2 rounded">{viewingCategory.sort_order}</p>
                </div>
              </div>
              
              <div>
                <Label>Nom (Français)</Label>
                <p className="p-2 bg-secondary rounded">{viewingCategory.name_fr}</p>
              </div>
              <div>
                <Label>Nom (Anglais)</Label>
                <p className="p-2 bg-secondary rounded">{viewingCategory.name_en}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Statut</Label>
                  <div className="mt-2">
                    <Badge variant={viewingCategory.is_active ? "default" : "secondary"}>
                      {viewingCategory.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Date de création</Label>
                  <p className="text-sm text-muted-foreground mt-2">
                    {format(new Date(viewingCategory.created_at), "dd MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}