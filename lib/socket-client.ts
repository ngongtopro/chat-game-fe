"use client"

import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

function getTokenFromCookie(): string | undefined {
  if (typeof document === "undefined") return undefined
  
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1]
  
  return token
}

export function getSocket(): Socket {
  if (!socket || !socket.connected) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    const token = getTokenFromCookie()
    
    if (!token) {
      console.log("[Socket] No token in document.cookie (might be httpOnly cookie, that's OK)")
    } else {
      console.log("[Socket] Found token in cookie")
    }
    
    console.log("[Socket] Initializing socket connection")
    
    socket = io(SOCKET_URL, {
      withCredentials: true, // This sends httpOnly cookies automatically
      auth: token ? {
        token: token, // Send token if available (non-httpOnly)
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
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
