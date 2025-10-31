import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const slots = await sql`
      SELECT 
        fs.id, fs.user_id, fs.slot_x, fs.slot_y, 
        fs.plant_model_id, fs.planted_at, fs.harvest_ready_at, fs.is_harvested,
        pm.name as plant_name, pm.harvest_value, pm.image_url as plant_image
      FROM farm_slots fs
      LEFT JOIN plant_models pm ON fs.plant_model_id = pm.id
      WHERE fs.user_id = ${authUser.id}
      ORDER BY fs.slot_x, fs.slot_y
    `

    return NextResponse.json({ slots })
  } catch (error) {
    console.error("[v0] Get farm slots error:", error)
    return NextResponse.json({ error: "Failed to get farm slots" }, { status: 500 })
  }
}
