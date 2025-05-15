"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProjectsSection } from "@/components/profile/projects-section"
import { SkillsSection } from "@/components/profile/skills-section"
import { SocialLinks } from "@/components/profile/social-links"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function ClientProfilePage({ username }: { username: string }) {
  const { supabase } = useSupabase()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .eq("is_public", true)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          setError("Could not load profile. Please try again later.")
          return
        }

        if (!data) {
          setError("Profile not found or is private.")
          return
        }

        setProfile(data)
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchProfile()
    }
  }, [username, supabase])

  if (loading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-4 flex-1">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="space-y-8">
        <ProfileHeader profile={profile} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <ProjectsSection userId={profile.id} />
            <SkillsSection userId={profile.id} />
          </div>
          <div>
            <SocialLinks profile={profile} />
          </div>
        </div>
      </div>
    </div>
  )
}
