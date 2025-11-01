"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gamepad2, Users, Wallet, Sprout } from "lucide-react"
import { isAuthenticated } from "@/lib/auth-client"

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
    console.log("User is logged in:", isAuthenticated())
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Nền tảng game xã hội</h1>
          <div className="flex gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button>Vào Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Đăng nhập</Button>
                </Link>
                <Link href="/register">
                  <Button>Đăng ký</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-6xl p-4 space-y-12">
        <section className="text-center space-y-4 py-12">
          <h2 className="text-5xl font-bold">Chơi và tán gẫu</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tham gia vui chơi, trò chuyện.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg">Vào Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg">Bắt đầu</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Đăng nhập
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Kết nối bạn bè</h3>
              <p className="text-sm text-muted-foreground">Trò chuyện cùng bạn bè</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Sprout className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Nông trại vui vẻ</h3>
              <p className="text-sm text-muted-foreground">Trồng trọt và thu hoạch để kiếm tiền chơi game</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Gamepad2 className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Cờ caro</h3>
              <p className="text-sm text-muted-foreground">Cạnh tranh và giành 80% số tiền cược</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Hệ thống ví</h3>
              <p className="text-sm text-muted-foreground">Theo dõi thu nhập và giao dịch</p>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto p-4 text-center text-sm text-muted-foreground">
          <p>Nền tảng game xã hội - Chơi, Tán gẫu, Kiếm tiền</p>
        </div>
      </footer>
    </div>
  )
}
