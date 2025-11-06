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

    // Phần quản lý chat
    async getChatMessages(friendId: number) {
        return await apiRequest(`/api/chat/messages?friendId=${friendId}`, {
            method: "GET",
        })
    }

    async markMessagesAsRead(friendId: number) {
        return await apiRequest("/api/chat/mark-read", {
            method: "POST",
            body: JSON.stringify({ friendId }),
        })
    }

    async getOnlineUsers() {
        return await apiRequest("/api/chat/online-users", {
            method: "GET",
        })
    }

    async sendMessage(receiverId: number, message: string) {
        return await apiRequest("/api/chat/send", {
            method: "POST",
            body: JSON.stringify({ receiverId: receiverId, message: message }),
        })
    }

    async getConversations() {
        return await apiRequest("/api/chat/conversations", {
            method: "GET",
        })
    }

    // Quản lý ví
    async getWalletBalance() {
        return await apiRequest("/api/wallet/balance", {
            method: "GET",
        })
    }

    async deposit(amount: number, source: string) {
        return await apiRequest("/api/wallet/deposit", {
            method: "POST",
            body: JSON.stringify({ amount, source: source }),
        })
    }

    async withdraw(amount: number) {
        return await apiRequest("/api/wallet/withdraw", {
            method: "POST",
            body: JSON.stringify({ amount }),
        })
    }

    async getTransactions() {
        return await apiRequest("/api/wallet/transactions", {
            method: "GET",
        })
    }

    // Admin-specific methods
    async getAllUsers(page = 1, limit = 20, search = "") {
        const params = new URLSearchParams({ 
            page: page.toString(), 
            limit: limit.toString(),
            search 
        })
        return await apiRequest(`/api/admin/users?${params}`, {
            method: "GET",
        })
    }

    async deleteUser(userId: number) {
        return await apiRequest(`/api/admin/users/${userId}`, {
            method: "DELETE",
        })
    }

    async getDashboardStats() {
        return await apiRequest("/api/admin/stats", {
            method: "GET",
        })
    }

    async getCaroRooms() {
        return await apiRequest("/api/admin/caro/rooms", {
            method: "GET",
        })
    }

    async deleteCaroRoom(roomCode: string) {
        return await apiRequest(`/api/admin/caro/rooms/${roomCode}`, {
            method: "DELETE",
        })
    }
    
    async createRoom(amount: string, maxUsers: number) {
        return await apiRequest("/api/admin/caro/rooms", {
            method: "POST",
            body: JSON.stringify({ betAmount: amount, maxUsers: maxUsers }),
        })
    }

    async updateRoomBet(roomCode: string, newBetAmount: string) {
        return await apiRequest(`/api/admin/caro/rooms/${roomCode}`, {
            method: "PATCH",
            body: JSON.stringify({ betAmount: newBetAmount }),
        })
    }

    async updateBalance(userId: number, balanceChange: string, editUserForm: { username?: string; email?: string; type?: string }) {
        return await apiRequest(`/api/admin/users/${userId}`, {
            method: "PATCH",
            body: JSON.stringify({
                                balanceChange: parseFloat(balanceChange),
                                username: editUserForm.username || undefined,
                                email: editUserForm.email || undefined,
                                type: editUserForm.type || undefined,
                                }),
        })
    }

    // Generic methods for flexibility
    private async get(endpoint: string) {
        return await apiRequest(endpoint, {
            method: "GET",
        })
    }

    private async post(endpoint: string, data?: any) {
        return await apiRequest(endpoint, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    private async patch(endpoint: string, data?: any) {
        return await apiRequest(endpoint, {
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    private async delete(endpoint: string) {
        return await apiRequest(endpoint, {
            method: "DELETE",
        })
    }
}

export const apiClient = new ApiClient()