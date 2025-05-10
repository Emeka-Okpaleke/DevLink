import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Database, FileCode2 } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminDashboardPage() {
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

    // Fetch some basic stats for the admin dashboard
    const [usersCount, projectsCount, skillsCount] = await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .then(({ count }) => count || 0),
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .then(({ count }) => count || 0),
      supabase
        .from("skills")
        .select("*", { count: "exact", head: true })
        .then(({ count }) => count || 0),
    ])

    return (
      <DashboardShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your platform and monitor key metrics.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usersCount}</div>
                <p className="text-xs text-muted-foreground">Registered users on the platform</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FileCode2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectsCount}</div>
                <p className="text-xs text-muted-foreground">Projects created by users</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skills/Technologies</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{skillsCount}</div>
                <p className="text-xs text-muted-foreground">Available skills in the system</p>
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View, edit, and manage user accounts. Toggle admin status and profile visibility.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/dashboard/admin/users">Manage Users</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Skills Management</CardTitle>
                <CardDescription>Manage available skills and technologies</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or remove skills and technologies that users can add to their profiles.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/dashboard/admin/skills">Manage Skills</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>View platform usage statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor platform metrics, user engagement, and growth trends over time.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/dashboard/admin/analytics">View Analytics</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </DashboardShell>
    )
  } catch (error: any) {
    console.error("Admin dashboard error:", error)
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
