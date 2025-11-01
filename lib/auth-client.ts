import Cookies from "js-cookie"

export interface AuthUser {
  id: number
  username: string
  email: string
}

/**
 * Kiểm tra xem user có đang đăng nhập không (client-side)
 */
export function isAuthenticated(): boolean {
  return !!Cookies.get("token")
}

/**
 * Lấy token từ cookie (client-side)
 */
export function getToken(): string | undefined {
  return Cookies.get("token")
}

/**
 * Lưu token vào cookie (client-side)
 */
export function setToken(token: string, expiresInDays: number = 7): void {
  Cookies.set("token", token, {
    expires: expiresInDays,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

/**
 * Xóa token khỏi cookie (client-side)
 */
export function removeToken(): void {
  Cookies.remove("token", { path: "/" })
}

/**
 * Get auth user from API (client-side, uses cookies automatically)
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include', // Include cookies in the request
      cache: 'no-store'
    })

    if (response.ok) {
      const data = await response.json()
      return data.user
    }

    return null
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}
