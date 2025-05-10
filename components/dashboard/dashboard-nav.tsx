"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { LayoutDashboard, User, FolderKanban, Code, Users, Settings, Shield } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
}

export function DashboardNav() {
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

  const navItems: NavItem[] = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: <User className="mr-2 h-4 w-4" />,
    },
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: <FolderKanban className="mr-2 h-4 w-4" />,
    },
    {
      title: "Skills",
      href: "/dashboard/skills",
      icon: <Code className="mr-2 h-4 w-4" />,
    },
    {
      title: "Connections",
      href: "/dashboard/connections",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
    {
      title: "Admin Dashboard",
      href: "/dashboard/admin",
      icon: <Shield className="mr-2 h-4 w-4" />,
      adminOnly: true,
    },
  ]

  if (loading) {
    return <div className="w-full">Loading...</div>
  }

  const filteredNavItems = navItems.filter((item) => !item.adminOnly || (item.adminOnly && isAdmin))

  return (
    <nav className="grid items-start gap-2">
      {filteredNavItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "default" : "ghost"}
          className={cn(
            "justify-start",
            (pathname === item.href || pathname.startsWith(`${item.href}/`)) && "bg-primary text-primary-foreground",
          )}
          asChild
        >
          <Link href={item.href}>
            {item.icon}
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
