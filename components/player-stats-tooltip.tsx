"use client"

import { Trophy, Target, TrendingUp } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface PlayerStatsProps {
  username: string
  gamesPlayed: number
  gamesWon: number
  level: number
}

export function PlayerStatsTooltip({ username, gamesPlayed, gamesWon, level }: PlayerStatsProps) {
  const winRate = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(1) : "0.0"

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar>
            <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{username}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-12">
              <AvatarFallback className="text-lg">{username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{username}</p>
              <p className="text-sm text-muted-foreground">Level {level}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Trophy className="size-4 text-yellow-500" />
                Games Won
              </span>
              <span className="font-semibold">{gamesWon}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Target className="size-4 text-blue-500" />
                Games Played
              </span>
              <span className="font-semibold">{gamesPlayed}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <TrendingUp className="size-4 text-green-500" />
                Win Rate
              </span>
              <span className="font-semibold">{winRate}%</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
