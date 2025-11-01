"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Wallet, Sprout, Gamepad2, MessageCircle } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Chào mừng bạn!</h1>
          <p className="text-muted-foreground">Chọn điều bạn muốn làm</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Bạn bè
            </CardTitle>
            <CardDescription>Tìm và trò chuyện với bạn bè</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/friends">
              <Button className="w-full">Quản lý bạn bè</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="size-5" />
              Tin nhắn
            </CardTitle>
            <CardDescription>Trò chuyện với bạn bè của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/chat">
              <Button className="w-full">Mở trò chuyện</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5" />
              Ví
            </CardTitle>
            <CardDescription>Quản lý tiền của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/wallet">
              <Button className="w-full">Xem ví</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="size-5" />
              Nông trại vui vẻ
            </CardTitle>
            <CardDescription>Trồng và thu hoạch cây trồng</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/farm">
              <Button className="w-full">Đi đến Nông trại</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="size-5" />
              Game Caro
            </CardTitle>
            <CardDescription>Chơi và giành chiến thắng</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/caro">
              <Button className="w-full">Chơi cờ Caro</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  )
}
