"use client"

import { useEffect, useState } from "react"
import { X, Circle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getSocket } from "@/lib/socket-client"
import { apiClient } from "@/lib/api-client"

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
  const [lastMove, setLastMove] = useState<string | null>(null)

  useEffect(() => {
    setBoard(boardState)

    // Calculate board bounds based on moves
    const keys = Object.keys(boardState)
    if (keys.length > 0) {
      const coords = keys.map((k) => k.split("-").map(Number))
      const xs = coords.map((c) => c[0])
      const ys = coords.map((c) => c[1])

      setMinX(Math.min(...xs, -7) - 2)
      setMinY(Math.min(...ys, -7) - 2)
      setMaxX(Math.max(...xs, 7) + 2)
      setMaxY(Math.max(...ys, 7) + 2)
    }
  }, [boardState])

  const handleCellClick = async (x: number, y: number) => {
    if (currentTurn !== playerNumber) return
    if (board[`${x}-${y}`]) return

    const cellKey = `${x}-${y}`
    setLastMove(cellKey)

    // Optimistically update local board
    const newBoard = { ...board, [cellKey]: playerNumber }
    setBoard(newBoard)

    // Send move to server
    try {
      const data = await apiClient.makeMove(roomCode, x, y, playerNumber)

      // Emit move via socket for realtime update to opponent
      const socket = getSocket()
      socket.emit("caro:move", { roomCode, x, y, player: playerNumber, board: newBoard })

      // Check if game over
      if (data.winner) {
        socket.emit("caro:game-over", { roomCode, winner: data.winner, winnings: data.winnings })
      }
    } catch (error) {
      // Revert optimistic update on error
      setBoard(board)
      setLastMove(null)
      alert(error instanceof Error ? error.message : "Failed to make move")
    }
  }

  const renderCell = (x: number, y: number) => {
    const key = `${x}-${y}`
    const value = board[key]
    const isLastMove = key === lastMove
    const isMyTurn = currentTurn === playerNumber
    const canClick = !value && isMyTurn

    return (
      <motion.button
        key={key}
        onClick={() => handleCellClick(x, y)}
        className={`size-10 sm:size-12 border transition-all relative ${
          isLastMove ? "border-yellow-400 border-2 shadow-lg" : "border-border"
        } ${
          value === 1 
            ? "bg-gradient-to-br from-blue-100 to-blue-50" 
            : value === 2 
            ? "bg-gradient-to-br from-red-100 to-red-50" 
            : canClick 
            ? "bg-background hover:bg-primary/5 cursor-pointer" 
            : "bg-muted/20"
        }`}
        disabled={!!value || !isMyTurn}
        whileHover={canClick ? { 
          scale: 1.05,
          backgroundColor: "rgba(var(--primary-rgb, 0, 0, 0), 0.05)",
          transition: { duration: 0.2 }
        } : {}}
        whileTap={canClick ? { scale: 0.95 } : {}}
        initial={false}
      >
        <AnimatePresence mode="wait">
          {value === 1 && (
            <motion.div
              key="x"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20 
              }}
            >
              <X className="size-6 sm:size-7 text-blue-600" strokeWidth={3} />
            </motion.div>
          )}
          {value === 2 && (
            <motion.div
              key="o"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20 
              }}
            >
              <Circle className="size-6 sm:size-7 text-red-600" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hover indicator for empty cells */}
        {!value && canClick && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.3 }}
            transition={{ duration: 0.2 }}
          >
            {playerNumber === 1 ? (
              <X className="size-6 sm:size-7 text-blue-400" strokeWidth={2} />
            ) : (
              <Circle className="size-6 sm:size-7 text-red-400" strokeWidth={2} />
            )}
          </motion.div>
        )}
      </motion.button>
    )
  }

  const rows = []
  for (let y = minY; y <= maxY; y++) {
    const cells = []
    for (let x = minX; x <= maxX; x++) {
      cells.push(renderCell(x, y))
    }
    rows.push(
      <motion.div
        key={y}
        className="flex"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: (y - minY) * 0.02 }}
      >
        {cells}
      </motion.div>,
    )
  }

  return (
    <motion.div
      className="overflow-auto max-h-[600px] border rounded-lg p-4 bg-gradient-to-br from-background to-muted/20"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="inline-block shadow-lg rounded-lg overflow-hidden">
        {rows}
      </div>
    </motion.div>
  )
}
