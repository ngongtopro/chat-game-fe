import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { slotId } = await request.json()

    // Get slot details with plant info
    const slots = await sql`
      SELECT 
        fs.id, fs.harvest_ready_at, fs.is_harvested,
        pm.name, pm.harvest_value
      FROM farm_slots fs
      JOIN plant_models pm ON fs.plant_model_id = pm.id
      WHERE fs.id = ${slotId} AND fs.user_id = ${authUser.id}
    `

    if (slots.length === 0) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 })
    }

    const slot = slots[0]

    // Check if ready to harvest
    if (new Date() < new Date(slot.harvest_ready_at)) {
      return NextResponse.json({ error: "Plant not ready to harvest" }, { status: 400 })
    }

    if (slot.is_harvested) {
      return NextResponse.json({ error: "Already harvested" }, { status: 400 })
    }

    // Add harvest value to wallet
    await sql`
      UPDATE wallets
      SET balance = balance + ${slot.harvest_value}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${authUser.id}
    `

    // Record transaction
    await sql`
      INSERT INTO transactions (user_id, amount, type, source)
      VALUES (${authUser.id}, ${slot.harvest_value}, 'farm_harvest', ${`Harvested ${slot.name}`})
    `

    // Clear the slot
    await sql`
      UPDATE farm_slots
      SET plant_model_id = NULL,
          planted_at = NULL,
          harvest_ready_at = NULL,
          is_harvested = false
      WHERE id = ${slotId}
    `

    return NextResponse.json({
      message: "Harvest successful",
      earned: slot.harvest_value,
    })
  } catch (error) {
    console.error("[v0] Harvest error:", error)
    return NextResponse.json({ error: "Failed to harvest" }, { status: 500 })
  }
}
