import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { FriendSearch } from "@/components/friend-search"
import { FriendList } from "@/components/friend-list"
import { Users, UserPlus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function FriendsPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Users className="size-8" />
              Friends
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Connect with other players and manage your friends
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="search" className="text-base">
            <UserPlus className="mr-2 size-5" />
            Find Friends
          </TabsTrigger>
          <TabsTrigger value="list" className="text-base">
            <Users className="mr-2 size-5" />
            My Friends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6">
          <FriendSearch />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <FriendList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
