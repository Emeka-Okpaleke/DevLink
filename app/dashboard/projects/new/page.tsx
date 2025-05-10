"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ProjectImageUpload } from "@/components/dashboard/project-image-upload"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

export default function NewProjectPage() {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    github_url: "",
    live_url: "",
    is_featured: false,
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Check authentication on component mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth session error:", error)
          setFormError("Authentication error: " + error.message)
          return
        }

        if (!data.session) {
          setFormError("You must be logged in to create a project")
          return
        }

        setUserId(data.session.user.id)
        setDebugInfo((prev) => ({ ...prev, authStatus: "Authenticated", userId: data.session.user.id }))
      } catch (error: any) {
        console.error("Auth check error:", error)
        setFormError("Authentication check failed: " + error.message)
      } finally {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_featured: checked }))
  }

  const handleImageUploaded = (url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }))
    setDebugInfo((prev) => ({ ...prev, imageUrl: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!authChecked) {
      setFormError("Authentication check is still in progress. Please wait.")
      return
    }

    if (!userId) {
      setFormError("You must be logged in to create a project")
      return
    }

    setLoading(true)
    setFormError(null)

    // Create a debug object to track the process
    const debug: any = {
      startTime: new Date().toISOString(),
      formData: { ...formData },
      userId,
    }

    try {
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error("Project title is required")
      }

      debug.validationPassed = true

      // Create the project
      debug.insertStarted = new Date().toISOString()

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          title: formData.title,
          description: formData.description || null,
          image_url: formData.image_url || null,
          github_url: formData.github_url || null,
          live_url: formData.live_url || null,
          is_featured: formData.is_featured,
        })
        .select()

      debug.insertCompleted = new Date().toISOString()

      if (projectError) {
        debug.error = projectError
        console.error("Project creation error:", projectError)
        throw new Error(`Failed to create project: ${projectError.message}`)
      }

      if (!projectData || projectData.length === 0) {
        debug.error = "No project data returned"
        throw new Error("Failed to create project: No data returned")
      }

      debug.projectData = projectData
      debug.success = true

      // Show success message
      toast({
        title: "Project created",
        description: "Your project has been created successfully",
      })

      // Navigate back to projects page
      debug.navigationStarted = new Date().toISOString()

      // Use window.location for a hard navigation instead of router
      window.location.href = "/dashboard/projects"
    } catch (error: any) {
      debug.error = error.message || "Unknown error"
      console.error("Error creating project:", error)
      setFormError(error.message || "Failed to create project. Please try again.")
      toast({
        title: "Error",
        description: error.message || "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      debug.endTime = new Date().toISOString()
      setDebugInfo(debug)
      setLoading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Create New Project" text="Add a new project to your portfolio.">
        <Button variant="outline" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </DashboardHeader>
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Fill in the details about your project. The more information you provide, the better.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {formError && (
                <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">{formError}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="My Awesome Project"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project in detail..."
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Project Image</Label>
                <ProjectImageUpload
                  projectId="new"
                  currentImageUrl={formData.image_url}
                  onImageUploaded={handleImageUploaded}
                />
                <p className="text-sm text-muted-foreground">
                  Upload a screenshot or image that showcases your project. Recommended size: 1200x630px.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  type="url"
                  placeholder="https://github.com/username/repo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="live_url">Live Demo URL</Label>
                <Input
                  id="live_url"
                  name="live_url"
                  value={formData.live_url}
                  onChange={handleChange}
                  type="url"
                  placeholder="https://yourproject.com"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_featured" checked={formData.is_featured} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="is_featured">Featured Project</Label>
                <p className="text-sm text-muted-foreground ml-2">
                  Featured projects appear prominently on your profile.
                </p>
              </div>

              {/* Debug information (only visible during development) */}
              {process.env.NODE_ENV === "development" && debugInfo && (
                <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 text-xs font-mono overflow-auto max-h-60">
                  <details>
                    <summary className="cursor-pointer font-semibold">Debug Information</summary>
                    <pre className="mt-2">{JSON.stringify(debugInfo, null, 2)}</pre>
                  </details>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/dashboard/projects">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading || !authChecked || !userId}>
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardShell>
  )
}
