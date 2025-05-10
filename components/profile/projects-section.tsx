import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github } from "lucide-react"

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

interface ProjectsSectionProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No projects to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Projects</h2>
      <div className="space-y-6">
        {projects.map((project) => {
          // Extract unique technologies
          const technologies = project.project_technologies
            ? Array.from(new Set(project.project_technologies.map((item) => item.skills.name)))
            : []

          return (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{project.title}</CardTitle>
                  {project.is_featured && <Badge variant="secondary">Featured</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.image_url && (
                  <div className="aspect-video w-full rounded-md overflow-hidden">
                    <img
                      src={project.image_url || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {project.description && <p>{project.description}</p>}

                {technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {project.github_url && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-1 h-4 w-4" />
                        GitHub
                      </Link>
                    </Button>
                  )}
                  {project.live_url && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={project.live_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-4 w-4" />
                        Live Demo
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
