import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"
import { ChatWindow } from "@/components/chat-window"
import { Card, CardContent } from "@/components/ui/card"

export default async function ChatWithFriendPage({ params }: { params: Promise<{ friendId: string }> }) {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  const { friendId } = await params

  // Get friend details
  const friends = await sql`
    SELECT id, username FROM users WHERE id = ${friendId}
  `

  if (friends.length === 0) {
    redirect("/chat")
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card>
        <CardContent className="p-0">
          <ChatWindow
            friendId={Number.parseInt(friendId)}
            friendUsername={friends[0].username}
            currentUserId={user.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
