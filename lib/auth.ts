import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this"

export interface AuthUser {
  id: number
  username: string
  email: string
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token") // Backend uses "token" not "auth-token"

    if (!token) {
      console.log("No auth token found")
      return null
    }

    try {
      // Verify token locally
      const decoded = jwt.verify(token.value, JWT_SECRET) as any
      
      // Nếu token hợp lệ, gọi API để lấy thông tin user
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Cookie': `token=${token.value}`
        },
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        return data.user
      }
      
      // Nếu API fail, trả về null
      console.log("Failed to fetch user from API")
      return null
      
    } catch (jwtError) {
      // Token không hợp lệ hoặc expired
      console.log("Invalid token:", jwtError instanceof Error ? jwtError.message : "Unknown error")
      return null
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

export function createAuthToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
}
