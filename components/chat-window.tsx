"use client"

import { useEffect, useState, useRef } from "react"
import { Send, ArrowLeft, MoreVertical, Phone, Video, Smile, Paperclip, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSocket } from "@/lib/socket-client"
import type { ChatMessage } from "@/types"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ChatWindowProps {
  friendId: number
  friendUsername: string
  currentUserId: number
  friendAvatar?: string
}

export function ChatWindow({ friendId, friendUsername, currentUserId, friendAvatar }: ChatWindowProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const chatId = [currentUserId, friendId].sort().join("-")

  const fetchMessages = async () => {
    try {
      const data = await apiRequest(`/api/chat/messages?friendId=${friendId}`)
      setMessages(data.messages || [])
      
      // Mark messages as read
      await apiRequest("/api/chat/mark-read", {
        method: "POST",
        body: JSON.stringify({ friendId }),
      })
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

    socket.on("user-typing", () => {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 3000)
    })

    return () => {
      socket.emit("leave-chat", chatId)
      socket.off("message-received")
      socket.off("user-typing")
    }
  }, [friendId, chatId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const tempMessage = input
    setInput("")

    try {
      const data = await apiRequest("/api/chat/send", {
        method: "POST",
        body: JSON.stringify({ receiverId: friendId, message: tempMessage }),
      })

      setMessages((prev) => [...prev, data.message])

      const socket = getSocket()
      socket.emit("send-message", { chatId, message: data.message })

    } catch (error) {
      console.error("[v0] Send message error:", error)
      setInput(tempMessage) // Restore message on error
    }
  }

  const handleTyping = () => {
    const socket = getSocket()
    socket.emit("typing", { chatId })
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDateDivider = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  const shouldShowDateDivider = (index: number) => {
    if (index === 0) return true
    const currentDate = new Date(messages[index].created_at).toDateString()
    const prevDate = new Date(messages[index - 1].created_at).toDateString()
    return currentDate !== prevDate
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/chat")}
            className="md:hidden"
          >
            <ArrowLeft className="size-5" />
          </Button>
          
          <div className="relative">
            <Avatar className="size-10">
              {friendAvatar && <AvatarImage src={friendAvatar} />}
              <AvatarFallback>{friendUsername[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background" />
          </div>
          
          <div>
            <p className="font-semibold">{friendUsername}</p>
            <p className="text-xs text-muted-foreground">
              {isTyping ? "Typing..." : "Online"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Phone className="size-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="size-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="size-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((msg, index) => (
            <div key={msg.id}>
              {/* Date Divider */}
              {shouldShowDateDivider(index) && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {formatDateDivider(msg.created_at)}
                  </div>
                </div>
              )}

              {/* Message */}
              <div 
                className={cn(
                  "flex gap-2",
                  msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                )}
              >
                {msg.sender_id !== currentUserId && (
                  <Avatar className="size-8">
                    {friendAvatar && <AvatarImage src={friendAvatar} />}
                    <AvatarFallback className="text-xs">
                      {friendUsername[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div 
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
                    msg.sender_id === currentUserId 
                      ? "bg-primary text-primary-foreground rounded-br-sm" 
                      : "bg-muted rounded-bl-sm"
                  )}
                >
                  <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                  <div className={cn(
                    "flex items-center gap-1 justify-end mt-1",
                    msg.sender_id === currentUserId ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    <span className="text-xs">{formatMessageTime(msg.created_at)}</span>
                    {msg.sender_id === currentUserId && (
                      msg.is_read 
                        ? <CheckCheck className="size-3" />
                        : <Check className="size-3" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2">
              <Avatar className="size-8">
                {friendAvatar && <AvatarImage src={friendAvatar} />}
                <AvatarFallback className="text-xs">
                  {friendUsername[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="size-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="size-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="size-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Paperclip className="size-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                handleTyping()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type a message..."
              className="pr-10 rounded-full"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 size-8"
            >
              <Smile className="size-5" />
            </Button>
          </div>

          <Button 
            onClick={handleSend} 
            size="icon"
            className="rounded-full flex-shrink-0"
            disabled={!input.trim()}
          >
            <Send className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
