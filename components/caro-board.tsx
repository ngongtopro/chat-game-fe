"use client"

import { useEffect, useState } from "react"
import { X, Circle } from "lucide-react"
import { getSocket } from "@/lib/socket-client"

interface CaroBoardProps {
  roomCode: string
  boardState: Record<string, number>
  currentTurn: number
  playerNumber: number
  onMove: (x: number, y: number) => void
}

export function CaroBoard({ roomCode, boardState, currentTurn, playerNumber, onMove }: CaroBoardProps) {
  const [board, setBoard] = useState<Record<string, number>>(boardState)
  const [minX, setMinX] = useState(-7)
  const [minY, setMinY] = useState(-7)
  const [maxX, setMaxX] = useState(7)
  const [maxY, setMaxY] = useState(7)

  useEffect(() => {
    setBoard(boardState)

    // Calculate board bounds based on moves
    const keys = Object.keys(boardState)
    if (keys.length > 0) {
      const coords = keys.map((k) => k.split(",").map(Number))
      const xs = coords.map((c) => c[0])
      const ys = coords.map((c) => c[1])

      setMinX(Math.min(...xs, -7) - 2)
      setMinY(Math.min(...ys, -7) - 2)
      setMaxX(Math.max(...xs, 7) + 2)
      setMaxY(Math.max(...ys, 7) + 2)
    }
  }, [boardState])

  useEffect(() => {
    const socket = getSocket()
    socket.emit("join-caro-room", roomCode)

    socket.on("caro-move-made", (data: { x: number; y: number; player: number }) => {
      setBoard((prev) => ({ ...prev, [`${data.x},${data.y}`]: data.player }))
    })

    return () => {
      socket.emit("leave-caro-room", roomCode)
      socket.off("caro-move-made")
    }
  }, [roomCode])

  const handleCellClick = (x: number, y: number) => {
    if (currentTurn !== playerNumber) return
    if (board[`${x},${y}`]) return

    onMove(x, y)

    // Emit move via socket
    const socket = getSocket()
    socket.emit("caro-move", { roomCode, x, y, player: playerNumber })
  }

  const renderCell = (x: number, y: number) => {
    const key = `${x},${y}`
    const value = board[key]

    return (
      <button
        key={key}
        onClick={() => handleCellClick(x, y)}
        className={`size-10 border border-border flex items-center justify-center transition-colors ${
          !value && currentTurn === playerNumber ? "hover:bg-muted cursor-pointer" : ""
        } ${value === 1 ? "bg-blue-100" : value === 2 ? "bg-red-100" : "bg-background"}`}
        disabled={!!value || currentTurn !== playerNumber}
      >
        {value === 1 && <X className="size-6 text-blue-600" />}
        {value === 2 && <Circle className="size-6 text-red-600" />}
      </button>
    )
  }

  const rows = []
  for (let y = minY; y <= maxY; y++) {
    const cells = []
    for (let x = minX; x <= maxX; x++) {
      cells.push(renderCell(x, y))
    }
    rows.push(
      <div key={y} className="flex">
        {cells}
      </div>,
    )
  }

  return (
    <div className="overflow-auto max-h-[600px] border rounded-lg p-4">
      <div className="inline-block">{rows}</div>
    </div>
  )
}
