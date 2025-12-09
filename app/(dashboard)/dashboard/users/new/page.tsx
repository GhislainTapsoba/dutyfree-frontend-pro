import { createClient } from "@/lib/supabase/server"
import { UserForm } from "@/components/users/user-form"

export default async function NewUserPage() {
  const supabase = await createClient()

  const [{ data: roles }, { data: pointOfSales }] = await Promise.all([
    supabase.from("roles").select("*").order("name"),
    supabase.from("point_of_sales").select("*").eq("is_active", true).order("name"),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouvel utilisateur</h1>
        <p className="text-muted-foreground">Créez un nouveau compte utilisateur</p>
      </div>

      <UserForm roles={roles || []} pointOfSales={pointOfSales || []} />
    </div>
  )
}
