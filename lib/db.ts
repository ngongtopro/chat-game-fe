import { neon } from "@neondatabase/serverless"

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!)

export default sql

// Database helper functions
export async function query(text: string, params?: any[]) {
  try {
    const result = await sql(text, params)
    return result
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}
