"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TabsContent } from "@/components/ui/tabs"
import { Search, Trash2, Edit } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

interface User {
  id: number
  username: string
  email: string
  type: string
  balance: string
  createdAt: string
}

interface UsersTabProps {
  users: User[]
  searchTerm: string
  onSearchChange: (value: string) => void
  onEditUser: (user: User) => void
  onDeleteUser: (userId: number) => void
  setUsers: (users: User[]) => void
  onUpdateUserSuccess: () => void
}

export function UsersTab({ users, searchTerm, onSearchChange, onEditUser, onDeleteUser, setUsers, onUpdateUserSuccess }: UsersTabProps) {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [balanceChange, setBalanceChange] = useState("")
  const [editUserForm, setEditUserForm] = useState({ username: "", email: "", type: "" })

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const fetchUsers = async () => {
      try {
        const usersData = await apiClient.getAllUsers();
        console.log("Fetched usersData.users data:", usersData.users)
  
        setUsers(usersData.users)
      } catch (error: any) {
        console.error("Failed to fetch admin data:", error)
        if (error.response?.status === 403) {
          alert("Admin access required")
          router.push("/dashboard")
        }
      } finally {
      }
    }
  
  useEffect(() => {
    fetchUsers()
    }, [])  

  const handleEditUserClick = (user: User) => {
    setSelectedUser(user)
    setEditUserForm({
      username: user.username,
      email: user.email,
      type: user.type,
    })
  }

  const handleDeleteUserClick = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await apiClient.deleteUser(userId)
      alert("User deleted successfully")
      fetchUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      alert("Failed to delete user")
    }
  }

  const handleUpdateUserBalance = async () => {
    if (!selectedUser || !balanceChange) return

    try {
      await apiClient.updateBalance(selectedUser.id, balanceChange, {
        username: editUserForm.username || undefined,
        email: editUserForm.email || undefined,
        type: editUserForm.type || undefined,
      })
      onUpdateUserSuccess()
      setSelectedUser(null)
      setBalanceChange("")
      setEditUserForm({ username: "", email: "", type: "" })
      fetchUsers()
    } catch (error) {
      console.error("Failed to update user:", error)
      alert("Failed to update user")
    }
  }

  return (
    <>
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
                    onChange={(e) => onSearchChange(e.target.value)}
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
                        onClick={() => handleEditUserClick(user)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUserClick(user.id)}
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

      {/* Edit User Balance Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update information for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input
                type="text"
                value={editUserForm.username}
                onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                placeholder="Username"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                placeholder="Email"
              />
            </div>
            <div>
              <label className="text-sm font-medium">User Type</label>
              <select
                value={editUserForm.type}
                onChange={(e) => setEditUserForm({ ...editUserForm, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="regular">Regular</option>
                <option value="admin">Admin</option>
              </select>
            </div>
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
            <Button onClick={handleUpdateUserBalance}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
