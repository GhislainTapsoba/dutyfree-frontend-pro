"use client"

import { useEffect, useState } from "react"
import { reportsService } from "@/lib/api"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"
import { Loader2 } from "lucide-react"

export default function ReportsPage() {
  const [salesReport, setSalesReport] = useState<any>(null)
  const [paymentsReport, setPaymentsReport] = useState<any>(null)
  const [cashiersReport, setCashiersReport] = useState<any>(null)
  const [kpis, setKpis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Get date range for current month
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

        const [salesRes, paymentsRes, cashiersRes, kpisRes] = await Promise.all([
          reportsService.getSalesReport({ period: 'monthly', start_date: startOfMonth, end_date: endOfMonth }),
          reportsService.getPaymentsReport({ start_date: startOfMonth, end_date: endOfMonth }),
          reportsService.getCashiersReport({ start_date: startOfMonth, end_date: endOfMonth }),
          reportsService.getKPIs({ start_date: startOfMonth, end_date: endOfMonth }),
        ])

        if (salesRes.data) setSalesReport(salesRes.data)
        if (paymentsRes.data) setPaymentsReport(paymentsRes.data)
        if (cashiersRes.data) setCashiersReport(cashiersRes.data)
        if (kpisRes.data) setKpis(kpisRes.data)
      } catch (error) {
        console.error("Erreur lors du chargement des rapports:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ReportsDashboard
      salesData={salesReport || {}}
      paymentData={paymentsReport || {}}
      topProducts={[]}
      salesByCategory={Array.isArray(salesReport?.sales_by_category) ? salesReport.sales_by_category : []}
      cashierStats={Array.isArray(cashiersReport) ? cashiersReport : []}
    />
  )
}
