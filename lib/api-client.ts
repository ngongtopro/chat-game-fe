import { getToken } from "./auth-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

async function apiRequest(endpoint: string, options: RequestInit = {}) {
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

class ApiClient {
    // Phần xác thực người dùng
    async login(username: string, password: string) {
        return await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        })
    }

    async register(username: string, email: string, password: string) {
        return await apiRequest("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ username, email, password }),
        })
    }

    async logout() {
        return await apiRequest("/api/auth/logout", {
            method: "POST",
        })
    }
    
    // Phần quản lý phòng chơi Caro
    async getRooms() {
        return await apiRequest("/api/caro/rooms", {
            method: "GET",
        })
    }

    async getRoom(roomCode: string) {
        return await apiRequest(`/api/caro/room/${roomCode}`, {
            method: "GET",
        })
    }

    async createRoom(amount: string) {
        return await apiRequest("/api/caro/create-room", {
            method: "POST",
            body: JSON.stringify({ betAmount: amount }),
        })
    }

    async joinRoom(roomCode: string) {
        return await apiRequest("/api/caro/join-room", {
            method: "POST",
            body: JSON.stringify({ roomCode }),
        })
    }

    // Phần chơi Caro
    async makeMove(roomCode: string, x: number, y: number, player: number) {
        return await apiRequest("/api/caro/move", {
            method: "POST",
            body: JSON.stringify({ roomCode, x, y, player: player }),
        })
    }
}

export const apiClient = new ApiClient()