import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Eye, Github, Globe, Star, BarChart3 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ProjectEditForm } from "@/components/projects/project-edit-form"
import { ProjectDeleteButton } from "@/components/projects/project-delete-button"
import { ProjectComments } from "@/components/projects/project-comments"
import { RelatedDevelopers } from "@/components/projects/related-developers"
import { ProjectAnalytics } from "@/components/projects/project-analytics"
import { ProjectTags } from "@/components/projects/project-tags"
import { ProjectShareButtons } from "@/components/projects/project-share-buttons"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface ProjectPageProps {
  params: { id: string }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
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

  // Get the project with endorsement count
  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      *,
      profiles:user_id (username, avatar_url, full_name),
      project_technologies (
        skills (id, name)
      )
    `)
    .eq("id", projectId)
    .single()

  if (error || !project) {
    console.error("Error fetching project:", error)
    notFound()
  }

  // Get endorsement count
  const { data: endorsementCount } = await supabase.rpc("get_project_endorsement_count", {
    project_id: projectId,
  })

  // Check if the user has endorsed this project
  const { data: hasEndorsed } = await supabase.rpc("has_user_endorsed_project", {
    project_id: projectId,
    user_id: user.id,
  })

  // Check if the user owns this project
  const isOwner = project.user_id === user.id

  // Check if the user is an admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  const isAdmin = profile?.is_admin || false

  // Only owners and admins can edit
  const canEdit = isOwner || isAdmin

  // Extract skills from project_technologies
  const projectSkills = project.project_technologies?.map((tech) => tech.skills) || []

  return (
    <DashboardShell>
      <DashboardHeader heading={project.title} text="View and manage your project.">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          {canEdit && (
            <Button asChild variant="outline">
              <Link href={`/dashboard/projects/${projectId}/analytics`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Detailed Analytics
              </Link>
            </Button>
          )}
          {canEdit && <ProjectDeleteButton projectId={projectId} />}
        </div>
      </DashboardHeader>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="relative pb-0">
              {project.is_featured && (
                <Badge className="absolute right-6 top-6" variant="secondary">
                  Featured
                </Badge>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Eye className="h-4 w-4" />
                  <span>123 views</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Star className="h-4 w-4" />
                  <span>{endorsementCount || 0} endorsements</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {project.image_url && (
                <div className="mb-6">
                  <img
                    src={project.image_url || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-[300px] object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="prose max-w-none">
                <p className="text-lg">{project.description}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {projectSkills.map((skill) => (
                  <Badge key={skill.id} variant="outline">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div className="flex gap-2">
                {project.github_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
                {project.live_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <ProjectShareButtons projectId={projectId} projectTitle={project.title} />
              </div>
            </CardFooter>
          </Card>

          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments">Comments</TabsTrigger>
              {canEdit && <TabsTrigger value="edit">Edit Project</TabsTrigger>}
            </TabsList>
            <TabsContent value="comments" className="mt-4">
              <ProjectComments projectId={projectId} />
            </TabsContent>
            {canEdit && (
              <TabsContent value="edit" className="mt-4">
                <ProjectEditForm project={project} projectSkills={projectSkills} />
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img
                  src={project.profiles.avatar_url || "/placeholder.svg?height=50&width=50&query=avatar"}
                  alt={project.profiles.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium">{project.profiles.full_name}</h3>
                  <p className="text-sm text-muted-foreground">@{project.profiles.username}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/profile/${project.profiles.username}`}>View Profile</Link>
              </Button>
            </CardFooter>
          </Card>

          <ProjectAnalytics projectId={projectId} />

          <ProjectTags projectId={projectId} canEdit={canEdit} />

          <RelatedDevelopers projectSkills={projectSkills} currentUserId={user.id} />
        </div>
      </div>
    </DashboardShell>
  )
}
