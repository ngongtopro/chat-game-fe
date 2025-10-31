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
    const token = cookieStore.get("auth-token")

    if (!token) {
      return null
    }

    // Verify token
    const decoded = jwt.verify(token.value, JWT_SECRET) as any
    
    // Lấy thông tin user từ backend API
    const userId = decoded.userId || decoded.id
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    
    const response = await fetch(`${API_URL}/api/auth/user/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token.value}`
      }
    })

    if (!response.ok) {
      return null
    }

    const userData = await response.json()
    
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

export function createAuthToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
}
