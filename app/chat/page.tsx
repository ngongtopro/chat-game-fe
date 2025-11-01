"use client"

import { useState, useEffect } from "react"
import { ConversationList } from "@/components/conversation-list"
import { ChatWindow } from "@/components/chat-window"
import { MessageSquare, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { apiRequest } from "@/lib/api"
import { getAuthUser } from "@/lib/auth-client"
import { ProtectedRoute } from "@/components/protected-route"

interface SelectedFriend {
  id: number
  username: string
  avatar_url?: string
}

export default function ChatPage() {
  const [selectedFriend, setSelectedFriend] = useState<SelectedFriend | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
    // Fetch current user info
    const fetchCurrentUser = async () => {
      try {
        const data = await getAuthUser()
        console.log("Current user data:", data)
        setCurrentUserId(data?.id ?? null)
      } catch (error) {
        console.error("[v0] Failed to fetch current user:", error)
      }
    }
    fetchCurrentUser()
  }, [])

  const handleSelectFriend = (friend: SelectedFriend) => {
    setSelectedFriend(friend)
  }

  return (
    <ProtectedRoute>
    <div className="flex h-screen bg-background">
      {/* Sidebar - Conversation List */}
      <div className="w-full md:w-96 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="size-6" />
              Messages
            </h1>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-hidden">
          <ConversationList 
            selectedFriendId={selectedFriend?.id || null}
            onSelectFriend={handleSelectFriend}
          />
        </div>
      </div>

      {/* Main Content */}
      {selectedFriend && currentUserId ? (
        <div className="hidden md:flex flex-1">
          <ChatWindow 
            friendId={selectedFriend.id}
            friendUsername={selectedFriend.username}
            currentUserId={currentUserId}
            friendAvatar={selectedFriend.avatar_url}
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-muted/20">
          <div className="text-center space-y-4 p-8">
            <MessageSquare className="size-20 mx-auto text-muted-foreground/50" />
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Select a conversation
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}
