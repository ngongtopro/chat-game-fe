import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const wallets = await sql`
      SELECT id, user_id, balance, updated_at
      FROM wallets
      WHERE user_id = ${authUser.id}
    `

    if (wallets.length === 0) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    return NextResponse.json({ wallet: wallets[0] })
  } catch (error) {
    console.error("[v0] Get wallet error:", error)
    return NextResponse.json({ error: "Failed to get wallet" }, { status: 500 })
  }
}
