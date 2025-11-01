"use client"

import { useEffect, useState } from "react"
import { getToken } from "@/lib/auth-client"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      console.log("[ProtectedRoute] No token found")
      setIsAuthenticated(false)
      // Middleware will handle the redirect
      return
    }
    console.log("[ProtectedRoute] Token found, rendering protected content")
    setIsAuthenticated(true)
  }, [])

  // Don't render anything while checking or if not authenticated
  // Middleware will redirect to login
  if (isAuthenticated === null || isAuthenticated === false) {
    return null
  }

  return <>{children}</>
}
