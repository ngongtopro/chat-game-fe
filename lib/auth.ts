import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import sql from "@/lib/db"

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
    
    // Lấy thông tin user từ database
    const userId = decoded.userId || decoded.id
    const users = await sql`
      SELECT id, username, email
      FROM users
      WHERE id = ${userId}
    `

    if (users.length === 0) {
      return null
    }

    return {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

export function createAuthToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
}
