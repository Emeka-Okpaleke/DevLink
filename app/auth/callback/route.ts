import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_code = requestUrl.searchParams.get("error_code")

  // Handle error cases
  if (error || error_code) {
    // Redirect to login page with error message
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${error || ""}&error_code=${error_code || ""}`)
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    try {
      // Exchange code for session
      await supabase.auth.exchangeCodeForSession(code)

      // Get user after authentication
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        // If no profile, create one
        if (profileError && profileError.code === "PGRST116") {
          // Generate a username from email or random string
          let username = user.email?.split("@")[0] || `user_${Math.floor(Math.random() * 10000)}`

          // Check if username exists
          const { data: existingUser } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", username)
            .single()

          // If username exists, append random string
          if (existingUser) {
            username = `${username}${Math.floor(Math.random() * 1000)}`
          }

          // Create profile
          const { error: insertError } = await supabase.from("profiles").insert({
            id: user.id,
            username,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            is_public: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error creating profile:", insertError)
            // Continue anyway, we'll handle this on the dashboard
          }
        }
      }

      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    } catch (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`)
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code_provided`)
}
