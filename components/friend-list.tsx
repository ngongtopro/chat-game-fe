"use client"

import { useEffect, useState } from "react"
import { Check, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { User } from "@/types"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api"

interface FriendWithStatus extends User {
  friendship_id: number
  status: string
}

export function FriendList() {
  const router = useRouter()
  const [friends, setFriends] = useState<FriendWithStatus[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFriends = async () => {
    try {
      const data = await apiRequest("/api/friends/list")
      setFriends(data.friends || [])
      setPendingRequests(data.pendingRequests || [])
    } catch (error) {
      console.error("[v0] Fetch friends error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  const handleAccept = async (friendId: number) => {
    try {
      await apiRequest("/api/friends/accept", {
        method: "POST",
        body: JSON.stringify({ friendId }),
      })

      fetchFriends()
    } catch (error) {
      console.error("[v0] Accept friend error:", error)
    }
  }

  const handleChat = (friendId: number) => {
    router.push(`/chat/${friendId}`)
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading friends...</p>
  }

  return (
    <Tabs defaultValue="friends" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
        <TabsTrigger value="requests">Requests ({pendingRequests.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="friends" className="space-y-2">
        {friends.length === 0 ? (
          <p className="text-sm text-muted-foreground">No friends yet. Search and add some!</p>
        ) : (
          friends.map((friend) => (
            <Card key={friend.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{friend.username}</p>
                    <p className="text-sm text-muted-foreground">{friend.email}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleChat(friend.id)}>
                  <MessageCircle className="mr-2 size-4" />
                  Chat
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="requests" className="space-y-2">
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending requests</p>
        ) : (
          pendingRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{request.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.username}</p>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAccept(request.id)}>
                    <Check className="mr-2 size-4" />
                    Accept
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
