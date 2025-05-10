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

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true)
  }, [])

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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Use window.location for a full page reload
      window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Login failed. Please check your credentials.")
      setLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      alert("Password reset email sent. Check your inbox.")
    }

    setLoading(false)
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
