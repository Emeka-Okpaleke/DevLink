import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Globe, Calendar, Pencil } from "lucide-react"
import Link from "next/link"

interface ProfileOverviewProps {
  profile: {
    username: string
    full_name: string | null
    bio: string | null
    avatar_url: string | null
    website: string | null
    location: string | null
    created_at: string
    is_public: boolean
  }
  className?: string
}

export function ProfileOverview({ profile, className }: ProfileOverviewProps) {
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>Profile</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile/edit">
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
        </div>
        <CardDescription>Your public developer profile</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center pb-2">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarImage
            src={
              profile.avatar_url ||
              `/placeholder.svg?height=80&width=80&query=${profile.username.charAt(0).toUpperCase()}`
            }
            alt={profile.username}
          />
          <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-bold">{profile.full_name || profile.username}</h3>
        <p className="text-sm text-muted-foreground mb-2">@{profile.username}</p>

        {profile.bio && <p className="text-sm mb-4">{profile.bio}</p>}

        <div className="w-full space-y-2 text-sm">
          {profile.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Joined {joinDate}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/profile/${profile.username}`}>View Public Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
