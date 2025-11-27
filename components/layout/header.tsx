"use client"

import { useState } from "react"
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

interface HeaderProps {
  user: any
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [currency, setCurrency] = useState("XOF")

  const handleLogout = async () => {
    await authService.logout()
    router.push("/login")
    router.refresh()
  }

  const currencies = ["XOF", "EUR", "USD"]

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher produits, tickets..." className="pl-10 bg-secondary border-border" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Currency Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Globe className="w-4 h-4" />
              {currency}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Devise d'affichage</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {currencies.map((curr) => (
              <DropdownMenuItem
                key={curr}
                onClick={() => setCurrency(curr)}
                className={currency === curr ? "bg-accent" : ""}
              >
                {curr}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{user?.first_name || "Utilisateur"}</p>
                <p className="text-xs text-muted-foreground">{user?.roles?.name || "Caissier"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
