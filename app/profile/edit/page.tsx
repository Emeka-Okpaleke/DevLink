import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProfileForm } from "@/components/dashboard/profile-form"

export default async function EditProfilePage() {
  const supabase = await createServerClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Profile" text="Update your profile information." />
      <div className="grid gap-8">
        <ProfileForm profile={profile} />
      </div>
    </DashboardShell>
  )
}
