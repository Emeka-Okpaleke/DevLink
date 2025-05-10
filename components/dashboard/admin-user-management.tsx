"use client"

import Link from "next/link"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCog,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export function AdminUserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)
  const [updating, setUpdating] = useState<string | null>(null)

  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()

  // Fetch profiles with pagination
  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true)
      setError(null)

      try {
        // Calculate pagination
        const from = (currentPage - 1) * pageSize
        const to = from + pageSize - 1

        // Get total count first
        const { count, error: countError } = await supabase.from("profiles").select("*", { count: "exact", head: true })

        if (countError) {
          throw countError
        }

        if (count !== null) {
          setTotalPages(Math.ceil(count / pageSize))
        }

        // Fetch profiles with search and pagination
        let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).range(from, to)

        // Apply search filter if provided
        if (searchQuery) {
          query = query.or(
            `username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`,
          )
        }

        const { data, error: fetchError } = await query

        if (fetchError) {
          throw fetchError
        }

        setProfiles(data || [])
      } catch (err: any) {
        console.error("Error fetching profiles:", err)
        setError(err.message || "Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [supabase, currentPage, pageSize, searchQuery])

  // Toggle admin status
  const toggleAdminStatus = async (profileId: string, currentStatus: boolean) => {
    setUpdating(profileId)

    try {
      const { error } = await supabase.from("profiles").update({ is_admin: !currentStatus }).eq("id", profileId)

      if (error) {
        throw error
      }

      // Update local state
      setProfiles(
        profiles.map((profile) => (profile.id === profileId ? { ...profile, is_admin: !currentStatus } : profile)),
      )

      toast({
        title: "Success",
        description: `User is now ${!currentStatus ? "an admin" : "no longer an admin"}.`,
        variant: "default",
      })
    } catch (err: any) {
      console.error("Error updating admin status:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update admin status",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  // Toggle public status
  const togglePublicStatus = async (profileId: string, currentStatus: boolean) => {
    setUpdating(profileId)

    try {
      const { error } = await supabase.from("profiles").update({ is_public: !currentStatus }).eq("id", profileId)

      if (error) {
        throw error
      }

      // Update local state
      setProfiles(
        profiles.map((profile) => (profile.id === profileId ? { ...profile, is_public: !currentStatus } : profile)),
      )

      toast({
        title: "Success",
        description: `Profile is now ${!currentStatus ? "public" : "private"}.`,
        variant: "default",
      })
    } catch (err: any) {
      console.error("Error updating public status:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update profile visibility",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
  }

  // Render loading state
  if (loading && profiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Loading user data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Manage user accounts and permissions.{" "}
          {profiles.length > 0 && `Showing ${profiles.length} of ${totalPages * pageSize} users.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, username, or location..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
          {searchQuery && (
            <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")} title="Clear search">
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>

        {/* Users table */}
        {profiles.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No users found.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Public</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url || "/placeholder.svg"}
                              alt={profile.username || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserCog className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{profile.full_name || "Unnamed User"}</div>
                          <div className="text-sm text-muted-foreground">@{profile.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.is_admin ? "default" : "outline"}>
                        {profile.is_admin ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={profile.is_admin}
                          disabled={updating === profile.id}
                          onCheckedChange={() => toggleAdminStatus(profile.id, profile.is_admin)}
                        />
                        {profile.is_admin ? (
                          <Shield className="h-4 w-4 text-primary" />
                        ) : (
                          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={profile.is_public}
                          disabled={updating === profile.id}
                          onCheckedChange={() => togglePublicStatus(profile.id, profile.is_public)}
                        />
                        {profile.is_public ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/profile/${profile.username}`} target="_blank">
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleAdminStatus(profile.id, profile.is_admin)}
                            disabled={updating === profile.id}
                          >
                            {profile.is_admin ? "Remove Admin" : "Make Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePublicStatus(profile.id, profile.is_public)}
                            disabled={updating === profile.id}
                          >
                            {profile.is_public ? "Make Private" : "Make Public"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Pagination */}
      {totalPages > 1 && (
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
