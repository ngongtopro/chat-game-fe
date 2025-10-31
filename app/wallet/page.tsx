import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { WalletCard } from "@/components/wallet-card"
import { TransactionHistory } from "@/components/transaction-history"

export default async function WalletPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      <h1 className="text-3xl font-bold">Wallet</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <WalletCard />
        <TransactionHistory />
      </div>
    </div>
  )
}
