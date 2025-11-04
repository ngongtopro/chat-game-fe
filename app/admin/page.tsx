"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, DollarSign, GamepadIcon, Plus, Search, Trash2, Edit } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { AdminRoute } from "@/components/admin-route"
import { UsersTab } from "./users"
import { RoomsTab } from "./rooms"

interface User {
  id: number
  username: string
  email: string
  type: string
  balance: string
  createdAt: string
}

interface Room {
  id: number
  roomCode: string
  status: string
  player1Username: string
  player2Username: string | null
  betAmount: string
  createdAt: string
}

interface Stats {
  totalUsers: number
  activeGames: number
  waitingRooms: number
  totalBalance: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsData, roomsData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getCaroRooms(),
      ])
      console.log("Fetched statsData.stats data:", statsData.stats)
      console.log("Fetched roomsData.rooms data:", roomsData.rooms)

      setStats(statsData.stats)
      setRooms(roomsData.rooms)
    } catch (error: any) {
      console.error("Failed to fetch admin data:", error)
      if (error.response?.status === 403) {
        alert("Admin access required")
        router.push("/dashboard")
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AdminRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Games</CardTitle>
            <GamepadIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeGames || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting Rooms</CardTitle>
            <GamepadIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.waitingRooms || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalBalance.toFixed(2) || "0.00"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different management sections */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="rooms">Caro Rooms</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <UsersTab
          users={users}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEditUser={() => {}}
          onDeleteUser={() => {}}
          setUsers={setUsers}
          onUpdateUserSuccess={() => alert("User updated successfully")}
        />

        {/* Rooms Tab */}
        <RoomsTab
          rooms={rooms}
          onCreateRoom={() => {}}
          onEditRoom={() => {}}
          onDeleteRoom={() => {}}
          setRooms={setRooms}
          onCreateRoomSuccess={(message) => alert(message)}
          onUpdateRoomSuccess={() => alert("Room updated successfully")}
        />
      </Tabs>
      </div>
    </AdminRoute>
  )
}
