"use client"

import { useEffect, useState } from "react"
import { Wallet, TrendingUp, TrendingDown, DollarSign, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { apiRequest } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

export function WalletCard() {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchBalance = async () => {
    try {
      setLoading(true)
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
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    try {
      setActionLoading(true)
      await apiRequest("/api/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({ amount, source: "manual" }),
      })

      setDepositAmount("")
      setIsDepositOpen(false)
      await fetchBalance()
      alert("Deposit successful!")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Deposit failed")
      console.error("[v0] Deposit error:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    if (amount > balance) {
      alert("Insufficient balance")
      return
    }

    try {
      setActionLoading(true)
      await apiRequest("/api/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount }),
      })

      setWithdrawAmount("")
      setIsWithdrawOpen(false)
      await fetchBalance()
      alert("Withdrawal successful!")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Withdrawal failed")
      console.error("[v0] Withdrawal error:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const quickAmounts = [10, 50, 100, 500]

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-2">
            <RefreshCw className="size-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading wallet...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-2 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            Your Wallet
          </span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={fetchBalance}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>Manage your account balance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="size-5 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
          </div>
          <p className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ${balance.toFixed(2)}
          </p>
          <Badge variant="secondary" className="mt-3">
            Active Account
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-12" size="lg">
                <TrendingUp className="mr-2 size-4" />
                Deposit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Deposit Money</DialogTitle>
                <DialogDescription>
                  Add funds to your wallet
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount ($)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="text-lg"
                  />
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Quick amounts</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setDepositAmount(amount.toString())}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleDeposit} 
                  className="w-full" 
                  size="lg"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Deposit"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full h-12" size="lg">
                <TrendingDown className="mr-2 size-4" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Withdraw Money</DialogTitle>
                <DialogDescription>
                  Available balance: ${balance.toFixed(2)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount ($)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    max={balance}
                    className="text-lg"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Quick amounts</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setWithdrawAmount(amount.toString())}
                        disabled={amount > balance}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleWithdraw} 
                  className="w-full" 
                  size="lg"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Withdrawal"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Section */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>• Instant deposits and withdrawals</p>
          <p>• Secure transaction processing</p>
          <p>• No hidden fees</p>
        </div>
      </CardContent>
    </Card>
  )
}
