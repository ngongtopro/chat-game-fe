import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { amount, source } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Update wallet balance
    await sql`
      UPDATE wallets
      SET balance = balance + ${amount}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${authUser.id}
    `

    // Record transaction
    await sql`
      INSERT INTO transactions (user_id, amount, type, source)
      VALUES (${authUser.id}, ${amount}, 'deposit', ${source || "Manual deposit"})
    `

    // Get updated balance
    const wallets = await sql`
      SELECT balance FROM wallets WHERE user_id = ${authUser.id}
    `

    return NextResponse.json({
      message: "Deposit successful",
      balance: wallets[0].balance,
    })
  } catch (error) {
    console.error("[v0] Deposit error:", error)
    return NextResponse.json({ error: "Deposit failed" }, { status: 500 })
  }
}
