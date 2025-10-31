import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { betAmount } = await request.json()

    if (!betAmount || betAmount <= 0) {
      return NextResponse.json({ error: "Invalid bet amount" }, { status: 400 })
    }

    // Check wallet balance
    const wallets = await sql`
      SELECT balance FROM wallets WHERE user_id = ${authUser.id}
    `

    if (wallets.length === 0 || wallets[0].balance < betAmount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Deduct bet amount
    await sql`
      UPDATE wallets
      SET balance = balance - ${betAmount}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${authUser.id}
    `

    // Create room
    const roomCode = generateRoomCode()
    const rooms = await sql`
      INSERT INTO caro_rooms (room_code, player1_id, bet_amount, status, board_state, current_turn)
      VALUES (${roomCode}, ${authUser.id}, ${betAmount}, 'waiting', '{}', 1)
      RETURNING id, room_code, player1_id, bet_amount, status
    `

    return NextResponse.json({ room: rooms[0] })
  } catch (error) {
    console.error("[v0] Create room error:", error)
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
