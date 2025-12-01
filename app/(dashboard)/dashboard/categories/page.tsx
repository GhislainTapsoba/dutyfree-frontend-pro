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
  const [formData, setFormData] = useState({
    name_fr: '',
    name_en: ''
  })

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
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleEdit = (category: Category) => {
    console.log('Edit category:', category)
    setEditingCategory(category)
    setFormData({
      name_fr: category.name_fr,
      name_en: category.name_en
    })
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
    setFormData({ name_fr: '', name_en: '' })
    setEditingCategory(null)
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
                <TableHead>Code</TableHead>
                <TableHead>Nom (FR)</TableHead>
                <TableHead>Nom (EN)</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-mono text-sm">{category.code}</TableCell>
                  <TableCell className="font-medium">{category.name_fr}</TableCell>
                  <TableCell>{category.name_en}</TableCell>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de la catégorie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Code</Label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{viewingCategory.code}</p>
              </div>
              <div>
                <Label>Nom (Français)</Label>
                <p className="p-2">{viewingCategory.name_fr}</p>
              </div>
              <div>
                <Label>Nom (Anglais)</Label>
                <p className="p-2">{viewingCategory.name_en}</p>
              </div>
              <div>
                <Label>Ordre de tri</Label>
                <p className="p-2">{viewingCategory.sort_order}</p>
              </div>
              <div>
                <Label>Statut</Label>
                <Badge variant={viewingCategory.is_active ? "default" : "secondary"}>
                  {viewingCategory.is_active ? "Actif" : "Inactif"}
                </Badge>
              </div>
              <div>
                <Label>Date de création</Label>
                <p className="p-2">{new Date(viewingCategory.created_at).toLocaleString('fr-FR')}</p>
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