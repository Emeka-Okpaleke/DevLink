"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

type Skill = Database["public"]["Tables"]["skills"]["Row"]

interface SkillsManagerProps {
  currentSkills: Skill[]
}

export function SkillsManager({ currentSkills = [] }: SkillsManagerProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(currentSkills || [])
  const [userId, setUserId] = useState<string | null>(null)
  const [newSkillName, setNewSkillName] = useState("")
  const [addingNewSkill, setAddingNewSkill] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPermissionAlert, setShowPermissionAlert] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    async function fetchSkills() {
      try {
        setLoading(true)

        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error("Error fetching user:", userError)
          setDebugInfo((prev) => ({ ...prev, userError }))
          return
        }

        if (userData.user) {
          setUserId(userData.user.id)

          // Check if user is admin
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", userData.user.id)
            .single()

          if (profileError) {
            console.error("Error fetching profile:", profileError)
            setDebugInfo((prev) => ({ ...prev, profileError }))
          } else {
            setIsAdmin(profile?.is_admin || false)
          }
        }

        // Fetch all skills
        const { data, error } = await supabase.from("skills").select("*").order("name")

        if (error) {
          console.error("Error fetching skills:", error)
          setDebugInfo((prev) => ({ ...prev, skillsError: error }))
          return
        }

        if (data) {
          console.log(`Loaded ${data.length} skills`)
          setSkills(data)
          setDebugInfo((prev) => ({
            ...prev,
            skillsCount: data.length,
            skillsData: data.slice(0, 5), // Just show first 5 for debugging
          }))
        }
      } catch (err) {
        console.error("Error in fetchSkills:", err)
        setDebugInfo((prev) => ({ ...prev, fetchError: err }))
      } finally {
        setLoading(false)
      }
    }

    fetchSkills()
  }, [supabase])

  const handleAddSkill = async (skill: Skill) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to add skills",
        variant: "destructive",
      })
      return
    }

    // Check if skill is already selected
    if (selectedSkills.some((s) => s.id === skill.id)) {
      toast({
        title: "Skill already added",
        description: `${skill.name} is already in your skills`,
        variant: "default",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from("user_skills").insert({
        user_id: userId,
        skill_id: skill.id,
      })

      if (error) {
        console.error("Error adding skill:", error)
        throw error
      }

      setSelectedSkills([...selectedSkills, skill])
      toast({
        title: "Skill added",
        description: `${skill.name} has been added to your skills`,
        variant: "default",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add skill",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const filteredSkills = skills.filter((skill) => {
    // If no search query, show all skills that aren't already selected
    if (!searchQuery) {
      return !selectedSkills.some((s) => s.id === skill.id)
    }

    // Otherwise, filter by name match and not already selected
    const isMatch = skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    const isAlreadySelected = selectedSkills.some((s) => s.id === skill.id)
    return isMatch && !isAlreadySelected
  })

  const handleRemoveSkill = async (skillId: string) => {
    if (!userId) return

    setLoading(true)

    try {
      const { error } = await supabase.from("user_skills").delete().eq("user_id", userId).eq("skill_id", skillId)

      if (error) throw error

      setSelectedSkills(selectedSkills.filter((s) => s.id !== skillId))
      toast({
        title: "Skill removed",
        description: "Skill has been removed from your profile",
        variant: "default",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove skill",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>Add skills to showcase your expertise</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {selectedSkills.length === 0 ? (
            <p className="text-muted-foreground">No skills added yet</p>
          ) : (
            selectedSkills.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="pl-2 pr-1 py-1">
                {skill.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => handleRemoveSkill(skill.id)}
                  disabled={loading}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {skill.name}</span>
                </Button>
              </Badge>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex w-full gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between flex-1"
                disabled={loading}
              >
                {searchQuery || "Select skills"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search skills..." value={searchQuery} onValueChange={setSearchQuery} />
                <CommandList>
                  <CommandEmpty>No skills found. Try a different search.</CommandEmpty>
                  <CommandGroup heading="Available Skills">
                    {filteredSkills.map((skill) => (
                      <CommandItem
                        key={skill.id}
                        value={skill.name}
                        onSelect={() => {
                          handleAddSkill(skill)
                          setSearchQuery("")
                        }}
                      >
                        {skill.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CardFooter>

      {/* Debug information - visible in all environments for troubleshooting */}
      <div className="mt-8 p-4 border border-dashed rounded-md">
        <h3 className="text-sm font-medium mb-2">Debug Info:</h3>
        <div className="text-xs space-y-1">
          <p>Total skills available: {skills.length}</p>
          <p>Filtered skills: {filteredSkills.length}</p>
          <p>Selected skills: {selectedSkills.length}</p>
          <p>User ID: {userId || "Not set"}</p>
          <p>Is Admin: {isAdmin ? "Yes" : "No"}</p>
          <p>Search Query: "{searchQuery}"</p>

          {skills.length > 0 && (
            <div>
              <p>First 5 skills:</p>
              <ul className="list-disc pl-4">
                {skills.slice(0, 5).map((skill) => (
                  <li key={skill.id}>{skill.name}</li>
                ))}
              </ul>
            </div>
          )}

          {filteredSkills.length > 0 && (
            <div>
              <p>First 5 filtered skills:</p>
              <ul className="list-disc pl-4">
                {filteredSkills.slice(0, 5).map((skill) => (
                  <li key={skill.id}>{skill.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
