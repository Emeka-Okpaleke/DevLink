"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

interface ProjectCommentsProps {
  projectId: string
}

export function ProjectComments({ projectId }: ProjectCommentsProps) {
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true)

      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setCurrentUser(user)

        // Get comments for this project
        const { data, error } = await supabase
          .from("project_comments")
          .select(`
            *,
            profiles:user_id (username, avatar_url)
          `)
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })

        if (error) throw error

        setComments(data || [])
      } catch (error) {
        console.error("Error fetching comments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`project_comments:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_comments",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch the user data for the new comment
            supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", payload.new.user_id)
              .single()
              .then(({ data: profile }) => {
                const newComment = {
                  ...payload.new,
                  profiles: profile,
                }
                setComments((prev) => [newComment, ...prev])
              })
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [projectId, supabase])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment on projects",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("project_comments").insert({
        project_id: projectId,
        user_id: currentUser.id,
        content: newComment.trim(),
      })

      if (error) throw error

      setNewComment("")
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      })
    } catch (error: any) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // If we don't have the project_comments table yet, let's show a message
  if (!isLoading && comments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">Be the first to comment on this project!</p>
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <Textarea
                placeholder="Share your thoughts about this project..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting || !currentUser}
              />
              <Button type="submit" disabled={isSubmitting || !newComment.trim() || !currentUser}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Comment"
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitComment} className="space-y-4 mb-6">
          <Textarea
            placeholder="Share your thoughts about this project..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting || !currentUser}
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim() || !currentUser}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Comment"
            )}
          </Button>
        </form>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 pb-4 border-b">
                <img
                  src={comment.profiles.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
                  alt={comment.profiles.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">@{comment.profiles.username}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
