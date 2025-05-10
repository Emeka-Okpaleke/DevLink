"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { Eye, Star, MessageSquare, BarChart3, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProjectAnalyticsProps {
  projectId: string
}

export function ProjectAnalytics({ projectId }: ProjectAnalyticsProps) {
  const supabase = createClientComponentClient<Database>()
  const [analytics, setAnalytics] = useState({
    views: 0,
    uniqueViewers: 0,
    endorsements: 0,
    comments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)

      try {
        // Track the view
        await fetch("/api/projects/track-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId }),
        })

        // Get view counts
        const { data: viewCount, error: viewError } = await supabase.rpc("get_project_view_count", {
          project_id: projectId,
        })

        if (viewError) throw viewError

        // Get unique viewers
        const { data: uniqueViewers, error: uniqueError } = await supabase.rpc("get_project_unique_viewers", {
          project_id: projectId,
        })

        if (uniqueError) throw uniqueError

        // Get endorsement count
        const { data: endorsementCount, error: endorsementError } = await supabase.rpc(
          "get_project_endorsement_count",
          { project_id: projectId },
        )

        if (endorsementError) throw endorsementError

        // Get comment count
        const { count: commentCount, error: commentError } = await supabase
          .from("project_comments")
          .select("*", { count: "exact", head: true })
          .eq("project_id", projectId)

        if (commentError) throw commentError

        setAnalytics({
          views: viewCount || 0,
          uniqueViewers: uniqueViewers || 0,
          endorsements: endorsementCount || 0,
          comments: commentCount || 0,
        })
      } catch (error) {
        console.error("Error fetching project analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [projectId, supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <span>Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-2">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{analytics.views}</div>
            )}
            <div className="text-xs text-muted-foreground">Total Views</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{analytics.uniqueViewers}</div>
            )}
            <div className="text-xs text-muted-foreground">Unique Viewers</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-2">
              <Star className="h-6 w-6 text-primary" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{analytics.endorsements}</div>
            )}
            <div className="text-xs text-muted-foreground">Endorsements</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-2">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{analytics.comments}</div>
            )}
            <div className="text-xs text-muted-foreground">Comments</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
