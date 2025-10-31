import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { FarmGrid } from "@/components/farm-grid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function FarmPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Happy Farm</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Farm (10x10)</CardTitle>
        </CardHeader>
        <CardContent>
          <FarmGrid userId={user.id} />
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>Click empty slots to plant seeds</p>
            <p>Yellow slots are growing - wait for them to be ready</p>
            <p>Green pulsing slots are ready to harvest - click to collect money!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
