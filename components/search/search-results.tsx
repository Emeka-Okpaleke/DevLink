import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

interface Developer {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  skills: Array<{ id: string; name: string }>
}

interface SearchResultsProps {
  developers: Developer[]
}

export function SearchResults({ developers }: SearchResultsProps) {
  if (developers.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No developers found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {developers.map((developer) => (
        <Card key={developer.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarImage
                  src={
                    developer.avatar_url ||
                    `/placeholder.svg?height=80&width=80&query=${developer.username.charAt(0).toUpperCase()}`
                  }
                  alt={developer.full_name || developer.username}
                />
                <AvatarFallback>{developer.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{developer.full_name || developer.username}</h3>
              <p className="text-sm text-muted-foreground mb-2">@{developer.username}</p>

              {developer.location && (
                <div className="flex items-center justify-center text-sm text-muted-foreground mb-3">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{developer.location}</span>
                </div>
              )}

              <p className="line-clamp-2 text-sm mb-4">{developer.bio || "This developer hasn't added a bio yet."}</p>

              <div className="flex flex-wrap justify-center gap-1 mb-4">
                {developer.skills.slice(0, 5).map((skill) => (
                  <Badge key={skill.id} variant="secondary" className="text-xs">
                    {skill.name}
                  </Badge>
                ))}
                {developer.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{developer.skills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 px-6 py-3">
            <Button asChild variant="secondary" className="w-full">
              <Link href={`/profile/${developer.username}`}>View Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
