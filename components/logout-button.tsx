"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { removeToken } from "@/lib/auth-client"
import { disconnectSocket } from "@/lib/socket-client"
import { apiClient } from "@/lib/api-client"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Disconnect socket first
      disconnectSocket()
      
      // Call logout API to clear backend cookie
      await apiClient.logout().catch(err => {
        console.error("Logout API error:", err)
      })
      
      // Remove client-side token
      removeToken()

      // Redirect to login
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      // Still redirect even on error
      router.push("/login")
    }
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Đăng xuất
    </Button>
  )
}
