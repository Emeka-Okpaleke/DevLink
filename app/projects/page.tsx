import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, Github } from "lucide-react"
import Link from "next/link"

export default async function ProjectsPage() {
  const supabase = createServerClient()

  // Fetch public projects with user info
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("profiles.is_public", true)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Explore Projects</h1>
        <p className="text-xl text-muted-foreground text-center max-w-2xl">
          Discover projects built by talented developers in the DevLink community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={project.profiles.avatar_url || ""}
                      alt={project.profiles.full_name || project.profiles.username}
                    />
                    <AvatarFallback>{project.profiles.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/profile/${project.profiles.username}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {project.profiles.full_name || project.profiles.username}
                    </Link>
                  </div>
                </div>
                <CardTitle>{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">
                  {project.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter className="flex gap-4 border-t pt-4">
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
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-muted-foreground">No projects found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
