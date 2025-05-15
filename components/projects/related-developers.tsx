"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface RelatedDevelopersProps {
  projectSkills: any[]
  currentUserId: string
}

interface Developer {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  skills: string[]
}

export function RelatedDevelopers({ projectSkills, currentUserId }: RelatedDevelopersProps) {
  const supabase = createClientComponentClient<Database>()
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedDevelopers = async () => {
      if (!projectSkills.length) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        // Get skill IDs
        const skillIds = projectSkills.map((skill) => skill.id)

        // Find developers with similar skills
        const { data, error } = await supabase
          .from("user_skills")
          .select(`
            profiles:user_id (
              id, 
              username, 
              full_name, 
              avatar_url
            ),
            skills (
              id,
              name
            )
          `)
          .in("skill_id", skillIds)
          .not("user_id", "eq", currentUserId)

        if (error) throw error

        // Group by developer and count matching skills
        const developerMap = new Map<
          string,
          {
            developer: any
            skills: Set<string>
            matchCount: number
          }
        >()

        data?.forEach((item) => {
          const developer = item.profiles
          const skill = item.skills

          if (!developer || !skill) return

          if (!developerMap.has(developer.id)) {
            developerMap.set(developer.id, {
              developer,
              skills: new Set([skill.name]),
              matchCount: 1,
            })
          } else {
            const entry = developerMap.get(developer.id)!
            entry.skills.add(skill.name)
            entry.matchCount++
          }
        })

        // Convert to array and sort by match count
        const developersArray = Array.from(developerMap.values())
          .map(({ developer, skills, matchCount }) => ({
            ...developer,
            skills: Array.from(skills),
            matchCount,
          }))
          .sort((a, b) => b.matchCount - a.matchCount)
          .slice(0, 5) // Limit to 5 developers

        setDevelopers(developersArray)
      } catch (error) {
        console.error("Error fetching related developers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedDevelopers()
  }, [projectSkills, currentUserId, supabase])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Related Developers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!developers.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Related Developers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No related developers found with similar skills.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Developers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {developers.map((developer) => (
            <div key={developer.id} className="flex items-center gap-3">
              <img
                src={developer.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
                alt={developer.username}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{developer.full_name || developer.username}</h4>
                <p className="text-xs text-muted-foreground truncate">{developer.skills.join(", ")}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                <Link href={`/profile/${developer.username}`}>View</Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
