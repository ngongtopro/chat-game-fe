"use client"

import { useState } from "react"
import { Search, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { User } from "@/types"
import { apiRequest } from "@/lib/api"

export function FriendSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

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

      setResults(results.filter((user) => user.id !== friendId))
    } catch (error) {
      console.error("[v0] Add friend error:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search users by username or email..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading && <p className="text-sm text-muted-foreground">Searching...</p>}

      <div className="space-y-2">
        {results.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleAddFriend(user.id)}>
                <UserPlus className="mr-2 size-4" />
                Add Friend
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
