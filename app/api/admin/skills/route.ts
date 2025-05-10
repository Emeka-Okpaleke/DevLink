import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Fetch all skills
  const { data: skills, error: skillsError } = await supabase.from("skills").select("*").order("name")

  if (skillsError) {
    return NextResponse.json({ error: skillsError.message }, { status: 500 })
  }

  return NextResponse.json({ skills })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { name } = await request.json()

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Skill name is required" }, { status: 400 })
    }

    // Add new skill
    const { data, error } = await supabase.from("skills").insert({ name: name.trim() }).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ skill: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid request" }, { status: 400 })
  }
}
