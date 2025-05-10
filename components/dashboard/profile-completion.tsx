"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, ExternalLink } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface ProfileCompletionProps {
  profile: Profile
  className?: string
}

interface CompletionItem {
  id: string
  label: string
  completed: boolean
  link: string
  description: string
}

export function ProfileCompletion({ profile, className = "" }: ProfileCompletionProps) {
  const supabase = createClientComponentClient<Database>()
  const [completionItems, setCompletionItems] = useState<CompletionItem[]>([])
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfileData() {
      if (!profile?.id) return

      try {
        // Fetch user skills
        const { data: userSkills, error: skillsError } = await supabase
          .from("user_skills")
          .select("*")
          .eq("user_id", profile.id)

        if (skillsError) {
          console.error("Error fetching skills:", skillsError)
        }

        // Fetch user projects
        const { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", profile.id)

        if (projectsError) {
          console.error("Error fetching projects:", projectsError)
        }

        // Fetch social links
        const { data: socialLinks, error: socialError } = await supabase
          .from("social_links")
          .select("*")
          .eq("user_id", profile.id)

        if (socialError) {
          console.error("Error fetching social links:", socialError)
        }

        // Create completion items
        const items: CompletionItem[] = [
          {
            id: "avatar",
            label: "Profile Photo",
            completed: !!profile.avatar_url,
            link: "/dashboard/profile",
            description: "Add a profile photo to make your profile more personal",
          },
          {
            id: "basic_info",
            label: "Basic Information",
            completed: !!profile.username && !!profile.full_name,
            link: "/dashboard/profile",
            description: "Add your username and full name",
          },
          {
            id: "bio",
            label: "Bio",
            completed: !!profile.bio && profile.bio.length >= 50,
            link: "/dashboard/profile",
            description: "Write a bio of at least 50 characters",
          },
          {
            id: "location",
            label: "Location",
            completed: !!profile.location,
            link: "/dashboard/profile",
            description: "Add your location to connect with local developers",
          },
          {
            id: "website",
            label: "Website",
            completed: !!profile.website,
            link: "/dashboard/profile",
            description: "Add your personal website or portfolio",
          },
          {
            id: "skills",
            label: "Skills",
            completed: userSkills ? userSkills.length >= 3 : false,
            link: "/dashboard/skills",
            description: "Add at least 3 skills to showcase your expertise",
          },
          {
            id: "projects",
            label: "Projects",
            completed: projects ? projects.length >= 1 : false,
            link: "/dashboard/projects",
            description: "Add at least one project to showcase your work",
          },
          {
            id: "social",
            label: "Social Links",
            completed: socialLinks ? socialLinks.length >= 1 : false,
            link: "/dashboard/social",
            description: "Connect at least one social media account",
          },
        ]

        setCompletionItems(items)

        // Calculate completion percentage
        const completedItems = items.filter((item) => item.completed).length
        const percentage = Math.round((completedItems / items.length) * 100)
        setCompletionPercentage(percentage)
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [profile, supabase])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Profile Completion</CardTitle>
          <CardDescription>Loading your profile status...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // If profile is 100% complete, show a celebration card
  if (completionPercentage === 100) {
    return (
      <Card
        className={`${className} bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-green-700 dark:text-green-400">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Profile Complete!
          </CardTitle>
          <CardDescription>
            Your developer profile is 100% complete. You're ready to connect with other developers!
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Profile Completion</CardTitle>
        <CardDescription>Complete your profile to stand out to other developers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Completion Checklist</h4>
          <ul className="space-y-3">
            {completionItems
              .filter((item) => !item.completed)
              .slice(0, 4) // Show only first 4 incomplete items
              .map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-sm">
                  <Circle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="h-7 px-2">
                    <Link href={item.link}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </li>
              ))}
          </ul>

          {completionItems.filter((item) => !item.completed).length > 4 && (
            <p className="text-xs text-muted-foreground">
              +{completionItems.filter((item) => !item.completed).length - 4} more items to complete
            </p>
          )}

          {completionItems.filter((item) => !item.completed).length === 0 && (
            <p className="text-sm text-muted-foreground">All items completed! Your profile looks great.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
