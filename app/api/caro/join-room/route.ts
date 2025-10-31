import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { roomCode } = await request.json()

    // Get room details
    const rooms = await sql`
      SELECT id, room_code, player1_id, player2_id, bet_amount, status
      FROM caro_rooms
      WHERE room_code = ${roomCode}
    `

    if (rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const room = rooms[0]

    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Room is not available" }, { status: 400 })
    }

    if (room.player1_id === authUser.id) {
      return NextResponse.json({ error: "You are already in this room" }, { status: 400 })
    }

    if (room.player2_id) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 })
    }

    // Check wallet balance
    const wallets = await sql`
      SELECT balance FROM wallets WHERE user_id = ${authUser.id}
    `

    if (wallets.length === 0 || wallets[0].balance < room.bet_amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Deduct bet amount
    await sql`
      UPDATE wallets
      SET balance = balance - ${room.bet_amount}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${authUser.id}
    `

    // Join room
    await sql`
      UPDATE caro_rooms
      SET player2_id = ${authUser.id}, status = 'playing'
      WHERE id = ${room.id}
    `

    return NextResponse.json({ message: "Joined room successfully" })
  } catch (error) {
    console.error("[v0] Join room error:", error)
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 })
  }
}
