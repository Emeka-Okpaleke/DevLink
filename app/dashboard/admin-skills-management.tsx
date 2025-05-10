"use client"

import { AlertDescription } from "@/components/ui/alert"

import { AlertTitle } from "@/components/ui/alert"

import { Alert } from "@/components/ui/alert"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { PlusCircle, Pencil, Trash2, CheckCircle, XCircle, Users, FolderGit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import type { Database } from "@/lib/database.types"

type Skill = Database["public"]["Tables"]["skills"]["Row"] & {
  userCount: number
  projectCount: number
}

interface AdminSkillsManagementProps {
  skills: Skill[]
}

export function AdminSkillsManagement({ skills: initialSkills }: AdminSkillsManagementProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [searchQuery, setSearchQuery] = useState("")
  const [newSkillName, setNewSkillName] = useState("")
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClientComponentClient<Database>()

  // Filter skills based on search query
  const filteredSkills = skills.filter((skill) => skill.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Add new skill
  const handleAddSkill = async () => {
    if (!newSkillName.trim()) {
      toast({
        title: "Error",
        description: "Skill name cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.from("skills").insert({ name: newSkillName.trim() }).select().single()

      if (error) throw error

      // Add the new skill to the list with zero counts
      setSkills([...skills, { ...data, userCount: 0, projectCount: 0 }])
      setNewSkillName("")
      setIsAddDialogOpen(false)

      toast({
        title: "Success",
        description: `Skill "${newSkillName}" has been added`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add skill",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update skill
  const handleUpdateSkill = async () => {
    if (!editingSkill || !editingSkill.name.trim()) {
      toast({
        title: "Error",
        description: "Skill name cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from("skills")
        .update({ name: editingSkill.name.trim() })
        .eq("id", editingSkill.id)

      if (error) throw error

      // Update the skill in the list
      setSkills(
        skills.map((skill) => (skill.id === editingSkill.id ? { ...skill, name: editingSkill.name.trim() } : skill)),
      )
      setIsEditDialogOpen(false)

      toast({
        title: "Success",
        description: `Skill has been updated`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update skill",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete skill
  const handleDeleteSkill = async () => {
    if (!editingSkill) return

    setIsSubmitting(true)

    try {
      // Check if skill is in use
      if (editingSkill.userCount > 0 || editingSkill.projectCount > 0) {
        throw new Error("Cannot delete a skill that is in use")
      }

      const { error } = await supabase.from("skills").delete().eq("id", editingSkill.id)

      if (error) throw error

      // Remove the skill from the list
      setSkills(skills.filter((skill) => skill.id !== editingSkill.id))
      setIsDeleteDialogOpen(false)

      toast({
        title: "Success",
        description: `Skill "${editingSkill.name}" has been deleted`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete skill",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Platform Skills</CardTitle>
              <CardDescription>Manage the skills and technologies available on the platform.</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Skill</DialogTitle>
                  <DialogDescription>Add a new skill or technology to the platform.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Skill name"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSkill} disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Skill"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill Name</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSkills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      {searchQuery
                        ? "No skills found matching your search"
                        : "No skills available. Add your first skill!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSkills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell className="font-medium">{skill.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {skill.userCount} {skill.userCount === 1 ? "user" : "users"}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <FolderGit2 className="h-3 w-3" />
                            {skill.projectCount} {skill.projectCount === 1 ? "project" : "projects"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog
                            open={isEditDialogOpen && editingSkill?.id === skill.id}
                            onOpenChange={(open) => {
                              if (!open) setEditingSkill(null)
                              setIsEditDialogOpen(open)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setEditingSkill(skill)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Skill</DialogTitle>
                                <DialogDescription>Update the skill name.</DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Input
                                  placeholder="Skill name"
                                  value={editingSkill?.name || ""}
                                  onChange={(e) =>
                                    setEditingSkill(editingSkill ? { ...editingSkill, name: e.target.value } : null)
                                  }
                                />
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdateSkill} disabled={isSubmitting}>
                                  {isSubmitting ? "Updating..." : "Update Skill"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={isDeleteDialogOpen && editingSkill?.id === skill.id}
                            onOpenChange={(open) => {
                              if (!open) setEditingSkill(null)
                              setIsDeleteDialogOpen(open)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setEditingSkill(skill)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Skill</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this skill? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                {skill.userCount > 0 || skill.projectCount > 0 ? (
                                  <Alert variant="destructive">
                                    <XCircle className="h-4 w-4" />
                                    <AlertTitle>Cannot Delete</AlertTitle>
                                    <AlertDescription>
                                      This skill is in use by {skill.userCount}{" "}
                                      {skill.userCount === 1 ? "user" : "users"} and {skill.projectCount}{" "}
                                      {skill.projectCount === 1 ? "project" : "projects"}. Remove all references before
                                      deleting.
                                    </AlertDescription>
                                  </Alert>
                                ) : (
                                  <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle>Ready to Delete</AlertTitle>
                                    <AlertDescription>
                                      This skill is not in use and can be safely deleted.
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleDeleteSkill}
                                  disabled={isSubmitting || skill.userCount > 0 || skill.projectCount > 0}
                                >
                                  {isSubmitting ? "Deleting..." : "Delete Skill"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredSkills.length} of {skills.length} skills
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
