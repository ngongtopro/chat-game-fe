import { getToken } from "./auth-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Lấy token từ cookie nếu có
  const token = getToken()
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  // Thêm Authorization header nếu có token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  // Merge với headers từ options
  if (options.headers) {
    Object.assign(headers, options.headers)
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || "Request failed")
  }

  return response.json()
}
