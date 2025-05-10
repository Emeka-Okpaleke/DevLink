import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SkillsManager } from "@/components/dashboard/skills-manager"

export default async function SkillsPage() {
  const supabase = await createServerClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user skills
  const { data: userSkills, error } = await supabase
    .from("user_skills")
    .select(`
      skill_id,
      skills(*)
    `)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error fetching user skills:", error)
  }

  // Safely extract skills with proper null checks
  const skills = userSkills ? userSkills.filter((item) => item.skills !== null).map((item) => item.skills) : []

  console.log(`Fetched ${skills.length} skills for user ${user.id}`)

  return (
    <DashboardShell>
      <DashboardHeader heading="Manage Skills" text="Add or remove skills to showcase your technical expertise." />
      <div className="grid gap-8">
        <SkillsManager currentSkills={skills} />
      </div>
    </DashboardShell>
  )
}
