"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { useToast } from "@/hooks/use-toast"

interface EndorseButtonProps {
  projectId: string
  initialEndorsementCount: number
  initialIsEndorsed: boolean
}

export function EndorseButton({
  projectId,
  initialEndorsementCount = 0,
  initialIsEndorsed = false,
}: EndorseButtonProps) {
  const [isEndorsed, setIsEndorsed] = useState(initialIsEndorsed)
  const [endorsementCount, setEndorsementCount] = useState(initialEndorsementCount)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()

  const handleEndorse = async () => {
    try {
      setIsLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to endorse projects",
          variant: "destructive",
        })
        return
      }

      if (isEndorsed) {
        // Remove endorsement
        const { error } = await supabase
          .from("project_endorsements")
          .delete()
          .eq("project_id", projectId)
          .eq("user_id", user.id)

        if (error) throw error

        setIsEndorsed(false)
        setEndorsementCount((prev) => Math.max(0, prev - 1))

        toast({
          title: "Endorsement removed",
          description: "You've removed your endorsement for this project",
        })
      } else {
        // Add endorsement
        const { error } = await supabase.from("project_endorsements").insert({
          project_id: projectId,
          user_id: user.id,
        })

        if (error) throw error

        setIsEndorsed(true)
        setEndorsementCount((prev) => prev + 1)

        toast({
          title: "Project endorsed!",
          description: "You've successfully endorsed this project",
        })
      }
    } catch (error) {
      console.error("Error toggling endorsement:", error)
      toast({
        title: "Error",
        description: "Failed to process your endorsement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isEndorsed ? "default" : "outline"}
      size="sm"
      onClick={handleEndorse}
      disabled={isLoading}
      className="gap-1.5"
    >
      <Star className={`h-4 w-4 ${isEndorsed ? "fill-current" : ""}`} />
      <span>{endorsementCount}</span>
    </Button>
  )
}
