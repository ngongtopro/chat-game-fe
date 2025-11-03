"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = () => {
      try {
        // Check if user is logged in
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1]

        if (!token) {
          router.push("/login")
          return
        }

        // Check if user is admin
        const userData = localStorage.getItem("user")
        if (!userData) {
          router.push("/dashboard")
          return
        }

        const user = JSON.parse(userData)
        if (user.type !== "admin") {
          alert("Admin access required")
          router.push("/dashboard")
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
