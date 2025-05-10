"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Database } from "@/lib/database.types"
import { formatDistanceToNow } from "date-fns"
import { ExternalLink, Github } from "lucide-react"
import { EndorseButton } from "@/components/projects/endorse-button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

type Project = Database["public"]["Tables"]["projects"]["Row"]

interface ProjectListClientProps {
  projects: Project[]
  showEndorsements?: boolean
}

export function ProjectListClient({ projects, showEndorsements = true }: ProjectListClientProps) {
  const [endorsementData, setEndorsementData] = useState<Record<string, { count: number; isEndorsed: boolean }>>({})
  const [isLoading, setIsLoading] = useState(showEndorsements)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (showEndorsements) {
      const fetchEndorsementData = async () => {
        try {
          // Get the current user
          const {
            data: { user },
          } = await supabase.auth.getUser()

          const endorsements: Record<string, { count: number; isEndorsed: boolean }> = {}

          // For each project, get the endorsement count and check if the current user has endorsed it
          for (const project of projects) {
            const { data: countData } = await supabase.rpc("get_project_endorsement_count", {
              project_id: project.id,
            })

            let isEndorsed = false
            if (user) {
              const { data: endorsedData } = await supabase.rpc("has_user_endorsed_project", {
                project_id: project.id,
                user_id: user.id,
              })
              isEndorsed = endorsedData || false
            }

            endorsements[project.id] = {
              count: countData || 0,
              isEndorsed,
            }
          }

          setEndorsementData(endorsements)
        } catch (error) {
          console.error("Error fetching endorsement data:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchEndorsementData()
    }
  }, [projects, showEndorsements, supabase])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.length > 0 ? (
        projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            endorsementData={showEndorsements && !isLoading ? endorsementData[project.id] : undefined}
          />
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mt-2 text-lg font-semibold">No projects found</h3>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">There are no projects to display.</p>
        </div>
      )}
    </div>
  )
}

function ProjectCard({
  project,
  endorsementData,
}: {
  project: Project
  endorsementData?: { count: number; isEndorsed: boolean }
}) {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>{project.title}</CardTitle>
          <CardDescription>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-24 overflow-hidden text-sm text-muted-foreground">
          {project.description || "No description provided."}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
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
                <ExternalLink className="mr-2 h-4 w-4" />
                Live Demo
              </a>
            </Button>
          )}
        </div>

        {/* Endorsement button */}
        {endorsementData && (
          <EndorseButton
            projectId={project.id}
            initialEndorsementCount={endorsementData.count}
            initialIsEndorsed={endorsementData.isEndorsed}
          />
        )}
      </CardFooter>
    </Card>
  )
}
