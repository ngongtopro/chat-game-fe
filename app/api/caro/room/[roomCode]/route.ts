import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ roomCode: string }> }) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { roomCode } = await params

    const rooms = await sql`
      SELECT 
        cr.id, cr.room_code, cr.player1_id, cr.player2_id, cr.bet_amount,
        cr.status, cr.winner_id, cr.board_state, cr.current_turn,
        u1.username as player1_username, u1.avatar_url as player1_avatar,
        u2.username as player2_username, u2.avatar_url as player2_avatar,
        cs1.games_played as p1_games_played, cs1.games_won as p1_games_won, cs1.level as p1_level,
        cs2.games_played as p2_games_played, cs2.games_won as p2_games_won, cs2.level as p2_level
      FROM caro_rooms cr
      JOIN users u1 ON cr.player1_id = u1.id
      LEFT JOIN users u2 ON cr.player2_id = u2.id
      LEFT JOIN caro_stats cs1 ON cr.player1_id = cs1.user_id
      LEFT JOIN caro_stats cs2 ON cr.player2_id = cs2.user_id
      WHERE cr.room_code = ${roomCode}
    `

    if (rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json({ room: rooms[0] })
  } catch (error) {
    console.error("[v0] Get room error:", error)
    return NextResponse.json({ error: "Failed to get room" }, { status: 500 })
  }
}
