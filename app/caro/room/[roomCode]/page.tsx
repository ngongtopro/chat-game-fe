import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { CaroGameRoom } from "@/components/caro-game-room"

export default async function CaroRoomPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  const { roomCode } = await params

  return (
    <div className="container mx-auto max-w-7xl p-4">
      <CaroGameRoom roomCode={roomCode} currentUserId={user.id} currentUsername={user.username} />
    </div>
  )
}
