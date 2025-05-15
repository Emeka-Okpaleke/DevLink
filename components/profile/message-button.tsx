"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface MessageButtonProps {
  userId: string
}

export function MessageButton({ userId }: MessageButtonProps) {
  const router = useRouter()
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!session?.user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to send messages",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (userId === session.user.id) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot send messages to yourself",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Use the get_or_create_conversation function
      const { data, error } = await supabase.rpc("get_or_create_conversation", {
        user1_id: session.user.id,
        user2_id: userId,
      })

      if (error) {
        throw error
      }

      router.push(`/messages/${data}`)
    } catch (error) {
      console.error("Error starting conversation:", error)
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} variant="outline" size="sm">
      <MessageSquare className="h-4 w-4 mr-2" />
      Message
    </Button>
  )
}
