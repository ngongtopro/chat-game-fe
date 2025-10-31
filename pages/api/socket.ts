import type { NextApiRequest } from "next"
import type { NextApiResponseWithSocket } from "@/lib/socket-server"
import { initializeSocket } from "@/lib/socket-server"

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log("[v0] Initializing Socket.io server...")
    const io = initializeSocket(res.socket.server)
    res.socket.server.io = io
  } else {
    console.log("[v0] Socket.io server already running")
  }
  res.end()
}
