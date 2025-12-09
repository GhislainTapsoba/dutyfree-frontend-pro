"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, DoorOpen, DoorClosed } from "lucide-react"
import { OpenSessionModal } from "@/components/cash-session/open-session-modal"
import { CloseSessionModal } from "@/components/cash-session/close-session-modal"

export default function CashSessionPage() {
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showOpenModal, setShowOpenModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)

  useEffect(() => {
    loadCurrentSession()
  }, [])

  const loadCurrentSession = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const userData = localStorage.getItem('user_data')
      const user = userData ? JSON.parse(userData) : null
      
      if (user?.id) {
        const res = await fetch(`${apiUrl}/cash-sessions/current?user_id=${user.id}`)
        const { data } = await res.json()
        setCurrentSession(data)
      }
    } catch (error) {
      console.error("Error loading session:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion de Caisse</h1>
        {currentSession ? (
          <Badge variant="default" className="text-lg px-4 py-2">Session Ouverte</Badge>
        ) : (
          <Badge variant="secondary" className="text-lg px-4 py-2">Aucune Session</Badge>
        )}
      </div>

      {!currentSession ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5" />
              Ouvrir une Session de Caisse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Vous devez ouvrir une session de caisse avant de pouvoir effectuer des ventes.
            </p>
            <Button onClick={() => setShowOpenModal(true)} size="lg">
              <DoorOpen className="mr-2 h-5 w-5" />
              Ouvrir ma Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Session Active</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Numéro de Session</p>
                <p className="text-lg font-semibold">{currentSession.session_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Caisse</p>
                <p className="text-lg font-semibold">{currentSession.cash_register?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vacation</p>
                <Badge>
                  {currentSession.vacation_type === "morning" && "Matin (6h-14h)"}
                  {currentSession.vacation_type === "afternoon" && "Après-midi (14h-22h)"}
                  {currentSession.vacation_type === "night" && "Nuit (22h-6h)"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ouverture</p>
                <p className="text-lg">{new Date(currentSession.opening_time).toLocaleString("fr-FR")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fond de Caisse</p>
                <p className="text-lg font-semibold">{currentSession.opening_cash?.toLocaleString()} FCFA</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setShowCloseModal(true)} 
                variant="destructive" 
                size="lg"
                className="w-full"
              >
                <DoorClosed className="mr-2 h-5 w-5" />
                Fermer la Session
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <OpenSessionModal 
        open={showOpenModal} 
        onClose={() => setShowOpenModal(false)}
        onSuccess={() => {
          setShowOpenModal(false)
          loadCurrentSession()
        }}
      />

      <CloseSessionModal 
        open={showCloseModal} 
        onClose={() => setShowCloseModal(false)}
        session={currentSession}
        onSuccess={() => {
          setShowCloseModal(false)
          loadCurrentSession()
        }}
      />
    </div>
  )
}
