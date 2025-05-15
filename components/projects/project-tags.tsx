"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Tag, Plus, X } from "lucide-react"

interface ProjectTagsProps {
  projectId: string
  canEdit: boolean
}

interface ProjectTag {
  id: string
  name: string
}

export function ProjectTags({ projectId, canEdit }: ProjectTagsProps) {
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()
  const [tags, setTags] = useState<ProjectTag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newTag, setNewTag] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true)

      try {
        // In a real implementation, you would fetch from a project_tags table
        // This is just placeholder data
        setTags([
          { id: "1", name: "Web Development" },
          { id: "2", name: "React" },
          { id: "3", name: "Frontend" },
        ])
      } catch (error) {
        console.error("Error fetching project tags:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTags()
  }, [projectId, supabase])

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTag.trim()) return

    setIsAdding(true)

    try {
      // In a real implementation, you would add to a project_tags table
      // This is just a placeholder
      const newTagObj = {
        id: Date.now().toString(),
        name: newTag.trim(),
      }

      setTags([...tags, newTagObj])
      setNewTag("")

      toast({
        title: "Tag added",
        description: "Tag has been added to the project.",
      })
    } catch (error: any) {
      console.error("Error adding tag:", error)
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveTag = async (tagId: string) => {
    try {
      // In a real implementation, you would remove from a project_tags table
      // This is just a placeholder
      setTags(tags.filter((tag) => tag.id !== tagId))

      toast({
        title: "Tag removed",
        description: "Tag has been removed from the project.",
      })
    } catch (error: any) {
      console.error("Error removing tag:", error)
      toast({
        title: "Error",
        description: "Failed to remove tag. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          <span>Project Tags</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="flex items-center gap-1 text-sm py-1 px-2">
                {tag.name}
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag.id)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag.name}</span>
                  </Button>
                )}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No tags added yet.</p>
          )}
        </div>
      </CardContent>
      {canEdit && (
        <CardFooter>
          <form onSubmit={handleAddTag} className="flex w-full flex-col sm:flex-row gap-2">
            <Input
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              disabled={isAdding}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={isAdding || !newTag.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </form>
        </CardFooter>
      )}
    </Card>
  )
}
