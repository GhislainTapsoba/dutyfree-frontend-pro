import { createClient } from "@/lib/supabase/server"
import { SettingsTabs } from "@/components/settings/settings-tabs"

export default async function SettingsPage() {
  const supabase = await createClient()

  const [{ data: companySettings }, { data: currencies }, { data: paymentMethods }, { data: pointOfSales }] =
    await Promise.all([
      supabase.from("system_settings").select("*"),
      supabase.from("currencies").select("*").order("code"),
      supabase.from("payment_methods").select("*").order("name"),
      supabase.from("point_of_sales").select("*, cash_registers(*)").order("name"),
    ])

  // Convert settings array to object
  const settings: Record<string, string> = {}
  companySettings?.forEach((s) => {
    settings[s.key] = s.value
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Configurez votre système Duty Free</p>
      </div>

      <SettingsTabs
        settings={settings}
        currencies={currencies || []}
        paymentMethods={paymentMethods || []}
        pointOfSales={pointOfSales || []}
      />
    </div>
  )
}
