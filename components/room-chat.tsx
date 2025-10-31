"use client"

import { useEffect, useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSocket } from "@/lib/socket-client"

interface Message {
  userId: number
  username: string
  message: string
  timestamp: string
}

interface RoomChatProps {
  roomCode: string
  currentUserId: number
  currentUsername: string
}

export function RoomChat({ roomCode, currentUserId, currentUsername }: RoomChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")

  useEffect(() => {
    const socket = getSocket()

    socket.on("caro-chat-received", (data: { message: string; userId: number; username: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          userId: data.userId,
          username: data.username,
          message: data.message,
          timestamp: new Date().toISOString(),
        },
      ])
    })

    return () => {
      socket.off("caro-chat-received")
    }
  }, [])

  const handleSend = () => {
    if (!input.trim()) return

    const socket = getSocket()
    socket.emit("caro-chat-message", {
      roomCode,
      message: input,
      userId: currentUserId,
      username: currentUsername,
    })

    setInput("")
  }

  return (
    <div className="flex flex-col h-[400px] border rounded-lg">
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-semibold">Room Chat</h3>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.userId === currentUserId ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-2 ${
                  msg.userId === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-xs font-semibold mb-1">{msg.username}</p>
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <Button onClick={handleSend} size="icon">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}
