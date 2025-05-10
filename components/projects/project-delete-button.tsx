"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProjectDeleteButtonProps {
  projectId: string
}

export function ProjectDeleteButton({ projectId }: ProjectDeleteButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // Delete project
      const { error } = await supabase.from("projects").delete().eq("id", projectId)

      if (error) throw error

      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      })

      // Redirect to projects list
      router.push("/dashboard/projects")
      router.refresh()
    } catch (error: any) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button variant="destructive" size="icon" onClick={() => setIsOpen(true)}>
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete project</span>
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your project and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
