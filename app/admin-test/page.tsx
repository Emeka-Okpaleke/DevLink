"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react"

export default function AdminTestPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        setLoading(true)

        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) throw userError

        if (!userData.user) {
          setError("Not logged in. Please log in first.")
          return
        }

        setUser(userData.user)

        // Get profile with admin status
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single()

        if (profileError) {
          console.error("Profile error:", profileError)
          throw new Error("Error fetching profile data")
        }

        setProfile(profileData)
      } catch (err: any) {
        console.error("Error:", err)
        setError(err.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [supabase])

  const forceSetAdmin = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Force update admin status
      const { error } = await supabase.from("profiles").update({ is_admin: true }).eq("id", user.id)

      if (error) throw error

      // Refresh profile data
      const { data: updatedProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile(updatedProfile)

      alert("Admin status updated successfully!")
    } catch (err: any) {
      console.error("Error setting admin:", err)
      setError(err.message || "Failed to update admin status")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Status Check</CardTitle>
            <CardDescription>Checking your admin status...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Status Check</CardTitle>
          <CardDescription>Verify your admin privileges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">User Information</h3>
                <div className="bg-muted p-3 rounded-md">
                  <p>
                    <strong>User ID:</strong> {user?.id}
                  </p>
                  <p>
                    <strong>Email:</strong> {user?.email}
                  </p>
                </div>
              </div>

              {profile && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Profile Information</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p>
                      <strong>Username:</strong> {profile.username}
                    </p>
                    <p>
                      <strong>Admin Status:</strong>{" "}
                      {profile.is_admin ? (
                        <span className="text-green-500 flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Admin
                        </span>
                      ) : (
                        <span className="text-red-500">Not Admin</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {profile?.is_admin ? (
                <Alert className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Admin Access Confirmed</AlertTitle>
                  <AlertDescription>
                    You have administrator privileges. You should be able to access the admin pages.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Not an Admin</AlertTitle>
                  <AlertDescription>
                    You do not have administrator privileges. Click the button below to force set your account as admin.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {profile && !profile.is_admin && (
            <Button onClick={forceSetAdmin} disabled={loading} className="w-full">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Force Set as Admin
            </Button>
          )}

          {profile?.is_admin && (
            <Button onClick={() => router.push("/dashboard/admin/skills")} className="w-full">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Go to Admin Skills Page
            </Button>
          )}

          <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full">
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
