import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProfileOverview } from "@/components/dashboard/profile-overview"
import { ProjectsOverview } from "@/components/dashboard/projects-overview"
import { SkillsOverview } from "@/components/dashboard/skills-overview"
import { SocialOverview } from "@/components/dashboard/social-overview"
import { StatsCards } from "@/components/dashboard/stats-cards"
// Remove the ProfileCompletion import for now to isolate the issue
import { ProfileCompletion } from "@/components/dashboard/profile-completion"
import Link from "next/link"
import { Shield, Code, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  try {
    const supabase = await createServerClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      redirect("/login")
    }

    // Fetch user profile with better error handling
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    // Handle profile not found
    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return (
        <DashboardShell>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was an error loading your profile: {profileError.message || "Unknown error"}
            </AlertDescription>
          </Alert>
        </DashboardShell>
      )
    }

    // If profile doesn't exist, create one
    if (!profile) {
      console.log("Profile not found, creating new profile")
      // Generate a username from email or random string
      const username = user.email?.split("@")[0] || `user_${Math.floor(Math.random() * 10000)}`

      try {
        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            is_public: true,
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) {
          console.error("Error creating profile:", createError)
          return (
            <DashboardShell>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was an error creating your profile. Please try again later or contact support.
                </AlertDescription>
              </Alert>
            </DashboardShell>
          )
        }

        // Use the newly created profile
        return await renderDashboard(supabase, user.id, newProfile)
      } catch (createProfileError) {
        console.error("Error in profile creation:", createProfileError)
        return (
          <DashboardShell>
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was an error setting up your profile. Please try again later or contact support.
              </AlertDescription>
            </Alert>
          </DashboardShell>
        )
      }
    }

    // If profile exists, render dashboard with it
    return await renderDashboard(supabase, user.id, profile)
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <DashboardShell>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>An unexpected error occurred. Please try again later or contact support.</AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }
}

// Helper function to render dashboard with profile data
async function renderDashboard(supabase, userId, profile) {
  try {
    // Fetch user projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select(`
        *,
        project_technologies(
          skills(*)
        )
      `)
      .eq("user_id", userId)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3)

    if (projectsError) {
      console.error("Error fetching projects:", projectsError)
    }

    // Fetch user skills
    const { data: userSkills, error: skillsError } = await supabase
      .from("user_skills")
      .select(`
        skills(*)
      `)
      .eq("user_id", userId)

    if (skillsError) {
      console.error("Error fetching skills:", skillsError)
    }

    // Fetch user social links
    const { data: socialLinks, error: socialError } = await supabase
      .from("social_links")
      .select("*")
      .eq("user_id", userId)

    if (socialError) {
      console.error("Error fetching social links:", socialError)
    }

    // Get follower count
    const { count: followerCount, error: followerError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId)

    if (followerError) {
      console.error("Error fetching follower count:", followerError)
    }

    // Get following count
    const { count: followingCount, error: followingError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId)

    if (followingError) {
      console.error("Error fetching following count:", followingError)
    }

    // Check if user is admin
    const isAdmin = profile?.is_admin || false

    return (
      <DashboardShell>
        <DashboardHeader heading="Dashboard" text="Welcome back! Here's an overview of your developer profile." />

        <div className="grid gap-6">
          {isAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-semibold text-amber-800 flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Admin Access
              </h2>
              <p className="text-amber-700 mb-3">You have administrator privileges. Access admin features below:</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="bg-white">
                  <Link href="/dashboard/admin/skills">
                    <Code className="mr-2 h-4 w-4" />
                    Manage Skills
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-white">
                  <Link href="/dashboard/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <StatsCards
            projectCount={projects?.length || 0}
            skillCount={userSkills?.length || 0}
            followerCount={followerCount || 0}
            followingCount={followingCount || 0}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ProfileOverview profile={profile} className="md:col-span-2 lg:col-span-1" />
            <ProjectsOverview projects={projects || []} className="md:col-span-2" />
            {/* Removed ProfileCompletion component for now */}
            <ProfileCompletion profile={profile} className="md:col-span-2 lg:col-span-3" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SkillsOverview skills={userSkills?.map((item) => item.skills) || []} />
            <SocialOverview socialLinks={socialLinks || []} />
          </div>
        </div>
      </DashboardShell>
    )
  } catch (error) {
    console.error("Error rendering dashboard:", error)
    return (
      <DashboardShell>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error loading your dashboard. Please try again later or contact support.
          </AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }
}
