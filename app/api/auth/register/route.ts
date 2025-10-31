import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import sql from "@/lib/db"
import { createAuthToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE username = ${username} OR email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${passwordHash})
      RETURNING id, username, email, created_at
    `

    // Create wallet for user
    await sql`
      INSERT INTO wallets (user_id, balance)
      VALUES (${newUser[0].id}, 1000.00)
    `

    // Create caro stats for user
    await sql`
      INSERT INTO caro_stats (user_id)
      VALUES (${newUser[0].id})
    `

    // Create auth token
    const token = createAuthToken({
      id: newUser[0].id,
      username: newUser[0].username,
      email: newUser[0].email,
    })

    const response = NextResponse.json({
      user: newUser[0],
      message: "Registration successful",
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
