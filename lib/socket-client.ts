"use client"

import { io, type Socket } from "socket.io-client"
import { getToken } from "./auth-client"

let socket: Socket | null = null
let isInitialized = false

export function getSocket(): Socket {
  // Return existing socket if already initialized
  if (socket && isInitialized) {
    return socket
  }

  // Initialize socket only once
  if (!isInitialized) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    const token = getToken()
    
    if (!token) {
      console.warn("[Socket] No token found - authentication may fail")
    } else {
      console.log("[Socket] Found token, initializing with authentication")
    }
    
    console.log("[Socket] Initializing socket connection (one-time)")
    
    socket = io(SOCKET_URL, {
      withCredentials: true, // Send cookies with requests
      auth: token ? {
        token: token, // Send token for authentication
      } : {},
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socket.on("connect", () => {
      console.log("[Socket] Successfully connected to server")
    })

    socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message)
    })

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason)
      // Don't reset isInitialized - allow reconnection with same socket instance
    })

    socket.on("force-disconnect", (data: { reason: string }) => {
      console.warn("[Socket] Force disconnected:", data.reason)
      alert(`Bạn đã đăng nhập từ thiết bị/trình duyệt khác. Phiên này sẽ bị ngắt kết nối.\n\nLý do: ${data.reason}`)
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    })

    isInitialized = true
  }

  return socket!
}

export function disconnectSocket() {
  if (socket) {
    console.log("[Socket] Manual disconnect")
    socket.disconnect()
    socket = null
    isInitialized = false
  }
}
