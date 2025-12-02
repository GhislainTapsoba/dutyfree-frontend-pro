"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Eye } from "lucide-react"

interface Category {
  id: string
  code: string
  name_fr: string
  name_en: string
  parent_id?: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null)
  const [error, setError] = useState<string | null>(null)
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
      const response = await fetch('http://localhost:3001/api/products/categories')
      const data = await response.json()
      setCategories(data.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      const url = editingCategory 
        ? `http://localhost:3001/api/products/categories/${editingCategory.id}`
        : 'http://localhost:3001/api/products/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        loadCategories()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setError('Erreur lors de la sauvegarde')
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
    console.log('Delete category:', id)
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/products/categories/${id}`, {
          method: 'DELETE'
        })
        console.log('Delete response:', response.status)
        if (response.ok) {
          loadCategories()
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ name_fr: '', name_en: '', sort_order: 0, image_url: '' })
    setEditingCategory(null)
    setError(null)
    setImagePreview(null)
  }

  const handleView = (category: Category) => {
    setViewingCategory(category)
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
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
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
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Catégories</CardTitle>
        </CardHeader>
        <CardContent>
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
                      {category.image_url?.startsWith('http') ? (
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
                  <TableCell>{new Date(category.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleView(category)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de détails */}
      {viewingCategory && (
        <Dialog open={!!viewingCategory} onOpenChange={() => setViewingCategory(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de la catégorie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Image */}
              {viewingCategory.image_url && (
                <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {viewingCategory.image_url.startsWith('http') ? (
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
                  <p className="text-sm text-muted-foreground mt-2">{new Date(viewingCategory.created_at).toLocaleString('fr-FR')}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setViewingCategory(null)}>Fermer</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}