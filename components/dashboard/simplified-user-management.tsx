"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, RefreshCw, ChevronLeft, ChevronRight, Check, X, AlertCircle, Shield, User } from "lucide-react"

type Profile = {
  id: string
  username: string
  full_name: string | null
  is_admin: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export function SimplifiedUserManagement() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [pageSize] = useState(5)

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Fetching users, page:", page, "pageSize:", pageSize)

      // First, check if we can access our own profile
      const { data: currentUser, error: currentUserError } = await supabase.auth.getUser()

      if (currentUserError) {
        console.error("Error fetching current user:", currentUserError)
        setError(`Authentication error: ${currentUserError.message}`)
        return
      }

      // Try to get our own profile first as a test
      const { data: myProfile, error: myProfileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.user?.id)
        .maybeSingle()

      if (myProfileError) {
        console.error("Error fetching my profile:", myProfileError)
        setError(`Cannot access your own profile: ${myProfileError.message}. This suggests a permissions issue.`)
        return
      }

      // If we can access our profile, try to get all profiles
      let query = supabase.from("profiles").select("*", { count: "exact" })

      // Add search if provided
      if (searchQuery) {
        query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      }

      // Add pagination
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (error) {
        console.error("Error fetching profiles:", error)
        setError(`Error fetching users: ${error.message}`)
        return
      }

      if (data) {
        console.log("Fetched profiles:", data)
        setUsers(data as Profile[])
        setTotalUsers(count || 0)
        setTotalPages(Math.ceil((count || 0) / pageSize))
      }
    } catch (error: any) {
      console.error("Error in fetchUsers:", error)
      setError(`Failed to load users: ${error.message || "Unknown error"}`)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, pageSize])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page on new search
    fetchUsers()
  }

  // Toggle admin status
  const handleToggleAdmin = async (user: Profile) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_admin: !user.is_admin,
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `User is ${!user.is_admin ? "now an admin" : "no longer an admin"}`,
      })

      fetchUsers()
    } catch (error: any) {
      console.error("Error toggling admin status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      })
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <div className="mt-4">
          <Button onClick={fetchUsers} variant="outline">
            Try Again
          </Button>
        </div>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Simplified user management interface</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{user.full_name || "Unnamed User"}</span>
                        <span className="text-xs text-muted-foreground">@{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge variant="default" className="bg-amber-500">
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <User className="mr-1 h-3 w-3" />
                          User
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      {user.is_public ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Check className="mr-1 h-3 w-3" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <X className="mr-1 h-3 w-3" />
                          Private
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAdmin(user)}
                        className={user.is_admin ? "text-amber-600" : ""}
                      >
                        {user.is_admin ? (
                          <>
                            <X className="mr-1 h-3 w-3" />
                            Remove Admin
                          </>
                        ) : (
                          <>
                            <Shield className="mr-1 h-3 w-3" />
                            Make Admin
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {users.length} of {totalUsers} users
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Page {page} of {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
