"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CaroBoard } from "./caro-board"
import { RoomChat } from "./room-chat"
import { PlayerStatsTooltip } from "./player-stats-tooltip"
import { apiRequest } from "@/lib/api"

interface RoomData {
  id: number
  room_code: string
  player1_id: number
  player2_id?: number
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

  const fetchRoom = async () => {
    try {
      const data = await apiRequest(`/api/caro/room/${roomCode}`)
      setRoom(data.room)
    } catch (error) {
      console.error("[v0] Fetch room error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoom()
    const interval = setInterval(fetchRoom, 2000)
    return () => clearInterval(interval)
  }, [roomCode])

  const handleMove = async (x: number, y: number) => {
    try {
      const data = await apiRequest("/api/caro/move", {
        method: "POST",
        body: JSON.stringify({ roomCode, x, y, player: playerNumber }),
      })

      if (data.winner) {
        alert(
          `Game finished! ${data.winner === playerNumber ? "You won!" : "You lost!"} ${data.winnings ? `Earned $${data.winnings}` : ""}`,
        )
        router.push("/caro")
      } else {
        fetchRoom()
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to make move")
      console.error("[v0] Move error:", error)
    }
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
  const boardState = room.board_state ? JSON.parse(room.board_state) : {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Caro Game</h1>
        <Button variant="outline" onClick={copyRoomCode}>
          <Copy className="mr-2 size-4" />
          {roomCode}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Game Board</span>
                {room.status === "waiting" && (
                  <span className="text-sm text-muted-foreground">Waiting for player 2...</span>
                )}
                {room.status === "playing" && (
                  <span className="text-sm">
                    {room.current_turn === playerNumber ? "Your turn" : "Opponent's turn"}
                  </span>
                )}
                {room.status === "finished" && (
                  <span className="flex items-center gap-2 text-sm">
                    <Trophy className="size-4 text-yellow-500" />
                    Game Finished
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {room.status === "waiting" ? (
                <div className="text-center p-12 text-muted-foreground">Waiting for another player to join...</div>
              ) : (
                <CaroBoard
                  roomCode={roomCode}
                  boardState={boardState}
                  currentTurn={room.current_turn}
                  playerNumber={playerNumber}
                  onMove={handleMove}
                  disabled={room.status === "finished"}
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
                  <div className="size-3 rounded-full bg-blue-500" />
                  <PlayerStatsTooltip
                    username={room.player1_username}
                    gamesPlayed={room.player1_games || 0}
                    gamesWon={room.player1_wins || 0}
                    level={room.player1_level || 1}
                  />
                </div>
                <span className="text-sm text-muted-foreground">Player 1 (X)</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-red-500" />
                  {room.player2_username ? (
                    <PlayerStatsTooltip
                      username={room.player2_username}
                      gamesPlayed={room.player2_games || 0}
                      gamesWon={room.player2_wins || 0}
                      level={room.player2_level || 1}
                    />
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
