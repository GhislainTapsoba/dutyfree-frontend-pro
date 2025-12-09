"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Bell, Search, User, LogOut, Settings, Globe } from "lucide-react"
import { authService } from "@/lib/api"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { OfflineIndicator } from "@/components/offline/offline-indicator"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user: any
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [currency, setCurrency] = useState("XOF")
  const [mounted, setMounted] = useState(false)
  const [hasToken, setHasToken] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    setHasToken(document.cookie.includes('auth_token='))
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = '/login'
  }

  const currencies = ["XOF", "EUR", "USD"]

  return (
    <header className="h-16 border-b border-border/50 bg-gradient-to-r from-card via-card/95 to-card/90 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher produits, tickets..."
            className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors h-10 rounded-lg"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Currency Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-background/50 border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-all h-10 rounded-lg">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Globe className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold">{currency}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-border/50">
            <DropdownMenuLabel>Devise d'affichage</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {currencies.map((curr) => (
              <DropdownMenuItem
                key={curr}
                onClick={() => setCurrency(curr)}
                className={cn(
                  "cursor-pointer rounded-lg",
                  currency === curr && "bg-primary/10 text-primary font-semibold"
                )}
              >
                {curr}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Offline Status */}
        <OfflineIndicator />

        {/* Notifications */}
        <NotificationCenter />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-3 hover:bg-primary/10 transition-all h-12 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md ring-2 ring-background">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold">{user?.first_name || user?.full_name || "Utilisateur"}</p>
                <p className="text-xs text-muted-foreground font-medium">{user?.roles?.name || user?.role_name || "Caissier"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50">
            <DropdownMenuLabel className="text-base">Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="cursor-pointer rounded-lg py-2">
              <User className="w-4 h-4 mr-2" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer rounded-lg py-2">
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer rounded-lg py-2">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
