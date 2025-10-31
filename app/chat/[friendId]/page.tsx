import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { ChatWindow } from "@/components/chat-window"
import { Card, CardContent } from "@/components/ui/card"

export default async function ChatWithFriendPage({ params }: { params: Promise<{ friendId: string }> }) {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  const { friendId } = await params

  // Get friend details from backend API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  let friendData: any = null
  
  try {
    const response = await fetch(`${API_URL}/api/friends/user/${friendId}`)
    
    if (!response.ok) {
      redirect("/chat")
    }
    
    friendData = await response.json()
    
    if (!friendData) {
      redirect("/chat")
    }
  } catch (error) {
    console.error("Error fetching friend details:", error)
    redirect("/chat")
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card>
        <CardContent className="p-0">
          <ChatWindow
            friendId={Number.parseInt(friendId)}
            friendUsername={friendData.username}
            currentUserId={user.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
