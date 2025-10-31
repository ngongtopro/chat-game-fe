import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { slotId, plantModelId } = await request.json()

    // Get plant model details
    const plants = await sql`
      SELECT id, name, growth_time, seed_cost
      FROM plant_models
      WHERE id = ${plantModelId}
    `

    if (plants.length === 0) {
      return NextResponse.json({ error: "Plant model not found" }, { status: 404 })
    }

    const plant = plants[0]

    // Check wallet balance
    const wallets = await sql`
      SELECT balance FROM wallets WHERE user_id = ${authUser.id}
    `

    if (wallets.length === 0 || wallets[0].balance < plant.seed_cost) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Deduct seed cost
    await sql`
      UPDATE wallets
      SET balance = balance - ${plant.seed_cost}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${authUser.id}
    `

    // Record transaction
    await sql`
      INSERT INTO transactions (user_id, amount, type, source)
      VALUES (${authUser.id}, ${-plant.seed_cost}, 'withdraw', ${`Planted ${plant.name}`})
    `

    // Calculate harvest time
    const plantedAt = new Date()
    const harvestReadyAt = new Date(plantedAt.getTime() + plant.growth_time * 1000)

    // Update farm slot
    await sql`
      UPDATE farm_slots
      SET plant_model_id = ${plantModelId},
          planted_at = ${plantedAt.toISOString()},
          harvest_ready_at = ${harvestReadyAt.toISOString()},
          is_harvested = false
      WHERE id = ${slotId} AND user_id = ${authUser.id}
    `

    return NextResponse.json({ message: "Plant planted successfully" })
  } catch (error) {
    console.error("[v0] Plant error:", error)
    return NextResponse.json({ error: "Failed to plant" }, { status: 500 })
  }
}
