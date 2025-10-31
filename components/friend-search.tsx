"use client"

import { useState } from "react"
import { Search, UserPlus, Check, Clock, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { User } from "@/types"
import { apiRequest } from "@/lib/api"
import { cn } from "@/lib/utils"

interface SearchResult extends User {
  friendship_status?: 'none' | 'pending' | 'accepted'
}

export function FriendSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [requestSent, setRequestSent] = useState<Set<number>>(new Set())

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery)

    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const data = await apiRequest(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`)
      setResults(data.users || [])
    } catch (error) {
      console.error("[v0] Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFriend = async (friendId: number) => {
    try {
      await apiRequest("/api/friends/request", {
        method: "POST",
        body: JSON.stringify({ friendId }),
      })

      setRequestSent(new Set(requestSent).add(friendId))
      
      // Update result status
      setResults(results.map(user => 
        user.id === friendId 
          ? { ...user, friendship_status: 'pending' as const }
          : user
      ))
    } catch (error) {
      console.error("[v0] Add friend error:", error)
      alert(error instanceof Error ? error.message : "Failed to send friend request")
    }
  }

  const getStatusBadge = (user: SearchResult) => {
    if (requestSent.has(user.id) || user.friendship_status === 'pending') {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="size-3" />
          Pending
        </Badge>
      )
    }
    if (user.friendship_status === 'accepted') {
      return (
        <Badge variant="default" className="gap-1">
          <Check className="size-3" />
          Friends
        </Badge>
      )
    }
    return null
  }

  const canAddFriend = (user: SearchResult) => {
    return !requestSent.has(user.id) && 
           user.friendship_status !== 'pending' && 
           user.friendship_status !== 'accepted'
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          placeholder="Search by username or email..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-12 h-12 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => {
              setQuery("")
              setResults([])
            }}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Search Status */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Searching...</p>
        </div>
      )}

      {query.length > 0 && query.length < 2 && (
        <div className="text-center py-8">
          <Search className="size-12 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Type at least 2 characters to search
          </p>
        </div>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="size-16 mx-auto text-muted-foreground/50 mb-3" />
          <p className="font-medium text-muted-foreground mb-1">No users found</p>
          <p className="text-sm text-muted-foreground">
            Try searching with a different username or email
          </p>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </h3>
          </div>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {results.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  )}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="size-12">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                      <AvatarFallback className="text-lg font-semibold">
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{user.username}</p>
                        {getStatusBadge(user)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {canAddFriend(user) && (
                    <Button 
                      size="default"
                      onClick={() => handleAddFriend(user.id)}
                      className="flex-shrink-0 ml-4"
                    >
                      <UserPlus className="mr-2 size-4" />
                      Add Friend
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Empty State */}
      {!query && results.length === 0 && !loading && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Search className="size-16 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="font-semibold mb-1">Find Your Friends</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Search for other players by their username or email address to send them a friend request
          </p>
        </div>
      )}
    </div>
  )
}
