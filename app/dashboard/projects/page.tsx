import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { ProjectList } from "@/components/dashboard/project-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProjectsPage() {
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

    // Fetch user projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select(`
        *,
        project_technologies(
          skills(*)
        ),
        project_endorsements(count)
      `)
      .eq("user_id", user.id)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })

    if (projectsError) {
      console.error("Error fetching projects:", projectsError)
      return (
        <DashboardShell>
          <DashboardHeader heading="Projects" text="Manage your portfolio projects.">
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          </DashboardHeader>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>There was an error loading your projects. Please try again later.</AlertDescription>
          </Alert>
        </DashboardShell>
      )
    }

    return (
      <DashboardShell>
        <DashboardHeader heading="Projects" text="Manage your portfolio projects.">
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </DashboardHeader>

        {projects && projects.length > 0 ? (
          <ProjectList projects={projects} showActions={true} />
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <h3 className="mt-4 text-lg font-semibold">No projects created</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                You haven&apos;t created any projects yet. Add one to showcase your work.
              </p>
              <Button asChild>
                <Link href="/dashboard/projects/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DashboardShell>
    )
  } catch (error) {
    console.error("Projects page error:", error)
    return (
      <DashboardShell>
        <DashboardHeader heading="Projects" text="Manage your portfolio projects.">
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </DashboardHeader>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>An unexpected error occurred. Please try again later.</AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }
}
