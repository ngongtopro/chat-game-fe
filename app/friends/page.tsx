import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { FriendSearch } from "@/components/friend-search"
import { FriendList } from "@/components/friend-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function FriendsPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      <h1 className="text-3xl font-bold">Friends</h1>

      <Card>
        <CardHeader>
          <CardTitle>Find Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <FriendSearch />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <FriendList />
        </CardContent>
      </Card>
    </div>
  )
}
