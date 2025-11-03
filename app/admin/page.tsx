"use client"

import { useEffect, useState } from "react"
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [balanceChange, setBalanceChange] = useState("")
  const [newRoomBet, setNewRoomBet] = useState("10")
  const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsData, usersData, roomsData] = await Promise.all([
        apiClient.get("/api/admin/stats"),
        apiClient.getAllUsers(),
        apiClient.get("/api/admin/caro/rooms"),
      ])
      console.log("Fetched statsData.stats data:", statsData.stats)
      console.log("Fetched usersData.users data:", usersData.users)
      console.log("Fetched roomsData.rooms data:", roomsData.rooms)

      setStats(statsData.stats)
      setUsers(usersData.users)
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

  const handleUpdateUserBalance = async () => {
    if (!selectedUser || !balanceChange) return

    try {
      await apiClient.patch(`/admin/users/${selectedUser.id}`, {
        balanceChange: parseFloat(balanceChange),
      })
      alert("Balance updated successfully")
      setSelectedUser(null)
      setBalanceChange("")
      fetchData()
    } catch (error) {
      console.error("Failed to update balance:", error)
      alert("Failed to update balance")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await apiClient.delete(`/admin/users/${userId}`)
      alert("User deleted successfully")
      fetchData()
    } catch (error) {
      console.error("Failed to delete user:", error)
      alert("Failed to delete user")
    }
  }

  const handleCreateRoom = async () => {
    try {
      const response = await apiClient.post("/admin/caro/rooms", {
        betAmount: parseFloat(newRoomBet),
      })
      alert(`Room created: ${response.room.roomCode}`)
      setShowCreateRoomDialog(false)
      setNewRoomBet("10")
      fetchData()
    } catch (error) {
      console.error("Failed to create room:", error)
      alert("Failed to create room")
    }
  }

  const handleDeleteRoom = async (roomCode: string) => {
    if (!confirm("Are you sure you want to close this room?")) return

    try {
      await apiClient.delete(`/admin/caro/rooms/${roomCode}`)
      alert("Room closed successfully")
      fetchData()
    } catch (error) {
      console.error("Failed to close room:", error)
      alert("Failed to close room")
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.type === "admin" ? "default" : "secondary"}>
                          {user.type}
                        </Badge>
                      </TableCell>
                      <TableCell>${parseFloat(user.balance || "0").toFixed(2)}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Caro Room Management</CardTitle>
                <Button onClick={() => setShowCreateRoomDialog(true)}>
                  <Plus className="mr-2 size-4" />
                  Create Room
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Player 1</TableHead>
                    <TableHead>Player 2</TableHead>
                    <TableHead>Bet Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.roomCode}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            room.status === "playing"
                              ? "default"
                              : room.status === "waiting"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {room.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{room.player1Username}</TableCell>
                      <TableCell>{room.player2Username || "Waiting..."}</TableCell>
                      <TableCell>${parseFloat(room.betAmount).toFixed(2)}</TableCell>
                      <TableCell>{new Date(room.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRoom(room.roomCode)}
                          disabled={room.status === "finished"}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Balance Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Balance</DialogTitle>
            <DialogDescription>
              Adjust balance for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
              <p className="text-2xl font-bold">
                ${parseFloat(selectedUser?.balance || "0").toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">
                Balance Change (+ to add, - to subtract)
              </label>
              <Input
                type="number"
                step="0.01"
                value={balanceChange}
                onChange={(e) => setBalanceChange(e.target.value)}
                placeholder="e.g., 100 or -50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUserBalance}>Update Balance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Room Dialog */}
      <Dialog open={showCreateRoomDialog} onOpenChange={setShowCreateRoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Caro Room</DialogTitle>
            <DialogDescription>Create a new game room as admin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Bet Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                min="1"
                value={newRoomBet}
                onChange={(e) => setNewRoomBet(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRoomDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRoom}>Create Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminRoute>
  )
}
