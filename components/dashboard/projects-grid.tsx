import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github, Plus, Star } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  title: string
  description: string | null
  image_url: string | null
  github_url: string | null
  live_url: string | null
  is_featured: boolean
  project_technologies: {
    skills: {
      id: string
      name: string
    }
  }[]
}

interface ProjectsGridProps {
  projects: Project[]
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Projects</h2>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center p-8">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Showcase your work by adding your first project</p>
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Project
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => {
            // Extract unique technologies
            const technologies = project.project_technologies
              ? Array.from(new Set(project.project_technologies.map((item) => item.skills)))
              : []

            return (
              <Card key={project.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      {project.title}
                      {project.is_featured && <Star className="h-4 w-4 text-amber-500" fill="currentColor" />}
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>Edit</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  {project.image_url && (
                    <div className="aspect-video w-full mb-4 rounded-md overflow-hidden">
                      <img
                        src={project.image_url || "/placeholder.svg"}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {project.description || "No description provided"}
                  </p>
                  {technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech.id} variant="outline" className="text-xs">
                          {tech.name}
                        </Badge>
                      ))}
                      {technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{technologies.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex gap-2">
                    {project.github_url && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-1" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {project.live_url && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
