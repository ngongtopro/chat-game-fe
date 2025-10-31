import type { Server as HTTPServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import type { NextApiResponse } from "next"

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer
    }
  }
}

export function initializeSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    console.log("[v0] Client connected:", socket.id)

    // User joins their personal room
    socket.on("join-user-room", (userId: string) => {
      socket.join(`user-${userId}`)
      console.log("[v0] User joined room:", userId)
    })

    // Join chat room with another user
    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat-${chatId}`)
    })

    // Join caro game room
    socket.on("join-caro-room", (roomCode: string) => {
      socket.join(`caro-${roomCode}`)
      io.to(`caro-${roomCode}`).emit("player-joined", { socketId: socket.id })
    })

    // Leave caro game room
    socket.on("leave-caro-room", (roomCode: string) => {
      socket.leave(`caro-${roomCode}`)
      io.to(`caro-${roomCode}`).emit("player-left", { socketId: socket.id })
    })

    // Handle caro game moves
    socket.on("caro-move", (data: { roomCode: string; x: number; y: number; player: number }) => {
      io.to(`caro-${data.roomCode}`).emit("caro-move-made", data)
    })

    // Handle caro room chat
    socket.on("caro-chat-message", (data: { roomCode: string; message: string; userId: number }) => {
      io.to(`caro-${data.roomCode}`).emit("caro-chat-received", data)
    })

    // Handle direct chat messages
    socket.on("send-message", (data: { chatId: string; message: any }) => {
      io.to(`chat-${data.chatId}`).emit("message-received", data.message)
    })

    // Handle farm updates
    socket.on("farm-update", (data: { userId: string }) => {
      io.to(`user-${data.userId}`).emit("farm-updated", data)
    })

    socket.on("disconnect", () => {
      console.log("[v0] Client disconnected:", socket.id)
    })
  })

  return io
}
