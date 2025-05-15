"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github } from "lucide-react"
import { useSupabase } from "@/lib/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate inputs
      if (!username.trim()) {
        throw new Error("Username is required")
      }

      if (username.length < 3) {
        throw new Error("Username must be at least 3 characters")
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      // Check if username is available
      const { data: existingUser, error: usernameError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle()

      if (usernameError) {
        console.error("Error checking username:", usernameError)
      }

      if (existingUser) {
        throw new Error("Username is already taken")
      }

      // Get the current site URL (works in both development and production)
      const siteUrl = window.location.origin

      // Sign up with email and password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      // Check if email confirmation is required
      if (data?.user && !data?.session) {
        setSuccess("Registration successful! Please check your email for a confirmation link.")
      } else {
        // Create profile
        if (data?.user) {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            username,
            full_name: "",
            avatar_url: "",
            is_public: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error("Error creating profile:", profileError)
            // Continue anyway, we'll handle this on the dashboard
          }
        }

        if (data?.user && data?.session) {
          window.location.href = "/dashboard"
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      setError(error.message || "An error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSignup = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get the current site URL (works in both development and production)
      const siteUrl = window.location.origin

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error("GitHub signup error:", error)
      setError(error.message || "An error occurred during GitHub signup")
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
          <CardDescription>Create an account to showcase your developer portfolio</CardDescription>
        </CardHeader>
        {isClient ? (
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
              </div>
              <Button type="submit" className="w-full" disabled={loading || !!success}>
                {loading ? "Creating account..." : "Create account"}
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
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleGithubSignup}
              disabled={loading || !!success}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </CardContent>
        ) : (
          <CardContent className="space-y-4">
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading signup form...</p>
            </div>
          </CardContent>
        )}
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
