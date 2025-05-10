import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    // Update skill
    const { data, error } = await supabase
      .from("skills")
      .update({ name: name.trim() })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ skill: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

  // Check if skill is in use
  const { count: userCount, error: userCountError } = await supabase
    .from("user_skills")
    .select("*", { count: "exact", head: true })
    .eq("skill_id", params.id)

  if (userCountError) {
    return NextResponse.json({ error: userCountError.message }, { status: 500 })
  }

  const { count: projectCount, error: projectCountError } = await supabase
    .from("project_technologies")
    .select("*", { count: "exact", head: true })
    .eq("skill_id", params.id)

  if (projectCountError) {
    return NextResponse.json({ error: projectCountError.message }, { status: 500 })
  }

  if (userCount && userCount > 0) {
    return NextResponse.json({ error: "Cannot delete skill that is used by users" }, { status: 400 })
  }

  if (projectCount && projectCount > 0) {
    return NextResponse.json({ error: "Cannot delete skill that is used by projects" }, { status: 400 })
  }

  // Delete skill
  const { error: deleteError } = await supabase.from("skills").delete().eq("id", params.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
