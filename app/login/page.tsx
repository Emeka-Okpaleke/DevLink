"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github } from "lucide-react"
import { useSupabase } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true)

    // Check if Supabase is initialized properly
    if (!supabase) {
      setDebugInfo("Supabase client not initialized properly")
    } else {
      setDebugInfo(null)
    }
  }, [supabase])

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          console.log("User already has a session, redirecting to dashboard")
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }

    if (isClient) {
      checkSession()
    }
  }, [isClient, router, supabase.auth])

  // Handle error params from auth callback
  useEffect(() => {
    const errorParam = searchParams.get("error")
    const errorCode = searchParams.get("error_code")

    if (errorCode === "otp_expired") {
      setError("The email verification link has expired. Please request a new one.")
    } else if (errorParam) {
      setError(`Authentication error: ${errorParam}`)
    }
  }, [searchParams])

  // Set up auth state change listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change in login page:", event)

      if (event === "SIGNED_IN" && session) {
        console.log("User signed in, redirecting to dashboard")
        // Use a timeout to ensure state updates complete before redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, supabase.auth])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log("Attempting to sign in with email:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        throw error
      }

      console.log("Login successful, user:", data.user?.id)

      // Check if we got a valid session
      if (!data.session) {
        setDebugInfo("Login succeeded but no session was returned")
        setLoading(false)
        return
      }

      // The redirect will be handled by the auth state change listener
      // This prevents the loading state from getting stuck
      console.log("Authentication successful, waiting for redirect...")

      // Add a safety timeout to reset loading state if redirect doesn't happen
      setTimeout(() => {
        if (document.visibilityState === "visible") {
          console.log("Redirect timeout reached, manually redirecting")
          window.location.href = "/dashboard"
        }
      }, 3000)
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Login failed. Please check your credentials.")
      setDebugInfo(`Error type: ${error.name}, Status: ${error.status || "unknown"}`)
      setLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("GitHub login error:", error)
        setError(error.message)
        setLoading(false)
      }
    } catch (error: any) {
      console.error("GitHub login error:", error)
      setError(error.message || "GitHub login failed")
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setError(null)
        alert("Password reset email sent. Check your inbox.")
      }
    } catch (error: any) {
      setError(error.message || "Failed to send password reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your email and password to login to your account</CardDescription>
        </CardHeader>
        {isClient ? (
          // Only render form on client-side to avoid hydration issues
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {debugInfo && (
              <Alert variant="default" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <AlertDescription className="text-xs">{debugInfo}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={loading}
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button variant="outline" type="button" className="w-full" onClick={handleGithubLogin} disabled={loading}>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </CardContent>
        ) : (
          // Show a loading placeholder until client-side rendering takes over
          <CardContent className="space-y-4">
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading login form...</p>
            </div>
          </CardContent>
        )}
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
