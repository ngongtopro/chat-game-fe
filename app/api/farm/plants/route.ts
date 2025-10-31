import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const plants = await sql`
      SELECT id, name, growth_time, harvest_value, seed_cost, image_url
      FROM plant_models
      ORDER BY seed_cost ASC
    `

    return NextResponse.json({ plants })
  } catch (error) {
    console.error("[v0] Get plants error:", error)
    return NextResponse.json({ error: "Failed to get plants" }, { status: 500 })
  }
}
