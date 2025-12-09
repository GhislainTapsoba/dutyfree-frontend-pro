"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Building2, CreditCard, Globe, Receipt, Store, Loader2, Plus, Upload, X } from "lucide-react"

interface SettingsTabsProps {
  settings: Record<string, string>
  currencies: any[]
  paymentMethods: any[]
  pointOfSales: any[]
}

export function SettingsTabs({ settings, currencies, paymentMethods, pointOfSales }: SettingsTabsProps) {
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string>(settings.logo_url || "")
  const [companyData, setCompanyData] = useState({
    company_name: settings.company_name || "Duty Free Ouagadougou",
    company_address: settings.company_address || "",
    company_phone: settings.company_phone || "",
    company_email: settings.company_email || "",
    tax_id: settings.tax_id || "",
    logo_url: settings.logo_url || "",
    receipt_header: settings.receipt_header || "Bienvenue",
    receipt_footer: settings.receipt_footer || "Merci de votre visite !",
  })

  const handleSaveCompany = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/settings/company`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyData),
      })
      if (response.ok) {
        // Recharger la page pour afficher les nouvelles données
        window.location.reload()
      }
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tabs defaultValue="company" className="space-y-4">
      <TabsList className="grid grid-cols-5 w-full max-w-2xl">
        <TabsTrigger value="company" className="gap-2">
          <Building2 className="w-4 h-4" />
          <span className="hidden sm:inline">Entreprise</span>
        </TabsTrigger>
        <TabsTrigger value="pos" className="gap-2">
          <Store className="w-4 h-4" />
          <span className="hidden sm:inline">Points de vente</span>
        </TabsTrigger>
        <TabsTrigger value="currencies" className="gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">Devises</span>
        </TabsTrigger>
        <TabsTrigger value="payments" className="gap-2">
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline">Paiements</span>
        </TabsTrigger>
        <TabsTrigger value="receipts" className="gap-2">
          <Receipt className="w-4 h-4" />
          <span className="hidden sm:inline">Tickets</span>
        </TabsTrigger>
      </TabsList>

      {/* Company Settings */}
      <TabsContent value="company">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Informations de l'entreprise</CardTitle>
            <CardDescription>Ces informations apparaîtront sur les tickets de caisse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nom de l'entreprise</Label>
                <Input
                  id="company_name"
                  value={companyData.company_name}
                  onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_id">N° Identification Fiscale</Label>
                <Input
                  id="tax_id"
                  value={companyData.tax_id}
                  onChange={(e) => setCompanyData({ ...companyData, tax_id: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_address">Adresse</Label>
              <Textarea
                id="company_address"
                value={companyData.company_address}
                onChange={(e) => setCompanyData({ ...companyData, company_address: e.target.value })}
                placeholder="Aéroport International de Ouagadougou..."
                className="bg-secondary border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_phone">Téléphone</Label>
                <Input
                  id="company_phone"
                  value={companyData.company_phone}
                  onChange={(e) => setCompanyData({ ...companyData, company_phone: e.target.value })}
                  placeholder="+226 XX XX XX XX"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_email">Email</Label>
                <Input
                  id="company_email"
                  type="email"
                  value={companyData.company_email}
                  onChange={(e) => setCompanyData({ ...companyData, company_email: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo de l'entreprise</Label>
              <div className="flex gap-4 items-start">
                {logoPreview && (
                  <div className="relative w-32 h-32 border border-border rounded-lg overflow-hidden bg-secondary">
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => {
                        setLogoPreview("")
                        setCompanyData({ ...companyData, logo_url: "" })
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            const base64 = reader.result as string
                            setLogoPreview(base64)
                            setCompanyData({ ...companyData, logo_url: base64 })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Ou</p>
                  <Input
                    id="logo_url"
                    value={companyData.logo_url.startsWith('data:') ? '' : companyData.logo_url}
                    onChange={(e) => {
                      setCompanyData({ ...companyData, logo_url: e.target.value })
                      setLogoPreview(e.target.value)
                    }}
                    placeholder="https://exemple.com/logo.png"
                    className="bg-secondary border-border"
                  />
                  <p className="text-xs text-muted-foreground">Uploadez une image ou entrez une URL</p>
                </div>
              </div>
            </div>

            <Button onClick={handleSaveCompany} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Point of Sales */}
      <TabsContent value="pos">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Points de vente</CardTitle>
              <CardDescription>Gérez vos points de vente et caisses</CardDescription>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pointOfSales.map((pos) => (
                <div key={pos.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{pos.name}</h4>
                      <p className="text-sm text-muted-foreground">{pos.location}</p>
                    </div>
                    <Badge variant={pos.is_active ? "default" : "secondary"}>
                      {pos.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {pos.cash_registers?.map((register: any) => (
                      <Badge key={register.id} variant="outline">
                        Caisse {register.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Currencies */}
      <TabsContent value="currencies">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Devises</CardTitle>
            <CardDescription>Configurez les devises acceptées et les taux de change</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currencies.map((currency) => (
                <div
                  key={currency.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {currency.symbol}
                    </div>
                    <div>
                      <h4 className="font-semibold">{currency.code}</h4>
                      <p className="text-sm text-muted-foreground">{currency.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Taux</p>
                      <p className="font-mono font-semibold">{currency.exchange_rate}</p>
                    </div>
                    <Switch checked={currency.is_active} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Payment Methods */}
      <TabsContent value="payments">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Méthodes de paiement</CardTitle>
            <CardDescription>Activez ou désactivez les modes de paiement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                >
                  <div>
                    <h4 className="font-semibold">{method.name}</h4>
                    <p className="text-sm text-muted-foreground">{method.code}</p>
                  </div>
                  <Switch checked={method.is_active} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Receipt Settings */}
      <TabsContent value="receipts">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Personnalisation des tickets</CardTitle>
            <CardDescription>Personnalisez les messages sur vos tickets de caisse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receipt_header">Message d'en-tête</Label>
              <Textarea
                id="receipt_header"
                value={companyData.receipt_header}
                onChange={(e) => setCompanyData({ ...companyData, receipt_header: e.target.value })}
                placeholder="Bienvenue..."
                className="bg-secondary border-border"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">Exemple: "Bienvenue", "Bonnes fêtes de fin d'année"</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt_footer">Message de pied de page</Label>
              <Textarea
                id="receipt_footer"
                value={companyData.receipt_footer}
                onChange={(e) => setCompanyData({ ...companyData, receipt_footer: e.target.value })}
                placeholder="Merci de votre visite..."
                className="bg-secondary border-border"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">Exemple: "Merci, bon voyage et au plaisir de vous revoir"</p>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg bg-secondary border border-border">
              <p className="text-sm font-semibold mb-2">Aperçu du ticket</p>
              <div className="bg-white text-black p-4 rounded font-mono text-xs space-y-2">
                <p className="text-center">{companyData.company_name}</p>
                <p className="text-center text-[10px]">{companyData.company_address}</p>
                <p className="text-center italic">{companyData.receipt_header}</p>
                <hr className="border-dashed border-gray-400" />
                <p>Article exemple............1000 XOF</p>
                <hr className="border-dashed border-gray-400" />
                <p className="font-bold">TOTAL: 1000 XOF</p>
                <hr className="border-dashed border-gray-400" />
                <p className="text-center italic">{companyData.receipt_footer}</p>
              </div>
            </div>

            <Button onClick={handleSaveCompany} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
