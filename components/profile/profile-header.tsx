"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface ProfileHeaderProps {
  profile: Profile
  followers: number
  following: number
}

export function ProfileHeader({ profile, followers, following }: ProfileHeaderProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentFollowers, setCurrentFollowers] = useState(followers)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)

  // Check if current user is following this profile
  useState(() => {
    async function checkFollowStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setCurrentUser(user)

        const { data } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", user.id)
          .eq("following_id", profile.id)
          .single()

        setIsFollowing(!!data)
      }
    }

    checkFollowStatus()
  })

  const handleFollowToggle = async () => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
      if (isFollowing) {
        // Unfollow
        await supabase.from("follows").delete().eq("follower_id", currentUser.id).eq("following_id", profile.id)

        setIsFollowing(false)
        setCurrentFollowers((prev) => prev - 1)

        toast({
          title: "Unfollowed",
          description: `You are no longer following ${profile.username}`,
        })
      } else {
        // Follow
        await supabase.from("follows").insert({
          follower_id: currentUser.id,
          following_id: profile.id,
        })

        setIsFollowing(true)
        setCurrentFollowers((prev) => prev + 1)

        toast({
          title: "Following",
          description: `You are now following ${profile.username}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format date for joined date
  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={profile.avatar_url || "/placeholder.svg?height=96&width=96&query=avatar"}
            alt={profile.username}
          />
          <AvatarFallback className="text-2xl">{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h1 className="text-3xl font-bold">{profile.full_name || profile.username}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>

          {profile.bio && <p className="text-lg">{profile.bio}</p>}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {profile.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {profile.location}
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Joined {joinedDate}
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <span>
              <strong>{currentFollowers}</strong> Followers
            </span>
            <span>
              <strong>{following}</strong> Following
            </span>
          </div>
        </div>

        <div>
          {currentUser && currentUser.id !== profile.id && (
            <Button variant={isFollowing ? "outline" : "default"} onClick={handleFollowToggle} disabled={isLoading}>
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
