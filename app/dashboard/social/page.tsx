import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SocialLinksManager } from "@/components/dashboard/social-links-manager"

export default async function SocialLinksPage() {
  const supabase = await createServerClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Social Links" text="Manage your social media profiles and online presence." />
      <div className="grid gap-8">
        <SocialLinksManager userId={user.id} />
      </div>
    </DashboardShell>
  )
}
