"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSupabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NavbarSearch } from "@/components/navbar-search"
import type { User } from "@supabase/supabase-js"

export function Navbar() {
  const pathname = usePathname()
  const { supabase } = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ avatar_url: string | null; username: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserAndProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)

      if (user) {
        // Fetch the profile data to get the avatar_url
        const { data: profileData } = await supabase
          .from("profiles")
          .select("avatar_url, username")
          .eq("id", user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }
      }

      setLoading(false)
    }

    getUserAndProfile()

    // Set up auth state change listener to update when user logs in/out
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)

      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("avatar_url, username")
          .eq("id", session.user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }
      } else {
        setProfile(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, pathname]) // Re-fetch when pathname changes to update after navigation

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    window.location.href = "/"
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">DevLink</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/explore"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/explore" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Explore
            </Link>
            <Link
              href="/search"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/search" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Search
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {user && (
          <div className="hidden md:block flex-1 mx-4">
            <NavbarSearch />
          </div>
        )}

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            profile?.avatar_url ||
                            `/placeholder.svg?height=32&width=32&query=${profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}`
                          }
                          alt={profile?.username || user.email || ""}
                        />
                        <AvatarFallback>
                          {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/edit">Edit Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
