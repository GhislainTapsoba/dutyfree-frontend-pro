"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

interface ProductFiltersProps {
  categories: any[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "")

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (category) params.set("category", category)
    if (status) params.set("status", status)
    router.push(`/dashboard/products?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("")
    setStatus("")
    router.push("/dashboard/products")
  }

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, SKU, code-barres..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFilter()}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[180px] bg-secondary border-border">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes</SelectItem>
          {Array.isArray(categories) && categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name_fr || cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[140px] bg-secondary border-border">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          <SelectItem value="active">Actifs</SelectItem>
          <SelectItem value="inactive">Inactifs</SelectItem>
          <SelectItem value="low_stock">Stock faible</SelectItem>
          <SelectItem value="out_of_stock">Rupture</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleFilter}>
        <Filter className="w-4 h-4 mr-2" />
        Filtrer
      </Button>

      {(search || category || status) && (
        <Button variant="ghost" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Effacer
        </Button>
      )}
    </div>
  )
}
