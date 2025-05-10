"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import { Pencil, Plus, Trash2, AlertCircle, Check, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Database } from "@/lib/database.types"

type Skill = Database["public"]["Tables"]["skills"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export function AdminSkillsManager() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [newSkillName, setNewSkillName] = useState("")
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [editName, setEditName] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  // Check if user is admin and fetch skills
  useEffect(() => {
    async function checkAdminAndFetchSkills() {
      setLoading(true)
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        // Get user profile to check admin status
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profileData) {
          setProfile(profileData)
          setIsAdmin(profileData.is_admin || false)
        }

        // Fetch all skills
        const { data: skillsData, error } = await supabase.from("skills").select("*").order("name")

        if (error) throw error

        if (skillsData) {
          setSkills(skillsData)
        }
      } catch (error: any) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load skills",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndFetchSkills()
  }, [supabase, router, toast])

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillName.trim()) return

    setLoading(true)

    try {
      // Check if skill already exists
      const { data: existingSkill } = await supabase
        .from("skills")
        .select("*")
        .ilike("name", newSkillName.trim())
        .maybeSingle()

      if (existingSkill) {
        toast({
          title: "Skill already exists",
          description: `"${newSkillName}" already exists in the database`,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Create new skill
      const { data: newSkill, error } = await supabase
        .from("skills")
        .insert({ name: newSkillName.trim() })
        .select()
        .single()

      if (error) {
        if (error.code === "PGRST301") {
          throw new Error("You don't have permission to create skills")
        }
        throw error
      }

      if (newSkill) {
        setSkills([...skills, newSkill])
        setNewSkillName("")
        toast({
          title: "Skill created",
          description: `"${newSkillName}" has been added to the database`,
          variant: "success",
        })
      }
    } catch (error: any) {
      console.error("Error creating skill:", error)
      toast({
        title: "Error creating skill",
        description: error.message || "Failed to create skill",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSkill || !editName.trim()) return

    setLoading(true)

    try {
      // Check if skill name already exists
      const { data: existingSkill } = await supabase
        .from("skills")
        .select("*")
        .ilike("name", editName.trim())
        .neq("id", editingSkill.id)
        .maybeSingle()

      if (existingSkill) {
        toast({
          title: "Skill already exists",
          description: `"${editName}" already exists in the database`,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Update skill
      const { error } = await supabase.from("skills").update({ name: editName.trim() }).eq("id", editingSkill.id)

      if (error) {
        if (error.code === "PGRST301") {
          throw new Error("You don't have permission to update skills")
        }
        throw error
      }

      // Update local state
      setSkills(skills.map((skill) => (skill.id === editingSkill.id ? { ...skill, name: editName.trim() } : skill)))

      setEditingSkill(null)
      setEditName("")

      toast({
        title: "Skill updated",
        description: `Skill has been updated successfully`,
        variant: "success",
      })
    } catch (error: any) {
      console.error("Error updating skill:", error)
      toast({
        title: "Error updating skill",
        description: error.message || "Failed to update skill",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm("Are you sure you want to delete this skill? This may affect user profiles and projects.")) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from("skills").delete().eq("id", skillId)

      if (error) {
        if (error.code === "PGRST301") {
          throw new Error("You don't have permission to delete skills")
        }
        throw error
      }

      // Update local state
      setSkills(skills.filter((skill) => skill.id !== skillId))

      toast({
        title: "Skill deleted",
        description: "Skill has been deleted successfully",
        variant: "success",
      })
    } catch (error: any) {
      console.error("Error deleting skill:", error)
      toast({
        title: "Error deleting skill",
        description: error.message || "Failed to delete skill",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills Management</CardTitle>
          <CardDescription>Manage skills in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You need administrator privileges to manage skills. Please contact an administrator for assistance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills Management</CardTitle>
        <CardDescription>Add, edit, or remove skills from the system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create new skill form */}
        <form onSubmit={handleCreateSkill} className="space-y-2">
          <Label htmlFor="new-skill">Add New Skill</Label>
          <div className="flex gap-2">
            <Input
              id="new-skill"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Enter skill name"
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !newSkillName.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </form>

        {/* Edit skill form */}
        {editingSkill && (
          <form onSubmit={handleUpdateSkill} className="space-y-2 border p-3 rounded-md">
            <Label htmlFor="edit-skill">Edit Skill</Label>
            <div className="flex gap-2">
              <Input
                id="edit-skill"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter new skill name"
                className="flex-1"
                disabled={loading}
                autoFocus
              />
              <Button type="submit" disabled={loading || !editName.trim()} size="icon">
                <Check className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setEditingSkill(null)
                  setEditName("")
                }}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* Skills list */}
        <div className="space-y-2">
          <Label>Existing Skills ({skills.length})</Label>
          {skills.length === 0 ? (
            <p className="text-muted-foreground text-sm">No skills found in the database.</p>
          ) : (
            <div className="border rounded-md p-3 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-2 border-b last:border-0">
                    <Badge variant="secondary">{skill.name}</Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingSkill(skill)
                          setEditName(skill.name)
                        }}
                        disabled={loading || editingSkill !== null}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSkill(skill.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          As an administrator, you have full access to manage skills in the system.
        </p>
      </CardFooter>
    </Card>
  )
}
