import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { ConversationList } from "@/components/conversation-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ChatPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      <h1 className="text-3xl font-bold">Messages</h1>

      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <ConversationList />
        </CardContent>
      </Card>
    </div>
  )
}
