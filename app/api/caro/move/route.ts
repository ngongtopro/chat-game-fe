import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

function checkWinner(board: Record<string, number>, lastX: number, lastY: number, player: number): boolean {
  const directions = [
    [
      [0, 1],
      [0, -1],
    ], // horizontal
    [
      [1, 0],
      [-1, 0],
    ], // vertical
    [
      [1, 1],
      [-1, -1],
    ], // diagonal \
    [
      [1, -1],
      [-1, 1],
    ], // diagonal /
  ]

  for (const [dir1, dir2] of directions) {
    let count = 1

    // Check in first direction
    for (let i = 1; i < 5; i++) {
      const key = `${lastX + dir1[0] * i},${lastY + dir1[1] * i}`
      if (board[key] === player) count++
      else break
    }

    // Check in opposite direction
    for (let i = 1; i < 5; i++) {
      const key = `${lastX + dir2[0] * i},${lastY + dir2[1] * i}`
      if (board[key] === player) count++
      else break
    }

    if (count >= 5) return true
  }

  return false
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { roomCode, x, y } = await request.json()

    // Get room
    const rooms = await sql`
      SELECT id, player1_id, player2_id, bet_amount, board_state, current_turn, status
      FROM caro_rooms
      WHERE room_code = ${roomCode}
    `

    if (rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const room = rooms[0]

    if (room.status !== "playing") {
      return NextResponse.json({ error: "Game is not in progress" }, { status: 400 })
    }

    // Determine player number
    const playerNumber = room.player1_id === authUser.id ? 1 : room.player2_id === authUser.id ? 2 : 0

    if (playerNumber === 0) {
      return NextResponse.json({ error: "You are not in this game" }, { status: 403 })
    }

    if (room.current_turn !== playerNumber) {
      return NextResponse.json({ error: "Not your turn" }, { status: 400 })
    }

    // Parse board state
    const board = room.board_state ? JSON.parse(room.board_state) : {}
    const key = `${x},${y}`

    if (board[key]) {
      return NextResponse.json({ error: "Cell already occupied" }, { status: 400 })
    }

    // Make move
    board[key] = playerNumber
    const nextTurn = playerNumber === 1 ? 2 : 1

    // Check for winner
    const hasWinner = checkWinner(board, x, y, playerNumber)

    if (hasWinner) {
      // Update room as finished
      await sql`
        UPDATE caro_rooms
        SET board_state = ${JSON.stringify(board)},
            status = 'finished',
            winner_id = ${authUser.id},
            finished_at = CURRENT_TIMESTAMP
        WHERE id = ${room.id}
      `

      // Calculate winnings (80% of total pot)
      const totalPot = room.bet_amount * 2
      const winnings = totalPot * 0.8

      // Award winnings
      await sql`
        UPDATE wallets
        SET balance = balance + ${winnings}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${authUser.id}
      `

      // Record transaction
      await sql`
        INSERT INTO transactions (user_id, amount, type, source)
        VALUES (${authUser.id}, ${winnings}, 'game_win', 'Caro game win')
      `

      // Update stats for winner
      await sql`
        UPDATE caro_stats
        SET games_played = games_played + 1,
            games_won = games_won + 1,
            total_earnings = total_earnings + ${winnings},
            level = FLOOR((games_won + 1) / 5) + 1
        WHERE user_id = ${authUser.id}
      `

      // Update stats for loser
      const loserId = playerNumber === 1 ? room.player2_id : room.player1_id
      await sql`
        UPDATE caro_stats
        SET games_played = games_played + 1
        WHERE user_id = ${loserId}
      `

      // Record loss transaction
      await sql`
        INSERT INTO transactions (user_id, amount, type, source)
        VALUES (${loserId}, ${-room.bet_amount}, 'game_loss', 'Caro game loss')
      `

      return NextResponse.json({ winner: true, winnings })
    }

    // Update board state and turn
    await sql`
      UPDATE caro_rooms
      SET board_state = ${JSON.stringify(board)},
          current_turn = ${nextTurn}
      WHERE id = ${room.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Make move error:", error)
    return NextResponse.json({ error: "Failed to make move" }, { status: 500 })
  }
}
