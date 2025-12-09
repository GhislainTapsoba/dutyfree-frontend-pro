"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plane, ScanBarcode, CreditCard } from "lucide-react"

interface PassengerInfoModalProps {
  onClose: () => void
  onSave: (info: any) => void
}

export function PassengerInfoModal({ onClose, onSave }: PassengerInfoModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    flight: "",
    destination: "",
    airline: "",
    seat: "",
  })
  const [guestCard, setGuestCard] = useState<any>(null)
  const [cardNumber, setCardNumber] = useState("")
  const [scanning, setScanning] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.flight) {
      onSave({ ...formData, guestCard })
    }
  }

  const handleScanGuestCard = async () => {
    if (!cardNumber) return
    setScanning(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const res = await fetch(`${apiUrl}/guest-cards?card_number=${cardNumber}`)
      const { data } = await res.json()
      if (data) {
        setGuestCard(data)
        setFormData({ ...formData, name: data.guest_name })
      } else {
        alert('Carte non trouvée')
      }
    } catch (error) {
      alert('Erreur lors du scan')
    } finally {
      setScanning(false)
    }
  }

  const handleScanBoardingPass = () => {
    // Simulated boarding pass scan
    setFormData({
      name: "DUPONT/JEAN",
      flight: "AF 756",
      destination: "PARIS CDG",
      airline: "Air France",
      seat: "12A",
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            Informations passager
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Guest Card Scan */}
          <div className="space-y-2">
            <Label>Badge Client Hébergé</Label>
            <div className="flex gap-2">
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Numéro de badge"
                className="bg-secondary"
              />
              <Button type="button" onClick={handleScanGuestCard} disabled={scanning}>
                <CreditCard className="w-4 h-4" />
              </Button>
            </div>
            {guestCard && (
              <p className="text-sm text-green-600">
                ✓ Remise {guestCard.discount_percentage}% appliquée
              </p>
            )}
          </div>

          {/* Scan Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 gap-2 bg-transparent"
            onClick={handleScanBoardingPass}
          >
            <ScanBarcode className="w-5 h-5" />
            Scanner la carte d'embarquement
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou saisir manuellement</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom du passager *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="NOM/PRENOM"
              className="bg-secondary border-border"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flight">N° de vol *</Label>
              <Input
                id="flight"
                value={formData.flight}
                onChange={(e) => setFormData({ ...formData, flight: e.target.value })}
                placeholder="AF 756"
                className="bg-secondary border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seat">Siège</Label>
              <Input
                id="seat"
                value={formData.seat}
                onChange={(e) => setFormData({ ...formData, seat: e.target.value })}
                placeholder="12A"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="airline">Compagnie aérienne</Label>
            <Input
              id="airline"
              value={formData.airline}
              onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
              placeholder="Air France"
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="PARIS CDG"
              className="bg-secondary border-border"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
