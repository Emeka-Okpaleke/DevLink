import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Pass cookies directly to the client
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get the current user if logged in
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get the IP address from the request
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"

    // Get the user agent
    const userAgent = request.headers.get("user-agent") || ""

    // Track the view - use the parameter names that match the updated function
    const { data, error } = await supabase.rpc("track_project_view", {
      p_project_id: projectId,
      p_user_id: user?.id || null,
      p_ip_address: ip,
      p_user_agent: userAgent,
    })

    if (error) {
      console.error("Error tracking view:", error)
      return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
    }

    return NextResponse.json({ viewCount: data })
  } catch (error) {
    console.error("Error in track-view route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
