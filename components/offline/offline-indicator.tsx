"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function OfflineIndicator() {
  const [status, setStatus] = useState({ isOnline: true, queueLength: 0, deviceId: '' })
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const updateStatus = async () => {
      const { offlineManager } = await import('@/lib/offline/offline-manager')
      setStatus(offlineManager.getStatus())
    }
    updateStatus()
    const interval = setInterval(updateStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    const { offlineManager } = await import('@/lib/offline/offline-manager')
    await offlineManager.syncQueue()
    setStatus(offlineManager.getStatus())
    setSyncing(false)
  }

  if (status.isOnline && status.queueLength === 0) {
    return (
      <Badge variant="outline" className="gap-1">
        <Wifi className="h-3 w-3 text-green-600" />
        <span className="text-xs">En ligne</span>
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={status.isOnline ? "default" : "destructive"} className="gap-1">
        {status.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        <span className="text-xs">{status.isOnline ? 'En ligne' : 'Hors ligne'}</span>
      </Badge>
      {status.queueLength > 0 && (
        <>
          <Badge variant="secondary" className="text-xs">{status.queueLength} en attente</Badge>
          {status.isOnline && (
            <Button size="sm" variant="ghost" onClick={handleSync} disabled={syncing} className="h-6 px-2">
              <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </>
      )}
    </div>
  )
}
