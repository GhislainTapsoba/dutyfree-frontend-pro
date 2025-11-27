import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/products/product-form"

export default async function NewProductPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: suppliers }] = await Promise.all([
    supabase.from("product_categories").select("*").order("name"),
    supabase.from("suppliers").select("*").eq("is_active", true).order("name"),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouveau produit</h1>
        <p className="text-muted-foreground">Ajoutez un nouveau produit au catalogue</p>
      </div>

      <ProductForm categories={categories || []} suppliers={suppliers || []} />
    </div>
  )
}
