"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { apiClient } from "@/lib/api-client"
import { getSocket } from "@/lib/socket-client"

interface Room {
  gameId: number
  roomCode: string
  player1Username: string
  betAmount: number
}

export function CaroLobby() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [betAmount, setBetAmount] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchRooms = async () => {
    try {
      const data = await apiClient.getRooms()
      console.log("Fetched rooms:", data.rooms)
      setRooms(data.rooms || [])
    } catch (error) {
      console.error("[v0] Fetch rooms error:", error)
    }
  }

  useEffect(() => {
    fetchRooms()

    // Join caro lobby socket room
    const socket = getSocket()
    socket.emit("caro:join-lobby")
    console.log("[Caro] Joined lobby")

    // Listen for new rooms
    socket.on("caro:room-created", (room: Room) => {
      console.log("[Caro] New room created:", room)
      setRooms(prev => [room, ...prev])
    })

    // Listen for room started (remove from list)
    socket.on("caro:room-started", (data: { roomCode: string }) => {
      console.log("[Caro] Room started:", data.roomCode)
      setRooms(prev => prev.filter(r => r.roomCode !== data.roomCode))
    })

    return () => {
      socket.emit("caro:leave-lobby")
      socket.off("caro:room-created")
      socket.off("caro:room-started")
      console.log("[Caro] Left lobby")
    }
  }, [])

  const handleJoinRoom = async (roomCode: string) => {
    setLoading(true)
    try {
      await apiClient.joinRoom(roomCode)

      router.push(`/caro/room/${roomCode}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to join room")
      console.error("[v0] Join room error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {/* Create Room button removed - Admin only feature */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            💡 Rooms are now created by admins. Join available rooms below or use a room code.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Join with Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-code">Room Code</Label>
                <Input
                  id="room-code"
                  placeholder="Enter room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                />
              </div>
              <Button onClick={() => handleJoinRoom(joinCode)} className="w-full" disabled={loading || !joinCode}>
                {loading ? "Joining..." : "Join Room"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Available Rooms</h3>
        {rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rooms available. Create one to start playing!</p>
        ) : (
          <div className="grid gap-3">
            {rooms.map((room) => (
              <Card key={room.roomCode}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Users className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Room: {room.gameId}</p>
                      <p className="text-sm text-muted-foreground">
                        Host: {room.player1Username} • Bet: ${room.betAmount}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleJoinRoom(room.roomCode)} disabled={loading}>
                    Join
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
