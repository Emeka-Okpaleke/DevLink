import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Developer {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
}

interface FeaturedDevelopersProps {
  developers: Developer[]
}

export function FeaturedDevelopers({ developers }: FeaturedDevelopersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {developers.length > 0 ? (
        developers.map((developer) => (
          <Card key={developer.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={developer.avatar_url || ""} alt={developer.full_name || developer.username} />
                  <AvatarFallback>{developer.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold">{developer.full_name || developer.username}</h3>
                <p className="text-sm text-muted-foreground mb-4">@{developer.username}</p>
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
  )
}
