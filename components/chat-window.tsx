"use client"

import { useEffect, useState, useRef } from "react"
import { Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getSocket } from "@/lib/socket-client"
import type { ChatMessage } from "@/types"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api"

interface ChatWindowProps {
  friendId: number
  friendUsername: string
  currentUserId: number
}

export function ChatWindow({ friendId, friendUsername, currentUserId }: ChatWindowProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const chatId = [currentUserId, friendId].sort().join("-")

  const fetchMessages = async () => {
    try {
      const data = await apiRequest(`/api/chat/messages?friendId=${friendId}`)
      setMessages(data.messages || [])
    } catch (error) {
      console.error("[v0] Fetch messages error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()

    const socket = getSocket()
    socket.emit("join-chat", chatId)

    socket.on("message-received", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      socket.emit("leave-chat", chatId)
      socket.off("message-received")
    }
  }, [friendId, chatId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    try {
      const data = await apiRequest("/api/chat/send", {
        method: "POST",
        body: JSON.stringify({ receiverId: friendId, message: input }),
      })

      setMessages((prev) => [...prev, data.message])

      const socket = getSocket()
      socket.emit("send-message", { chatId, message: data.message })

      setInput("")
    } catch (error) {
      console.error("[v0] Send message error:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading chat...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.push("/chat")}>
          <ArrowLeft className="size-4" />
        </Button>
        <Avatar>
          <AvatarFallback>{friendUsername[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{friendUsername}</p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender_id === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm break-words">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button onClick={handleSend} size="icon">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}
