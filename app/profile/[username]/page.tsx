import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProjectsSection } from "@/components/profile/projects-section"
import { SkillsSection } from "@/components/profile/skills-section"
import { SocialLinks } from "@/components/profile/social-links"

export default async function ProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const supabase = await createServerClient()

  // Get profile by username
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .eq("is_public", true)
    .single()

  if (!profile) {
    notFound()
  }

  // Get user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      project_technologies (
        skills (*)
      )
    `)
    .eq("user_id", profile.id)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })

  // Get user's skills
  const { data: skills } = await supabase.from("user_skills").select("skills (*)").eq("user_id", profile.id)

  // Get user's social links
  const { data: socialLinks } = await supabase.from("social_links").select("*").eq("user_id", profile.id)

  // Get follower count
  const { data: followers } = await supabase
    .from("follows")
    .select("count", { count: "exact" })
    .eq("following_id", profile.id)

  // Get following count
  const { data: following } = await supabase
    .from("follows")
    .select("count", { count: "exact" })
    .eq("follower_id", profile.id)

  return (
    <div className="container mx-auto py-8">
      <ProfileHeader profile={profile} followers={followers?.[0]?.count || 0} following={following?.[0]?.count || 0} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <ProjectsSection projects={projects || []} />
        </div>
        <div className="space-y-8">
          <SkillsSection skills={skills?.map((item) => item.skills) || []} />
          <SocialLinks links={socialLinks || []} website={profile.website} />
        </div>
      </div>
    </div>
  )
}
