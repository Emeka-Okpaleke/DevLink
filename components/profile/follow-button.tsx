"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
  profileId: string
  isFollowing: boolean
  className?: string
}

export function FollowButton({ profileId, isFollowing, className }: FollowButtonProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const handleFollow = async () => {
    setIsLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/login")
        return
      }

      if (following) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", session.user.id)
          .eq("following_id", profileId)

        if (error) throw error

        setFollowing(false)
        toast({
          description: "You have unfollowed this user",
        })
      } else {
        // Follow
        const { error } = await supabase.from("follows").insert({
          follower_id: session.user.id,
          following_id: profileId,
        })

        if (error) throw error

        setFollowing(true)
        toast({
          description: "You are now following this user",
        })
      }

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was a problem with your request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={following ? "outline" : "default"}
      onClick={handleFollow}
      disabled={isLoading}
      className={className}
    >
      {following ? "Unfollow" : "Follow"}
    </Button>
  )
}
