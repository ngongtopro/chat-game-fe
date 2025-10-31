"use client"

import { useEffect, useState } from "react"
import { Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { apiRequest } from "@/lib/api"

export function WalletCard() {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  const fetchBalance = async () => {
    try {
      const data = await apiRequest("/api/wallet/balance")
      setBalance(data.balance)
    } catch (error) {
      console.error("[v0] Fetch balance error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  const handleDeposit = async () => {
    const amount = Number.parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) return

    try {
      await apiRequest("/api/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({ amount, source: "manual" }),
      })

      setDepositAmount("")
      fetchBalance()
    } catch (error) {
      console.error("[v0] Deposit error:", error)
    }
  }

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) return

    try {
      await apiRequest("/api/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount }),
      })

      setWithdrawAmount("")
      fetchBalance()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Withdrawal failed")
      console.error("[v0] Withdrawal error:", error)
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">Loading wallet...</CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-5" />
          Your Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <TrendingUp className="mr-2 size-4" />
                Deposit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deposit Money</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <Button onClick={handleDeposit} className="w-full">
                  Confirm Deposit
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 bg-transparent">
                <TrendingDown className="mr-2 size-4" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Money</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    max={balance}
                  />
                </div>
                <Button onClick={handleWithdraw} className="w-full">
                  Confirm Withdrawal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
