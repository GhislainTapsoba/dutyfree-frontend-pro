// ClientLayout.tsx (Client Component)
"use client"
import { useEffect } from "react"
import { api } from '../lib/api/client'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      api.setToken(token)
      console.log("[ClientLayout] Token réinjecté depuis localStorage")
    }
  }, [])

  return <>{children}</>
}
