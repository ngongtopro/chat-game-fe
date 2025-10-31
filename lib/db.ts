import { Pool } from "pg"

// Debug: Log environment variables (remove in production)
console.log('[DB Config] Environment variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'MISSING',
})

// Validate environment variables
if (!process.env.DB_PASSWORD && process.env.NODE_ENV === 'production') {
  throw new Error('DB_PASSWORD environment variable is required in production')
}

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || "100.64.192.68",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "nonfar",
  user: process.env.DB_USER || "myuser",
  password: process.env.DB_PASSWORD || "mypassword",
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test connection on startup
pool.on("connect", () => {
  console.log("[Frontend] Connected to PostgreSQL database")
})

pool.on("error", (err) => {
  console.error("[Frontend] Unexpected error on idle PostgreSQL client", err)
})

// Export sql function compatible with neon syntax
export default async function sql(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<any[]> {
  // Convert tagged template to parameterized query
  let text = strings[0]
  const params: any[] = []

  for (let i = 0; i < values.length; i++) {
    params.push(values[i])
    text += `$${i + 1}${strings[i + 1]}`
  }

  try {
    const result = await pool.query(text, params)
    return result.rows
  } catch (error) {
    console.error("[Frontend] Database query error:", error)
    console.error("[Frontend] Query text:", text)
    console.error("[Frontend] Query params:", params)
    throw error
  }
}

// Export pool for direct access if needed
export { pool }

// Database helper functions for backwards compatibility
export async function query(text: string, params?: any[]) {
  try {
    const result = await pool.query(text, params)
    return result.rows
  } catch (error) {
    console.error("[Frontend] Database query error:", error)
    throw error
  }
}
