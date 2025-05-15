"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function MessageIndicator() {
  const { supabase, session } = useSupabase()
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!session?.user) return

    const fetchUnreadCount = async () => {
      try {
        setError(false)
        const { data, error } = await supabase.rpc("get_total_unread_count", {
          p_user_id: session.user.id,
        })

        if (error) {
          console.error("Error fetching unread count:", error)
          setError(true)
          return
        }

        setUnreadCount(data || 0)
      } catch (error) {
        console.error("Error in unread count:", error)
        setError(true)
      }
    }

    fetchUnreadCount()

    // Subscribe to new messages
    const subscription = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [session, supabase])

  if (!session) return null

  // If there's an error, just show the icon without the count
  if (error) {
    return (
      <Link href="/messages">
        <Button variant="ghost" size="icon">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </Link>
    )
  }

  return (
    <Link href="/messages">
      <Button variant="ghost" size="icon" className="relative">
        <MessageSquare className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>
    </Link>
  )
}
