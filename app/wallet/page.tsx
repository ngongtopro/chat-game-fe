import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { WalletCard } from "@/components/wallet-card"
import { TransactionHistory } from "@/components/transaction-history"
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function WalletPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Wallet className="size-8" />
              My Wallet
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Manage your balance and view transaction history
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Wallet Card */}
        <div className="lg:col-span-1">
          <WalletCard />
        </div>

        {/* Right Column - Transaction History */}
        <div className="lg:col-span-2">
          <TransactionHistory />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ArrowDownRight className="size-4 text-green-500" />
            <span>Total Deposits</span>
          </div>
          <p className="text-2xl font-bold text-green-600">Coming Soon</p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ArrowUpRight className="size-4 text-red-500" />
            <span>Total Withdrawals</span>
          </div>
          <p className="text-2xl font-bold text-red-600">Coming Soon</p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <TrendingUp className="size-4 text-blue-500" />
            <span>Net Earnings</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">Coming Soon</p>
        </div>
      </div>
    </div>
  )
}
