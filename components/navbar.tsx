"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavbarSearch } from "@/components/navbar-search"
import { useSupabase } from "@/lib/supabase/client"
import { Menu, X, User, LogIn, LogOut, LayoutDashboard, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const pathname = usePathname()
  const { supabase } = useSupabase()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<{ avatar_url: string | null; username: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function getUser() {
      try {
        console.log("Fetching user data...")
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error("Error fetching auth user:", error)
          if (isMounted) setAuthError(error.message)
          return
        }

        console.log("Auth user data:", user ? "Logged in" : "Not logged in")

        if (isMounted) {
          setUser(user)
          setAuthError(null)
        }

        if (user && isMounted) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("is_admin, avatar_url, username")
              .eq("id", user.id)
              .single()

            if (profileError) {
              console.error("Error fetching profile:", profileError)
              return
            }

            if (isMounted) {
              setIsAdmin(profileData?.is_admin || false)
              setProfile({
                avatar_url: profileData?.avatar_url,
                username: profileData?.username,
              })
            }
          } catch (profileError) {
            console.error("Error in profile fetch:", profileError)
          }
        }
      } catch (error) {
        console.error("Error in auth check:", error)
        if (isMounted) setAuthError("Failed to check authentication status")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state changed: ${event}`, session ? "User present" : "No user")

      if (isMounted) {
        setUser(session?.user || null)
      }

      if (session?.user && isMounted) {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("is_admin, avatar_url, username")
            .eq("id", session.user.id)
            .single()

          if (isMounted) {
            setIsAdmin(profileData?.is_admin || false)
            setProfile({
              avatar_url: profileData?.avatar_url,
              username: profileData?.username,
            })
          }
        } catch (error) {
          console.error("Profile fetch error during auth change:", error)
        }
      } else if (isMounted) {
        setIsAdmin(false)
        setProfile(null)
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const navItems = [
    { href: "/explore", label: "Explore" },
    { href: "/projects", label: "Projects" },
    { href: "/developers", label: "Developers" },
    { href: "/search", label: "Search" },
  ]

  // Force showing login/signup if we've been loading for too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log("Auth check taking too long, showing login/signup buttons")
        setLoading(false)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [loading])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center mr-6">
            <span className="font-bold text-xl">DevLink</span>
          </Link>

          <nav className="hidden md:flex space-x-4 lg:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Right Side: Search, Theme, Auth */}
        <div className="hidden md:flex items-center space-x-4">
          {user && <NavbarSearch />}
          <ThemeToggle />

          {loading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded-md"></div>
          ) : (
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
                      <Link href={profile?.username ? `/profile/${profile.username}` : "/profile"}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Log in
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button
            className="p-2 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary px-2 py-1 rounded-md ${
                    pathname === item.href ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {user && (
              <div className="pt-2">
                <NavbarSearch />
              </div>
            )}

            <div className="pt-4 border-t flex flex-col space-y-3">
              {loading ? (
                <div className="h-8 w-full bg-muted animate-pulse rounded-md"></div>
              ) : (
                <>
                  {user ? (
                    <>
                      <Button asChild variant="ghost" size="sm" className="justify-start">
                        <Link href={profile?.username ? `/profile/${profile.username}` : "/profile"}>
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="justify-start">
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </Button>
                      {isAdmin && (
                        <Button asChild variant="ghost" size="sm" className="justify-start">
                          <Link href="/dashboard/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={handleSignOut} className="justify-start">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="ghost" size="sm" className="justify-start w-full">
                        <Link href="/login">
                          <LogIn className="h-4 w-4 mr-2" />
                          Log in
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="justify-start w-full">
                        <Link href="/signup">Sign up</Link>
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
