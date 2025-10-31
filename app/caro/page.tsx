import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CaroLobby } from "@/components/caro-lobby"

export default async function CaroPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <h1 className="text-3xl font-bold">Caro Game</h1>

      <Card>
        <CardHeader>
          <CardTitle>Game Lobby</CardTitle>
        </CardHeader>
        <CardContent>
          <CaroLobby />
        </CardContent>
      </Card>
    </div>
  )
}
