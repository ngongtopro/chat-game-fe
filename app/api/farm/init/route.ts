import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function POST() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if farm already initialized
    const existing = await sql`
      SELECT COUNT(*) as count FROM farm_slots WHERE user_id = ${authUser.id}
    `

    if (existing[0].count > 0) {
      return NextResponse.json({ message: "Farm already initialized" })
    }

    // Initialize 10x10 grid
    const slots = []
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        slots.push({ user_id: authUser.id, slot_x: x, slot_y: y })
      }
    }

    // Batch insert all slots
    for (const slot of slots) {
      await sql`
        INSERT INTO farm_slots (user_id, slot_x, slot_y)
        VALUES (${slot.user_id}, ${slot.slot_x}, ${slot.slot_y})
      `
    }

    return NextResponse.json({ message: "Farm initialized successfully" })
  } catch (error) {
    console.error("[v0] Initialize farm error:", error)
    return NextResponse.json({ error: "Failed to initialize farm" }, { status: 500 })
  }
}
