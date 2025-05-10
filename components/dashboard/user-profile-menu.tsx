"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/lib/supabase/client"
import { ShieldCheck, Users } from "lucide-react"

export function UserProfileMenu() {
  const pathname = usePathname()
  const { supabase } = useSupabase()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

          setIsAdmin(profile?.is_admin || false)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [supabase])

  if (loading) return null

  return (
    <div className="flex items-center space-x-2">
      {isAdmin && (
        <>
          <Button
            variant="outline"
            size="sm"
            asChild
            className={pathname.startsWith("/dashboard/admin/skills") ? "bg-primary/10" : ""}
          >
            <Link href="/dashboard/admin/skills">
              <ShieldCheck className="h-4 w-4 mr-1" />
              Skills
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className={pathname.startsWith("/dashboard/admin/users") ? "bg-primary/10" : ""}
          >
            <Link href="/dashboard/admin/users">
              <Users className="h-4 w-4 mr-1" />
              Users
            </Link>
          </Button>
        </>
      )}
    </div>
  )
}
