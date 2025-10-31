import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { ConversationList } from "@/components/conversation-list"
import { MessageSquare, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default async function ChatPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Conversation List */}
      <div className="w-full md:w-96 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="size-6" />
              Messages
            </h1>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-hidden">
          <ConversationList />
        </div>
      </div>

      {/* Main Content - Empty State */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-muted/20">
        <div className="text-center space-y-4 p-8">
          <MessageSquare className="size-20 mx-auto text-muted-foreground/50" />
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Select a conversation
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Choose a conversation from the list to start messaging
          </p>
        </div>
      </div>
    </div>
  )
}
