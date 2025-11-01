"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { getSocket } from "@/lib/socket-client"
import { getToken } from "@/lib/auth-client"

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Allow access to public pages without initializing socket
    const publicPaths = ["/login", "/register", "/"]
    const isPublicPath = pathname ? publicPaths.includes(pathname) : false

    // Only initialize socket if user has token
    const token = getToken()
    
    if (token) {
      // User is logged in, initialize socket
      console.log("[SocketProvider] User is logged in, initializing socket connection")
      const socket = getSocket()
    } else if (!isPublicPath) {
      // User not logged in on protected page - middleware will handle redirect
      console.log("[SocketProvider] No token found on protected page - middleware will redirect")
    }

    // Socket will stay connected for entire session
    return () => {
      console.log("[SocketProvider] Component unmounting but keeping socket alive")
    }
  }, [pathname])

  return <>{children}</>
}
