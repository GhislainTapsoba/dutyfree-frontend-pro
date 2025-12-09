"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface OpenSessionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function OpenSessionModal({ open, onClose, onSuccess }: OpenSessionModalProps) {
  const [loading, setLoading] = useState(false)
  const [cashRegisters, setCashRegisters] = useState<any[]>([])
  const [selectedRegister, setSelectedRegister] = useState("")
  const [openingCash, setOpeningCash] = useState("")
  const [userId, setUserId] = useState("")

  useEffect(() => {
    if (open) {
      console.log('Modal opened, loading data...')
      loadData()
    }
  }, [open])

  const loadData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      
      // Récupérer l'utilisateur depuis localStorage
      const userDataStr = localStorage.getItem('user_data')
      console.log('[OpenSessionModal] user_data:', userDataStr)
      if (userDataStr) {
        const userData = JSON.parse(userDataStr)
        console.log('[OpenSessionModal] Parsed userData:', userData)
        setUserId(userData?.id || "")
        
        // Filtrer par point de vente si assigné
        const posId = userData?.pointOfSaleId
        const url = posId 
          ? `${apiUrl}/cash-registers?pos_id=${posId}&is_active=true`
          : `${apiUrl}/cash-registers?is_active=true`
        
        console.log('[OpenSessionModal] POS ID:', posId)
        console.log('[OpenSessionModal] Loading registers with URL:', url)
        const registersRes = await fetch(url)
        const { data: registers } = await registersRes.json()
        console.log('[OpenSessionModal] Registers loaded:', registers)
        setCashRegisters(registers || [])
      }
    } catch (error) {
      console.error('[OpenSessionModal] Error loading data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRegister || !openingCash) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const res = await fetch(`${apiUrl}/cash-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cash_register_id: selectedRegister,
          user_id: userId,
          opening_cash: parseFloat(openingCash)
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur lors de l'ouverture")
      }

      toast.success("Session ouverte avec succès")
      onSuccess()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ouvrir une Session de Caisse</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Caisse</Label>
            <Select value={selectedRegister} onValueChange={setSelectedRegister}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une caisse" />
              </SelectTrigger>
              <SelectContent>
                {cashRegisters.map((register) => (
                  <SelectItem key={register.id} value={register.id}>
                    {register.name} ({register.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Fond de Caisse (FCFA)</Label>
            <Input
              type="number"
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              placeholder="50000"
              min="0"
              step="100"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ouvrir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
