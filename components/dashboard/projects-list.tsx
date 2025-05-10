"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import { Plus, ExternalLink, Github, Pencil, Trash } from "lucide-react"
import type { Database } from "@/lib/database.types"

type Project = Database["public"]["Tables"]["projects"]["Row"]

interface ProjectsListProps {
  projects: Project[]
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    github_url: "",
    live_url: "",
    is_featured: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_featured: checked }))
  }

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("User not found")

      const { error } = await supabase.from("projects").insert({
        user_id: userData.user.id,
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        github_url: formData.github_url,
        live_url: formData.live_url,
        is_featured: formData.is_featured,
      })

      if (error) throw error

      toast({
        title: "Project added",
        description: "Your project has been added successfully",
      })

      setIsAddDialogOpen(false)
      setFormData({
        title: "",
        description: "",
        image_url: "",
        github_url: "",
        live_url: "",
        is_featured: false,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add project",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditProject = (project: Project) => {
    setCurrentProject(project)
    setFormData({
      title: project.title,
      description: project.description || "",
      image_url: project.image_url || "",
      github_url: project.github_url || "",
      live_url: project.live_url || "",
      is_featured: project.is_featured,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentProject) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url,
          github_url: formData.github_url,
          live_url: formData.live_url,
          is_featured: formData.is_featured,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentProject.id)

      if (error) throw error

      toast({
        title: "Project updated",
        description: "Your project has been updated successfully",
      })

      setIsEditDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (project: Project) => {
    setCurrentProject(project)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteProject = async () => {
    if (!currentProject) return
    setLoading(true)

    try {
      const { error } = await supabase.from("projects").delete().eq("id", currentProject.id)

      if (error) throw error

      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Projects</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>Add details about your project to showcase in your portfolio.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                />
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
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              You haven&apos;t added any projects yet. Click the &quot;Add Project&quot; button to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{project.title}</span>
                  {project.is_featured && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Featured</span>
                  )}
                </CardTitle>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {project.image_url && (
                  <div className="aspect-video w-full mb-4 rounded-md overflow-hidden">
                    <img
                      src={project.image_url || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
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
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => handleEditProject(project)}>
                  <Pencil className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(project)}>
                  <Trash className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update your project details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Project Title</Label>
              <Input id="edit-title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image_url">Image URL</Label>
              <Input
                id="edit-image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                type="url"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-github_url">GitHub URL</Label>
              <Input
                id="edit-github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                type="url"
                placeholder="https://github.com/username/repo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-live_url">Live Demo URL</Label>
              <Input
                id="edit-live_url"
                name="live_url"
                value={formData.live_url}
                onChange={handleChange}
                type="url"
                placeholder="https://yourproject.com"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="edit-is_featured" checked={formData.is_featured} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="edit-is_featured">Featured Project</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
