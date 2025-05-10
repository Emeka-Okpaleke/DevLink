import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { EndorseButton } from "@/components/projects/endorse-button"

interface Project {
  id: string
  title: string
  description: string | null
  image_url: string | null
  github_url: string | null
  live_url: string | null
  is_featured: boolean
}

interface ProjectsOverviewProps {
  projects: Project[]
  className?: string
}

export function ProjectsOverview({ projects, className }: ProjectsOverviewProps) {
  return (
    <Card className={cn("col-span-2", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Your recent projects.</CardDescription>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <h3 className="mt-4 text-lg font-semibold">No projects</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                You haven&apos;t created any projects yet. Add one to showcase your work.
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/projects/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-center justify-between space-x-4">
                <div className="space-y-1">
                  <p className="font-medium leading-none">{project.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {project.description || "No description provided"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <EndorseButton projectId={project.id} />
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard/projects">View All Projects</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
