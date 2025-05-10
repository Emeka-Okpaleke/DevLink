import { createServerClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default async function DevelopersPage() {
  const supabase = await createServerClient()

  // Fetch public profiles
  const { data: developers } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio, location")
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Discover Developers</h1>
        <p className="text-xl text-muted-foreground text-center max-w-2xl mb-8">
          Connect with talented developers from around the world and explore their projects
        </p>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search developers by name or location..." className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developers && developers.length > 0 ? (
          developers.map((developer) => (
            <Card key={developer.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={developer.avatar_url || ""} alt={developer.full_name || developer.username} />
                    <AvatarFallback>{developer.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold">{developer.full_name || developer.username}</h3>
                  <p className="text-sm text-muted-foreground mb-2">@{developer.username}</p>
                  {developer.location && <p className="text-sm text-muted-foreground mb-4">{developer.location}</p>}
                  <p className="line-clamp-3 text-sm">{developer.bio || "This developer hasn't added a bio yet."}</p>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-3">
                <Button asChild variant="secondary" className="w-full">
                  <Link href={`/profile/${developer.username}`}>View Profile</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-muted-foreground">No developers found. Be the first to join!</p>
          </div>
        )}
      </div>
    </div>
  )
}
