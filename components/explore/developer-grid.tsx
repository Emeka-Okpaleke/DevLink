import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

interface Developer {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  location: string | null
  user_skills: {
    skills: {
      id: string
      name: string
    }
  }[]
}

interface DeveloperGridProps {
  developers: Developer[]
}

export function DeveloperGrid({ developers }: DeveloperGridProps) {
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
      {developers.map((developer) => {
        // Extract unique skills
        const skills = developer.user_skills
          ? Array.from(new Set(developer.user_skills.map((item) => item.skills.name)))
          : []

        return (
          <Card key={developer.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={developer.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
                    alt={developer.username}
                  />
                  <AvatarFallback>{developer.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg leading-none">{developer.full_name || developer.username}</h3>
                  <p className="text-sm text-muted-foreground">@{developer.username}</p>
                  {developer.location && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {developer.location}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              {developer.bio ? (
                <p className="text-sm line-clamp-3">{developer.bio}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No bio provided</p>
              )}
              <div className="mt-4 flex flex-wrap gap-1">
                {skills.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{skills.length - 5} more
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/profile/${developer.username}`}>View Profile</Link>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
