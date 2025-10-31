"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, ArrowDownRight, Sprout, Trophy, Coins, RefreshCw, Calendar, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Transaction } from "@/types"
import { apiRequest } from "@/lib/api"

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const data = await apiRequest("/api/wallet/transactions")
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("[v0] Fetch transactions error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="size-5 text-green-500" />
      case "withdraw":
        return <ArrowUpRight className="size-5 text-red-500" />
      case "farm_harvest":
        return <Sprout className="size-5 text-green-500" />
      case "game_win":
        return <Trophy className="size-5 text-yellow-500" />
      case "game_loss":
        return <Coins className="size-5 text-red-500" />
      case "earn":
        return <Sprout className="size-5 text-green-500" />
      case "purchase":
        return <Coins className="size-5 text-red-500" />
      default:
        return <Coins className="size-5 text-muted-foreground" />
    }
  }

  const getTransactionColor = (amount: number) => {
    return amount >= 0 ? "text-green-600" : "text-red-600"
  }

  const getTransactionBadge = (type: string) => {
    const badgeMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      deposit: { label: "Deposit", variant: "default" },
      withdraw: { label: "Withdraw", variant: "destructive" },
      farm_harvest: { label: "Farm", variant: "secondary" },
      game_win: { label: "Win", variant: "default" },
      game_loss: { label: "Loss", variant: "destructive" },
      earn: { label: "Earn", variant: "secondary" },
      purchase: { label: "Purchase", variant: "outline" },
    }
    const badge = badgeMap[type] || { label: type, variant: "outline" as const }
    return <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  }

  const filteredTransactions = filter === "all" 
    ? transactions 
    : transactions.filter(t => t.type === filter)

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <RefreshCw className="size-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-2 shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Transaction History
            </CardTitle>
            <CardDescription>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} total
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchTransactions}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 pt-2 flex-wrap">
          <Filter className="size-4 text-muted-foreground" />
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "deposit" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("deposit")}
          >
            Deposits
          </Button>
          <Button
            variant={filter === "withdraw" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("withdraw")}
          >
            Withdrawals
          </Button>
          <Button
            variant={filter === "game_win" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("game_win")}
          >
            Games
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Coins className="size-12 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {filter === "all" ? "No transactions yet" : `No ${filter} transactions`}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => {
                const amount = Number.parseFloat(transaction.amount.toString())
                return (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-full bg-muted">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {transaction.description || transaction.source || transaction.type}
                          </p>
                          {getTransactionBadge(transaction.type)}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getTransactionColor(amount)}`}>
                        {amount >= 0 ? "+" : ""}${Math.abs(amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
