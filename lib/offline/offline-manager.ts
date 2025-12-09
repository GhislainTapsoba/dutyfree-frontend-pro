"use client"

interface QueuedRequest {
  id: string
  endpoint: string
  method: string
  body: any
  timestamp: number
  retries: number
}

class OfflineManager {
  private queue: QueuedRequest[] = []
  private isOnline: boolean = true
  private deviceId: string = ''
  private syncInProgress: boolean = false
  private checkInterval: NodeJS.Timeout | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.deviceId = this.getDeviceId()
      this.checkConnection()
      this.loadQueue()
      this.setupListeners()
      this.startPeriodicCheck()
    }
  }

  private getDeviceId(): string {
    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('device_id', deviceId)
    }
    return deviceId
  }

  private async checkConnection() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/health`, { 
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000)
      })
      const wasOffline = !this.isOnline
      this.isOnline = response.ok
      if (wasOffline && this.isOnline) {
        console.log('[Offline] Connexion rétablie')
        this.syncQueue()
      }
    } catch {
      const wasOnline = this.isOnline
      this.isOnline = false
      if (wasOnline) {
        console.log('[Offline] Connexion perdue')
      }
    }
  }

  private startPeriodicCheck() {
    this.checkInterval = setInterval(() => this.checkConnection(), 5000)
  }

  private setupListeners() {
    window.addEventListener('online', () => this.checkConnection())
    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('[Offline] Connexion perdue')
    })
  }

  private loadQueue() {
    const saved = localStorage.getItem('offline_queue')
    if (saved) {
      this.queue = JSON.parse(saved)
    }
  }

  private saveQueue() {
    localStorage.setItem('offline_queue', JSON.stringify(this.queue))
  }

  async addToQueue(endpoint: string, method: string, body: any): Promise<string> {
    const request: QueuedRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      method,
      body: { ...body, device_id: this.deviceId, offline_created_at: new Date().toISOString() },
      timestamp: Date.now(),
      retries: 0
    }
    this.queue.push(request)
    this.saveQueue()
    return request.id
  }

  async syncQueue() {
    if (this.syncInProgress || !this.isOnline || this.queue.length === 0) return

    this.syncInProgress = true
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

    for (let i = this.queue.length - 1; i >= 0; i--) {
      const request = this.queue[i]
      try {
        const response = await fetch(`${apiUrl}${request.endpoint}`, {
          method: request.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.body)
        })
        if (response.ok) {
          this.queue.splice(i, 1)
        } else {
          request.retries++
          if (request.retries >= 3) this.queue.splice(i, 1)
        }
      } catch (error) {
        request.retries++
      }
    }
    this.saveQueue()
    this.syncInProgress = false
  }

  getStatus() {
    return { isOnline: this.isOnline, queueLength: this.queue.length, deviceId: this.deviceId }
  }

  destroy() {
    if (this.checkInterval) clearInterval(this.checkInterval)
  }
}

export const offlineManager = new OfflineManager()
