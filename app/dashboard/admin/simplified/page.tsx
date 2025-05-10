import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft, Shield, Users, Code, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SimplifiedUserManagement } from "@/components/dashboard/simplified-user-management"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SimplifiedAdminPage() {
  const supabase = await createServerClient()

  try {
    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      redirect("/login")
    }

    console.log("Current user ID:", user.id)

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin, username, full_name")
      .eq("id", user.id)
      .maybeSingle()

    console.log("Profile query result:", { profile, profileError })

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

    // Get some basic stats for the admin dashboard
    const { count: userCount, error: userCountError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    const { count: projectCount, error: projectCountError } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })

    const { count: skillCount, error: skillCountError } = await supabase
      .from("skills")
      .select("*", { count: "exact", head: true })

    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome, {profile.full_name || profile.username || "Admin"}. Manage your platform here.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Admin Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userCount || "N/A"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectCount || "N/A"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{skillCount || "N/A"}</div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard/admin/skills">
                  <Code className="mr-2 h-4 w-4" />
                  Manage Skills
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/admin/simplified">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Simplified User Management */}
          <SimplifiedUserManagement />
        </div>
      </DashboardShell>
    )
  } catch (error: any) {
    console.error("Admin page error:", error)
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
