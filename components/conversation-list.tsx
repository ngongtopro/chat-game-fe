"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiRequest } from "@/lib/api"

interface Conversation {
  friend_id: number
  username: string
  avatar_url?: string
  unread_count: number
}

export function ConversationList() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return <div className="text-center p-8">Loading conversations...</div>
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center p-8 space-y-3">
        <MessageCircle className="size-12 mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground">Start chatting with your friends!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <Card key={conv.friend_id} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4" onClick={() => router.push(`/chat/${conv.friend_id}`)}>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{conv.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold truncate">{conv.username}</p>
                  {conv.unread_count > 0 && <Badge variant="destructive">{conv.unread_count}</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
