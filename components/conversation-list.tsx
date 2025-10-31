"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiRequest } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Conversation {
  friend_id: number
  username: string
  avatar_url?: string
  unread_count: number
  last_message?: string
  last_message_time?: string
}

export function ConversationList() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await apiRequest("/api/chat/conversations")
        setConversations(data.conversations || [])
      } catch (error) {
        console.error("[v0] Fetch conversations error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleConversationClick = (friendId: number) => {
    setSelectedId(friendId)
    router.push(`/chat/${friendId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-3">
          <MessageCircle className="size-16 mx-auto text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground">No conversations yet</p>
            <p className="text-sm text-muted-foreground">
              Start chatting with your friends!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((conv) => (
          <div
            key={conv.friend_id}
            onClick={() => handleConversationClick(conv.friend_id)}
            className={cn(
              "flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-accent",
              selectedId === conv.friend_id && "bg-accent"
            )}
          >
            {/* Avatar */}
            <div className="relative">
              <Avatar className="size-12">
                {conv.avatar_url && <AvatarImage src={conv.avatar_url} />}
                <AvatarFallback className="text-lg font-semibold">
                  {conv.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <p className={cn(
                  "font-semibold truncate",
                  conv.unread_count > 0 && "text-foreground"
                )}>
                  {conv.username}
                </p>
                <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                  <Clock className="size-3" />
                  {formatTime(conv.last_message_time)}
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <p className={cn(
                  "text-sm truncate",
                  conv.unread_count > 0 
                    ? "font-medium text-foreground" 
                    : "text-muted-foreground"
                )}>
                  {conv.last_message || "No messages yet"}
                </p>
                
                {conv.unread_count > 0 && (
                  <Badge 
                    variant="default" 
                    className="rounded-full size-5 flex items-center justify-center p-0 text-xs flex-shrink-0"
                  >
                    {conv.unread_count > 9 ? "9+" : conv.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
