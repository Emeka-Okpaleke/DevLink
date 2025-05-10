"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AuthDebug() {
  const { supabase } = useSupabase()
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    async function getAuthData() {
      try {
        // Get session
        const { data: sessionData } = await supabase.auth.getSession()
        setSession(sessionData.session)

        // If user is logged in, get profile
        if (sessionData.session?.user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", sessionData.session.user.id)
            .single()

          setProfile(profileData)
        }
      } catch (error) {
        console.error("Error fetching auth data:", error)
      } finally {
        setLoading(false)
      }
    }

    getAuthData()
  }, [supabase])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)} className="mb-2">
        {showDebug ? "Hide Debug" : "Show Auth Debug"}
      </Button>

      {showDebug && (
        <Card className="w-96 max-h-96 overflow-auto">
          <CardHeader>
            <CardTitle>Auth Debug</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-1">Session:</h3>
                <pre className="bg-muted p-2 rounded overflow-auto">
                  {loading ? "Loading..." : JSON.stringify(session, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-bold mb-1">Profile:</h3>
                <pre className="bg-muted p-2 rounded overflow-auto">
                  {loading ? "Loading..." : JSON.stringify(profile, null, 2)}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await supabase.auth.signOut()
                    window.location.href = "/"
                  }}
                >
                  Sign Out
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
