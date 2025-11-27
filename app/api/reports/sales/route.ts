import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/reports/sales - Rapport des ventes avec filtres multiples
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams

  // Paramètres de filtrage
  const period = searchParams.get("period") || "daily" // daily, weekly, monthly, decade, hourly
  const startDate = searchParams.get("start_date")
  const endDate = searchParams.get("end_date")
  const posId = searchParams.get("pos_id")
  const cashierId = searchParams.get("cashier_id")
  const productCategory = searchParams.get("category")
  const paymentMethod = searchParams.get("payment_method")
  const shiftType = searchParams.get("shift") // morning, afternoon, night

  try {
    let query = supabase
      .from("sales")
      .select(`
        id,
        ticket_number,
        sale_date,
        total_amount,
        total_tax,
        discount_amount,
        currency_code,
        shift,
        cashier_id,
        users!sales_cashier_id_fkey (full_name),
        cash_session_id,
        cash_sessions (
          cash_register_id,
          cash_registers (name, pos_id, point_of_sales (name))
        ),
        sale_items (
          quantity,
          unit_price,
          total_price,
          products (name, category_id, product_categories (name))
        ),
        payments (amount, payment_method, currency_code)
      `)
      .eq("status", "completed")

    // Filtres de date
    if (startDate) {
      query = query.gte("sale_date", startDate)
    }
    if (endDate) {
      query = query.lte("sale_date", endDate)
    }

    // Filtre par point de vente
    if (posId) {
      query = query.eq("cash_sessions.cash_registers.pos_id", posId)
    }

    // Filtre par caissier
    if (cashierId) {
      query = query.eq("cashier_id", cashierId)
    }

    // Filtre par vacation
    if (shiftType) {
      query = query.eq("shift", shiftType)
    }

    const { data: sales, error } = await query.order("sale_date", { ascending: false })

    if (error) throw error

    // Calcul des agrégats
    const totalRevenue = sales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0
    const totalTax = sales?.reduce((sum, sale) => sum + Number(sale.total_tax), 0) || 0
    const totalDiscount = sales?.reduce((sum, sale) => sum + Number(sale.discount_amount), 0) || 0
    const ticketCount = sales?.length || 0
    const averageTicket = ticketCount > 0 ? totalRevenue / ticketCount : 0

    // Répartition par méthode de paiement
    const paymentBreakdown: Record<string, number> = {}
    sales?.forEach((sale) => {
      sale.payments?.forEach((payment: any) => {
        const method = payment.payment_method
        paymentBreakdown[method] = (paymentBreakdown[method] || 0) + Number(payment.amount)
      })
    })

    // Répartition par catégorie de produits
    const categoryBreakdown: Record<string, { quantity: number; revenue: number }> = {}
    sales?.forEach((sale) => {
      sale.sale_items?.forEach((item: any) => {
        const categoryName = item.products?.product_categories?.name || "Non catégorisé"
        if (!categoryBreakdown[categoryName]) {
          categoryBreakdown[categoryName] = { quantity: 0, revenue: 0 }
        }
        categoryBreakdown[categoryName].quantity += item.quantity
        categoryBreakdown[categoryName].revenue += Number(item.total_price)
      })
    })

    // Répartition par caissier
    const cashierBreakdown: Record<string, { sales: number; revenue: number }> = {}
    sales?.forEach((sale) => {
      const cashierName = (sale.users as any)?.full_name || "Inconnu"
      if (!cashierBreakdown[cashierName]) {
        cashierBreakdown[cashierName] = { sales: 0, revenue: 0 }
      }
      cashierBreakdown[cashierName].sales++
      cashierBreakdown[cashierName].revenue += Number(sale.total_amount)
    })

    // Répartition par point de vente
    const posBreakdown: Record<string, { sales: number; revenue: number }> = {}
    sales?.forEach((sale) => {
      const posName = (sale.cash_sessions as any)?.cash_registers?.point_of_sales?.name || "Inconnu"
      if (!posBreakdown[posName]) {
        posBreakdown[posName] = { sales: 0, revenue: 0 }
      }
      posBreakdown[posName].sales++
      posBreakdown[posName].revenue += Number(sale.total_amount)
    })

    // Répartition par tranche horaire
    const hourlyBreakdown: Record<string, { sales: number; revenue: number }> = {}
    sales?.forEach((sale) => {
      const hour = new Date(sale.sale_date).getHours()
      const hourKey = `${hour.toString().padStart(2, "0")}:00`
      if (!hourlyBreakdown[hourKey]) {
        hourlyBreakdown[hourKey] = { sales: 0, revenue: 0 }
      }
      hourlyBreakdown[hourKey].sales++
      hourlyBreakdown[hourKey].revenue += Number(sale.total_amount)
    })

    return NextResponse.json({
      summary: {
        total_revenue_ttc: totalRevenue,
        total_revenue_ht: totalRevenue - totalTax,
        total_tax: totalTax,
        total_discount: totalDiscount,
        ticket_count: ticketCount,
        average_ticket: averageTicket,
      },
      breakdown: {
        by_payment_method: paymentBreakdown,
        by_category: categoryBreakdown,
        by_cashier: cashierBreakdown,
        by_point_of_sale: posBreakdown,
        by_hour: hourlyBreakdown,
      },
      period: { start: startDate, end: endDate, type: period },
      raw_data: sales,
    })
  } catch (error) {
    console.error("Error generating sales report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
