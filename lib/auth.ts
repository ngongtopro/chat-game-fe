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
      console.log("No auth token found")
      return null
    }

    // Verify token locally first - không cần gọi API để tránh vấn đề
    const decoded = jwt.verify(token.value, JWT_SECRET) as any
    
    // Trả về mock user data dựa trên token để tránh infinite loop
    return {
      id: decoded.userId || decoded.id,
      username: "User", // Mock data tạm thời
      email: "user@example.com"
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

export function createAuthToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
}
