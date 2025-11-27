import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Profil de l'utilisateur connecté
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        role:roles(id, code, name, permissions),
        point_of_sale:point_of_sales(id, code, name)
      `)
      .eq("id", user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Profil non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Mettre à jour son propre profil
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { first_name, last_name, phone } = body

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (first_name !== undefined) updateData.first_name = first_name
    if (last_name !== undefined) updateData.last_name = last_name
    if (phone !== undefined) updateData.phone = phone

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select(`
        *,
        role:roles(id, code, name, permissions),
        point_of_sale:point_of_sales(id, code, name)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
