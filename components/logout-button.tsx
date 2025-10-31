"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { removeToken } from "@/lib/auth-client"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Xóa token từ cookie
      removeToken()
      
      // Gọi API logout (nếu cần)
      await fetch("/api/auth/logout", {
        method: "POST",
      }).catch(() => {
        // Ignore errors
      })

      // Redirect về trang login
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      // Vẫn redirect về login dù có lỗi
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
