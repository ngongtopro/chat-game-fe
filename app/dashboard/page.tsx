import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Wallet, Sprout, Gamepad2, MessageCircle } from "lucide-react"

export default async function DashboardPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.username}!</h1>
        <p className="text-muted-foreground">Choose what you'd like to do</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Friends
            </CardTitle>
            <CardDescription>Find and chat with friends</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/friends">
              <Button className="w-full">Manage Friends</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="size-5" />
              Messages
            </CardTitle>
            <CardDescription>Chat with your friends</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/chat">
              <Button className="w-full">Open Chat</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5" />
              Wallet
            </CardTitle>
            <CardDescription>Manage your money</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/wallet">
              <Button className="w-full">View Wallet</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="size-5" />
              Happy Farm
            </CardTitle>
            <CardDescription>Plant and harvest crops</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/farm">
              <Button className="w-full">Go to Farm</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="size-5" />
              Caro Game
            </CardTitle>
            <CardDescription>Play and win money</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/caro">
              <Button className="w-full">Play Caro</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
