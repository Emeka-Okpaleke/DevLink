"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, ExternalLink } from "lucide-react"
import { FollowButton } from "@/components/profile/follow-button"
import { MessageButton } from "@/components/profile/message-button"
import { formatDistanceToNow } from "date-fns"

interface ProfileHeaderProps {
  profile: {
    id: string
    username: string
    full_name: string | null
    bio: string | null
    avatar_url: string | null
    website: string | null
    location: string | null
    created_at: string
  }
  isCurrentUser: boolean
  isFollowing: boolean
  followersCount: number
  followingCount: number
}

export function ProfileHeader({
  profile,
  isCurrentUser,
  isFollowing,
  followersCount,
  followingCount,
}: ProfileHeaderProps) {
  const [optimisticIsFollowing, setOptimisticIsFollowing] = useState(isFollowing)
  const [optimisticFollowersCount, setOptimisticFollowersCount] = useState(followersCount)

  const handleFollowToggle = (newFollowState: boolean) => {
    setOptimisticIsFollowing(newFollowState)
    setOptimisticFollowersCount((prev) => (newFollowState ? prev + 1 : prev - 1))
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={
                profile.avatar_url ||
                `/placeholder.svg?height=96&width=96&query=${profile.username.charAt(0).toUpperCase()}`
              }
              alt={profile.username}
            />
            <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              <div className="flex items-center gap-2">
                {!isCurrentUser && (
                  <>
                    <FollowButton
                      userId={profile.id}
                      isFollowing={optimisticIsFollowing}
                      onFollowToggle={handleFollowToggle}
                    />
                    <MessageButton userId={profile.id} />
                  </>
                )}
              </div>
            </div>

            {profile.bio && <p className="text-sm">{profile.bio}</p>}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Website</span>
                </a>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold">{optimisticFollowersCount}</span>{" "}
                <span className="text-muted-foreground">Followers</span>
              </div>
              <div>
                <span className="font-semibold">{followingCount}</span>{" "}
                <span className="text-muted-foreground">Following</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
