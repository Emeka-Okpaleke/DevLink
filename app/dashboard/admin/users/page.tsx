import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AdminUserManagement } from "@/components/dashboard/admin-user-management"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminUsersPage() {
  try {
    // Use await with createServerClient since it's now an async function
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

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return (
        <DashboardShell>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was an error checking your permissions: {profileError.message || "Unknown error"}
            </AlertDescription>
          </Alert>
        </DashboardShell>
      )
    }

    // If profile is null, it means the user doesn't have a profile yet
    if (!profile) {
      return (
        <DashboardShell>
          <Alert variant="destructive">
            <AlertTitle>Profile Not Found</AlertTitle>
            <AlertDescription>
              Your user profile could not be found. Please complete your profile setup first.
            </AlertDescription>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </Alert>
        </DashboardShell>
      )
    }

    if (!profile.is_admin) {
      return (
        <DashboardShell>
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
            <p className="text-muted-foreground">You do not have permission to access this page.</p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </DashboardShell>
      )
    }

    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground">Manage user accounts and permissions across the platform.</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin Dashboard
              </Link>
            </Button>
          </div>
          <AdminUserManagement />
        </div>
      </DashboardShell>
    )
  } catch (error: any) {
    console.error("Admin users page error:", error)
    return (
      <DashboardShell>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>An unexpected error occurred: {error.message || "Unknown error"}</AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }
}
