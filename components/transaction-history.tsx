"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, ArrowDownRight, Sprout, Trophy, Coins } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/types"
import { apiRequest } from "@/lib/api"

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await apiRequest("/api/wallet/transactions")
        setTransactions(data.transactions || [])
      } catch (error) {
        console.error("[v0] Fetch transactions error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="size-4 text-green-500" />
      case "withdraw":
        return <ArrowUpRight className="size-4 text-red-500" />
      case "farm_harvest":
        return <Sprout className="size-4 text-green-500" />
      case "game_win":
        return <Trophy className="size-4 text-yellow-500" />
      case "game_loss":
        return <Coins className="size-4 text-red-500" />
      case "earn":
        return <Sprout className="size-4 text-green-500" />
      case "purchase":
        return <Coins className="size-4 text-red-500" />
      default:
        return <Coins className="size-4" />
    }
  }

  const getTransactionColor = (amount: number) => {
    return amount >= 0 ? "text-green-600" : "text-red-600"
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">Loading transactions...</CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="text-sm font-medium">{transaction.description || transaction.source}</p>
                    <p className="text-xs text-muted-foreground">{new Date(transaction.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <p className={`font-semibold ${getTransactionColor(Number.parseFloat(transaction.amount.toString()))}`}>
                  {Number.parseFloat(transaction.amount.toString()) >= 0 ? "+" : ""}$
                  {Math.abs(Number.parseFloat(transaction.amount.toString())).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
