import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, MessageSquare, Star, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ProjectViewsChart } from "@/components/projects/project-views-chart"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface ProjectAnalyticsPageProps {
  params: { id: string }
}

export default async function ProjectAnalyticsPage({ params }: ProjectAnalyticsPageProps) {
  // Don't try to await params.id - use it directly
  const projectId = params.id

  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get the project
  const { data: project, error } = await supabase.from("projects").select("*").eq("id", projectId).single()

  if (error || !project) {
    console.error("Error fetching project:", error)
    notFound()
  }

  // Check if the user owns this project or is an admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
  const isAdmin = profile?.is_admin || false
  const isOwner = project.user_id === user.id

  if (!isOwner && !isAdmin) {
    redirect("/dashboard/projects")
  }

  // Get analytics data
  const { data: viewCount } = await supabase.rpc("get_project_view_count", {
    project_id: projectId,
  })

  const { data: uniqueViewers } = await supabase.rpc("get_project_unique_viewers", {
    project_id: projectId,
  })

  const { data: endorsementCount } = await supabase.rpc("get_project_endorsement_count", {
    project_id: projectId,
  })

  const { count: commentCount } = await supabase
    .from("project_comments")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)

  return (
    <DashboardShell>
      <DashboardHeader heading={`Analytics for ${project.title}`} text="View detailed analytics for your project.">
        <Button asChild variant="outline">
          <Link href={`/dashboard/projects/${projectId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Link>
        </Button>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viewCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Since {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Viewers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueViewers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {viewCount && uniqueViewers
                ? `${Math.round((uniqueViewers / viewCount) * 100)}% return rate`
                : "No views yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Endorsements</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endorsementCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {uniqueViewers && endorsementCount
                ? `${Math.round((endorsementCount / uniqueViewers) * 100)}% conversion rate`
                : "No endorsements yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commentCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {uniqueViewers && commentCount
                ? `${Math.round((commentCount / uniqueViewers) * 100)}% engagement rate`
                : "No comments yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
            <CardDescription>Daily view count for your project</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectViewsChart projectId={projectId} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
