"use client"

import { useEffect, useState } from "react"
import { Check, MessageCircle, X, Users, UserCheck, Clock, Mail, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/types"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api"
import { cn } from "@/lib/utils"

interface FriendWithStatus extends User {
  friendship_id: number
  status: string
}

export function FriendList() {
  const router = useRouter()
  const [friends, setFriends] = useState<FriendWithStatus[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendWithStatus[]>([])
  const [sentRequests, setSentRequests] = useState<FriendWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFriends = async () => {
    try {
      const data = await apiRequest("/api/friends/list")
      setFriends(data.friends || [])
      setPendingRequests(data.pendingRequests || [])
      setSentRequests(data.sentRequests || [])
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
      alert(error instanceof Error ? error.message : "Failed to accept friend request")
    }
  }

  const handleReject = async (friendId: number) => {
    try {
      await apiRequest("/api/friends/reject", {
        method: "POST",
        body: JSON.stringify({ friendId }),
      })

      fetchFriends()
    } catch (error) {
      console.error("[v0] Reject friend error:", error)
    }
  }

  const handleRemove = async (friendId: number) => {
    if (!confirm("Are you sure you want to remove this friend?")) {
      return
    }

    try {
      await apiRequest("/api/friends/remove", {
        method: "POST",
        body: JSON.stringify({ friendId }),
      })

      fetchFriends()
    } catch (error) {
      console.error("[v0] Remove friend error:", error)
    }
  }

  const handleChat = (friendId: number) => {
    router.push(`/chat/${friendId}`)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading friends...</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="friends" className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-11">
        <TabsTrigger value="friends" className="gap-2">
          <UserCheck className="size-4" />
          <span className="hidden sm:inline">Friends</span>
          <Badge variant="secondary" className="ml-1">{friends.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="requests" className="gap-2">
          <Clock className="size-4" />
          <span className="hidden sm:inline">Requests</span>
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="ml-1">{pendingRequests.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent" className="gap-2">
          <Mail className="size-4" />
          <span className="hidden sm:inline">Sent</span>
          {sentRequests.length > 0 && (
            <Badge variant="secondary" className="ml-1">{sentRequests.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Friends Tab */}
      <TabsContent value="friends" className="mt-6">
        {friends.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Users className="size-16 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold mb-1">No friends yet</h3>
            <p className="text-sm text-muted-foreground">
              Search and add some friends to get started!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="grid gap-3 md:grid-cols-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <Avatar className="size-12">
                        {friend.avatar_url && <AvatarImage src={friend.avatar_url} />}
                        <AvatarFallback className="text-lg font-semibold">
                          {friend.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{friend.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{friend.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button 
                      size="icon"
                      variant="default"
                      onClick={() => handleChat(friend.id)}
                    >
                      <MessageCircle className="size-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleChat(friend.id)}>
                          <MessageCircle className="mr-2 size-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRemove(friend.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <X className="mr-2 size-4" />
                          Remove Friend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </TabsContent>

      {/* Pending Requests Tab */}
      <TabsContent value="requests" className="mt-6">
        {pendingRequests.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Clock className="size-16 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold mb-1">No pending requests</h3>
            <p className="text-sm text-muted-foreground">
              You'll see friend requests here when someone sends you one
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="size-12">
                      {request.avatar_url && <AvatarImage src={request.avatar_url} />}
                      <AvatarFallback className="text-lg font-semibold">
                        {request.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{request.username}</p>
                        <Badge variant="secondary" className="text-xs">
                          New Request
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {request.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <Button 
                      size="default"
                      onClick={() => handleAccept(request.id)}
                    >
                      <Check className="mr-2 size-4" />
                      Accept
                    </Button>
                    <Button 
                      size="default"
                      variant="outline"
                      onClick={() => handleReject(request.id)}
                    >
                      <X className="mr-2 size-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </TabsContent>

      {/* Sent Requests Tab */}
      <TabsContent value="sent" className="mt-6">
        {sentRequests.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Mail className="size-16 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold mb-1">No sent requests</h3>
            <p className="text-sm text-muted-foreground">
              Friend requests you send will appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="size-12">
                      {request.avatar_url && <AvatarImage src={request.avatar_url} />}
                      <AvatarFallback className="text-lg font-semibold">
                        {request.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{request.username}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {request.email}
                      </p>
                    </div>
                  </div>

                  <Badge variant="secondary" className="flex-shrink-0 ml-4">
                    <Clock className="mr-1 size-3" />
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </TabsContent>
    </Tabs>
  )
}
