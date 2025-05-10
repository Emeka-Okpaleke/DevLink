import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AdminSkillsManagement } from "../../admin-skills-management"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminSkillsPage() {
  const supabase = await createServerClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (profileError) {
    return (
      <DashboardShell>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>There was an error checking your permissions: {profileError.message}</AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }

  // Redirect if not admin
  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  // Fetch all skills with usage statistics
  const { data: skills, error: skillsError } = await supabase.from("skills").select("*").order("name")

  if (skillsError) {
    return (
      <DashboardShell>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>There was an error fetching skills: {skillsError.message}</AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }

  // Get usage statistics for each skill
  const skillsWithStats = await Promise.all(
    skills.map(async (skill) => {
      // Count users with this skill
      const { count: userCount, error: userCountError } = await supabase
        .from("user_skills")
        .select("*", { count: "exact", head: true })
        .eq("skill_id", skill.id)

      // Count projects with this skill
      const { count: projectCount, error: projectCountError } = await supabase
        .from("project_technologies")
        .select("*", { count: "exact", head: true })
        .eq("skill_id", skill.id)

      return {
        ...skill,
        userCount: userCount || 0,
        projectCount: projectCount || 0,
      }
    }),
  )

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Manage Skills"
        text="Add, edit, or remove skills and technologies available on the platform."
      />
      <AdminSkillsManagement skills={skillsWithStats} />
    </DashboardShell>
  )
}
