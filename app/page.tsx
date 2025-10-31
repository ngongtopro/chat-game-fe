import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gamepad2, Users, Wallet, Sprout } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Social Gaming Platform</h1>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-6xl p-4 space-y-12">
        <section className="text-center space-y-4 py-12">
          <h2 className="text-5xl font-bold">Play, Chat, and Earn</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our gaming platform to play exciting games, chat with friends, and earn real money!
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Connect with Friends</h3>
              <p className="text-sm text-muted-foreground">Find and add friends, chat in real-time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Sprout className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Happy Farm</h3>
              <p className="text-sm text-muted-foreground">Plant crops and harvest for money</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Gamepad2 className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Caro Game</h3>
              <p className="text-sm text-muted-foreground">Compete and win 80% of the pot</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Wallet System</h3>
              <p className="text-sm text-muted-foreground">Track earnings and transactions</p>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto p-4 text-center text-sm text-muted-foreground">
          <p>Social Gaming Platform - Play, Chat, Earn</p>
        </div>
      </footer>
    </div>
  )
}
