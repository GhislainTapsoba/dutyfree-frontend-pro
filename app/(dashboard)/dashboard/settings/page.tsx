import { SettingsTabs } from "@/components/settings/settings-tabs"

export default async function SettingsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  
  const [companyRes, currenciesRes, paymentMethodsRes, posRes] = await Promise.all([
    fetch(`${apiUrl}/settings/company`, { cache: 'no-store' }),
    fetch(`${apiUrl}/currencies`, { cache: 'no-store' }),
    fetch(`${apiUrl}/payments/methods`, { cache: 'no-store' }),
    fetch(`${apiUrl}/point-of-sales`, { cache: 'no-store' }),
  ])

  const [companyData, currenciesData, paymentMethodsData, posData] = await Promise.all([
    companyRes.json(),
    currenciesRes.json(),
    paymentMethodsRes.json(),
    posRes.json(),
  ])

  const settings: Record<string, string> = {
    company_name: companyData.data?.name || '',
    company_address: companyData.data?.address || '',
    company_phone: companyData.data?.phone || '',
    company_email: companyData.data?.email || '',
    tax_id: companyData.data?.tax_id || '',
    logo_url: companyData.data?.logo_url || '',
    receipt_header: companyData.data?.header || '',
    receipt_footer: companyData.data?.footer || '',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Configurez votre système Duty Free</p>
      </div>

      <SettingsTabs
        settings={settings}
        currencies={currenciesData.data || []}
        paymentMethods={paymentMethodsData.data || []}
        pointOfSales={posData.data || []}
      />
    </div>
  )
}
