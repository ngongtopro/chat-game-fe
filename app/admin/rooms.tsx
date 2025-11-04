"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useEffect, useState } from "react"

interface Room {
  id: number
  roomCode: string
  status: string
  player1Username: string
  player2Username: string | null
  betAmount: string
  createdAt: string
}

interface RoomsTabProps {
  rooms: Room[]
  onCreateRoom: () => void
  onEditRoom: (room: Room) => void
  onDeleteRoom: (roomCode: string) => void
  setRooms: (rooms: Room[]) => void
  onCreateRoomSuccess: (roomCode: string) => void
  onUpdateRoomSuccess: () => void
}

export function RoomsTab({ rooms, onCreateRoom, onEditRoom, onDeleteRoom, setRooms, onCreateRoomSuccess, onUpdateRoomSuccess }: RoomsTabProps) {
  const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false)
  const [newRoomBet, setNewRoomBet] = useState("10")
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [editRoomBetAmount, setEditRoomBetAmount] = useState("")

  const fetchCaroRooms = async () => {
    try {
      const roomsData = await apiClient.getCaroRooms()
      setRooms(roomsData.rooms)
    } catch (error: any) {
      console.error("Failed to fetch caro rooms:", error)
    }
  }

  useEffect(() => {
    fetchCaroRooms()
  }, [])

  const handleCreateRoomClick = () => {
    setShowCreateRoomDialog(true)
  }

  const handleCreateRoomSubmit = async () => {
    try {
      const response = await apiClient.createRoom(newRoomBet)
      onCreateRoomSuccess(`Room created: ${response.room.roomCode}`)
      setShowCreateRoomDialog(false)
      setNewRoomBet("10")
      fetchCaroRooms()
    } catch (error) {
      console.error("Failed to create room:", error)
      alert("Failed to create room")
    }
  }

  const handleEditRoomClick = (room: Room) => {
    setSelectedRoom(room)
    setEditRoomBetAmount(room.betAmount)
  }

  const handleUpdateRoomSubmit = async () => {
    if (!selectedRoom || !editRoomBetAmount) return

    try {
      await apiClient.updateRoomBet(selectedRoom.roomCode, editRoomBetAmount)
      onUpdateRoomSuccess()
      setSelectedRoom(null)
      setEditRoomBetAmount("")
      fetchCaroRooms()
    } catch (error) {
      console.error("Failed to update room:", error)
      alert("Failed to update room")
    }
  }

  const handleDeleteRoomClick = async (roomCode: string) => {
    if (!confirm("Are you sure you want to close this room?")) return

    try {
      await apiClient.deleteCaroRoom(roomCode)
      alert("Room closed successfully")
      fetchCaroRooms()
    } catch (error) {
      console.error("Failed to close room:", error)
      alert("Failed to close room")
    }
  }

  return (
    <>
      <TabsContent value="rooms" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Caro Room Management</CardTitle>
              <Button onClick={handleCreateRoomClick}>
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
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditRoomClick(room)}
                        disabled={room.status === "finished"}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRoomClick(room.roomCode)}
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
            <Button onClick={handleCreateRoomSubmit}>Create Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update room settings for {selectedRoom?.roomCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Room Status</p>
              <Badge
                variant={
                  selectedRoom?.status === "playing"
                    ? "default"
                    : selectedRoom?.status === "waiting"
                      ? "secondary"
                      : "outline"
                }
              >
                {selectedRoom?.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Bet Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                min="1"
                value={editRoomBetAmount}
                onChange={(e) => setEditRoomBetAmount(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRoom(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRoomSubmit}>Update Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
