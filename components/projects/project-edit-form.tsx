"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ProjectImageUpload } from "@/components/dashboard/project-image-upload"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ProjectEditFormProps {
  project: any
  projectSkills: any[]
}

export function ProjectEditForm({ project, projectSkills }: ProjectEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description || "")
  const [githubUrl, setGithubUrl] = useState(project.github_url || "")
  const [liveUrl, setLiveUrl] = useState(project.live_url || "")
  const [isFeatured, setIsFeatured] = useState(project.is_featured || false)
  const [imageUrl, setImageUrl] = useState(project.image_url || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setFormError("Project title is required")
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title,
          description,
          github_url: githubUrl,
          live_url: liveUrl,
          is_featured: isFeatured,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)

      if (error) throw error

      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Error updating project:", error)
      setFormError(error.message || "Failed to update project")
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUploaded = (url: string) => {
    setImageUrl(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Project</CardTitle>
        <CardDescription>Update your project details and information.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Project"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Project Image</Label>
            <ProjectImageUpload
              projectId={project.id}
              currentImageUrl={imageUrl}
              onImageUploaded={handleImageUploaded}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github-url">GitHub URL</Label>
            <Input
              id="github-url"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/yourusername/project"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="live-url">Live Demo URL</Label>
            <Input
              id="live-url"
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://your-project.com"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
            <Label htmlFor="featured">Feature this project on your profile</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.refresh()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
