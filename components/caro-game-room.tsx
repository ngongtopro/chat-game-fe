"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, Trophy, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CaroBoard } from "./caro-board"
import { RoomChat } from "./room-chat"
import { PlayerStatsTooltip } from "./player-stats-tooltip"
import { getSocket } from "@/lib/socket-client"
import { apiClient } from "@/lib/api-client"

interface RoomData {
  id: number
  room_code: string
  player1_id: number
  player2_id?: number
  player1_ready?: boolean
  player2_ready?: boolean
  bet_amount: number
  status: string
  winner_id?: number
  board_state: string
  current_turn: number
  player1_username: string
  player2_username?: string
  player1_games: number
  player1_wins: number
  player1_level: number
  player2_games?: number
  player2_wins?: number
  player2_level?: number
}

interface CaroGameRoomProps {
  roomCode: string
  currentUserId: number
  currentUsername: string
}

export function CaroGameRoom({ roomCode, currentUserId, currentUsername }: CaroGameRoomProps) {
  const router = useRouter()
  const [room, setRoom] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set())

  const fetchRoom = async () => {
    try {
      const data = await apiClient.getRoom(roomCode)
      setRoom(data.room)
    } catch (error) {
      console.error("[v0] Fetch room error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoom()

    // Join room socket
    const socket = getSocket()
    socket.emit("caro:join-room", roomCode)
    console.log(`[Caro] Joined room ${roomCode}`)

    // Listen for room updates (player joined or left)
    socket.on("caro:room-updated", (updatedRoom: RoomData) => {
      console.log("[Caro] Room updated:", updatedRoom)
      console.log("[Caro] Player 1:", updatedRoom.player1_username, "ID:", updatedRoom.player1_id)
      console.log("[Caro] Player 2:", updatedRoom.player2_username, "ID:", updatedRoom.player2_id)
      console.log("[Caro] Ready status - P1:", updatedRoom.player1_ready, "P2:", updatedRoom.player2_ready)
      setRoom(updatedRoom)
      
      // Reset ready state if player 2 left (player2_id becomes null)
      if (!updatedRoom.player2_id) {
        setIsReady(false)
        console.log("[Caro] Player 2 left, resetting ready status")
      }
    })

    // Listen for online users in room
    socket.on("caro:room-users-online", (data: { userIds: number[] }) => {
      console.log("[Caro] Online users in room:", data.userIds)
      setOnlineUsers(new Set(data.userIds))
    })

    socket.on("caro:user-online", (data: { userId: number }) => {
      console.log("[Caro] User came online:", data.userId)
      setOnlineUsers(prev => new Set([...prev, data.userId]))
    })

    socket.on("caro:user-offline", (data: { userId: number }) => {
      console.log("[Caro] User went offline:", data.userId)
      setOnlineUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(data.userId)
        return newSet
      })
    })

    // Listen for player ready
    socket.on("caro:player-ready", (data: { playerId: number, player1Ready: boolean, player2Ready: boolean }) => {
      console.log("[Caro] Player ready:", data)
      setRoom(prev => {
        if (!prev) return prev
        return {
          ...prev,
          player1_ready: data.player1Ready,
          player2_ready: data.player2Ready
        }
      })
      if (data.playerId === currentUserId) {
        setIsReady(true)
      }
    })

    // Listen for game started
    socket.on("caro:game-started", (updatedRoom: RoomData) => {
      console.log("[Caro] Game started:", updatedRoom)
      setRoom(updatedRoom)
    })

    // Listen for room closed (host left)
    socket.on("caro:room-closed", (data: { reason: string }) => {
      console.log("[Caro] Room closed:", data)
      alert("Host has left the room. Returning to lobby...")
      router.push("/caro")
    })

    // Listen for player left (during game - forfeit)
    socket.on("caro:player-left", (data: { playerId: number, winner: number, winnings: number, reason: string }) => {
      console.log("[Caro] Player left:", data)
      const playerNumber = room?.player1_id === currentUserId ? 1 : 2
      setTimeout(() => {
        alert(
          `Opponent forfeited! You won! ${data.winnings ? `Earned $${data.winnings.toFixed(2)}` : ""}`
        )
        router.push("/caro")
      }, 500)
    })

    // Listen for moves
    socket.on("caro:move-made", (data: { x: number, y: number, player: number, board: any }) => {
      console.log("[Caro] Move made:", data)
      setRoom(prev => {
        if (!prev) return prev
        return {
          ...prev,
          board_state: JSON.stringify(data.board),
          current_turn: prev.current_turn === 1 ? 2 : 1
        }
      })
    })

    // Listen for game finished
    socket.on("caro:game-finished", (data: { winner: number, winnings?: number }) => {
      console.log("[Caro] Game finished:", data)
      const playerNumber = room?.player1_id === currentUserId ? 1 : 2
      setTimeout(() => {
        alert(
          `Game finished! ${data.winner === playerNumber ? "You won!" : "You lost!"} ${data.winnings ? `Earned $${data.winnings.toFixed(2)}` : ""}`
        )
        router.push("/caro")
      }, 500)
    })

    return () => {
      socket.emit("caro:leave-room", roomCode)
      socket.off("caro:room-updated")
      socket.off("caro:room-users-online")
      socket.off("caro:user-online")
      socket.off("caro:user-offline")
      socket.off("caro:player-ready")
      socket.off("caro:game-started")
      socket.off("caro:room-closed")
      socket.off("caro:player-left")
      socket.off("caro:move-made")
      socket.off("caro:game-finished")
      console.log(`[Caro] Left room ${roomCode}`)
    }
  }, [roomCode])

  const handleMove = async (x: number, y: number) => {
    // Not needed anymore, handled in CaroBoard
  }

  const handleReady = () => {
    const socket = getSocket()
    socket.emit("caro:player-ready", { roomCode })
    console.log("[Caro] Player ready")
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    alert("Room code copied!")
  }

  if (loading) {
    return <div className="text-center p-8">Loading room...</div>
  }

  if (!room) {
    return <div className="text-center p-8">Room not found</div>
  }

  const playerNumber = room.player1_id === currentUserId ? 1 : room.player2_id === currentUserId ? 2 : 0
  const boardState = room.board_state || {}
  const bothPlayersPresent = room.player1_id && room.player2_id
  const waitingForReady = bothPlayersPresent && room.status === "waiting"
  const canReady = waitingForReady && !isReady

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Caro Game</h1>
        <div className="ml-auto">
          <Button variant="outline" onClick={copyRoomCode}>
            <Copy className="mr-2 size-4" />
            {roomCode}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Game Board</span>
                {room.status === "waiting" && !bothPlayersPresent && (
                  <span className="text-sm text-muted-foreground">Đợi người chơi thứ 2...</span>
                )}
                {waitingForReady && (
                  <span className="text-sm text-muted-foreground">
                    Waiting for players to ready up... ({(room.player1_ready ? 1 : 0) + (room.player2_ready ? 1 : 0)}/2)
                  </span>
                )}
                {room.status === "playing" && (
                  <span className="text-sm">
                    {room.current_turn === playerNumber ? "Lượt của bạn" : "Lượt của đối thủ"}
                  </span>
                )}
                {room.status === "finished" && (
                  <span className="flex items-center gap-2 text-sm">
                    <Trophy className="size-4 text-yellow-500" />
                    Trò chơi đã kết thúc
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {room.status === "waiting" ? (
                <div className="text-center p-12 text-muted-foreground">Waiting for another player to join...</div>
              ) : waitingForReady ? (
                <div className="text-center p-12 space-y-4">
                  <p className="text-muted-foreground">Cả 2 người chơi đã tham gia!</p>
                  <p className="text-sm text-muted-foreground">
                    Nhấn "Sẵn sàng" để bắt đầu trò chơi.
                  </p>
                  <Button 
                    onClick={handleReady} 
                    disabled={!canReady}
                    variant={isReady ? "secondary" : "default"}
                    className="min-w-[150px]"
                  >
                    {isReady ? "✓ Sẵn sàng" : "Sẵn sàng"}
                  </Button>
                  <div className="flex items-center justify-center gap-6 pt-4">
                    <div className="flex items-center gap-2">
                      <div className={`size-3 rounded-full ${room.player1_ready ? "bg-green-500" : "bg-gray-400"}`} />
                      <span className="text-sm">{room.player1_username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`size-3 rounded-full ${room.player2_ready ? "bg-green-500" : "bg-gray-400"}`} />
                      <span className="text-sm">{room.player2_username}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <CaroBoard
                  roomCode={roomCode}
                  boardState={boardState}
                  currentTurn={room.current_turn}
                  playerNumber={playerNumber}
                  onMove={handleMove}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="size-3 rounded-full bg-blue-500" />
                    <div className={`absolute -top-0.5 -right-0.5 size-2 rounded-full ${onlineUsers.has(room.player1_id) ? "bg-green-500" : "bg-gray-400"}`} title={onlineUsers.has(room.player1_id) ? "Online" : "Offline"} />
                  </div>
                  <PlayerStatsTooltip
                    username={room.player1_username}
                    gamesPlayed={room.player1_games || 0}
                    gamesWon={room.player1_wins || 0}
                    level={room.player1_level || 1}
                  />
                  {onlineUsers.has(room.player1_id) && (
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">Player 1 (X)</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="size-3 rounded-full bg-red-500" />
                    {room.player2_id && (
                      <div className={`absolute -top-0.5 -right-0.5 size-2 rounded-full ${onlineUsers.has(room.player2_id) ? "bg-green-500" : "bg-gray-400"}`} title={onlineUsers.has(room.player2_id) ? "Online" : "Offline"} />
                    )}
                  </div>
                  {room.player2_username ? (
                    <>
                      <PlayerStatsTooltip
                        username={room.player2_username}
                        gamesPlayed={room.player2_games || 0}
                        gamesWon={room.player2_wins || 0}
                        level={room.player2_level || 1}
                      />
                      {room.player2_id && onlineUsers.has(room.player2_id) && (
                        <span className="text-xs text-green-600 font-medium">Online</span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Waiting...</span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">Player 2 (O)</span>
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Bet Amount: <span className="font-semibold text-foreground">${room.bet_amount}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Winner Gets:{" "}
                  <span className="font-semibold text-foreground">
                    ${(Number.parseFloat(room.bet_amount.toString()) * 2 * 0.8).toFixed(2)}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <RoomChat roomCode={roomCode} currentUserId={currentUserId} currentUsername={currentUsername} />
        </div>
      </div>
    </div>
  )
}
