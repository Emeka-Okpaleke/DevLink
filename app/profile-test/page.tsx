import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProfileTestPage() {
  const supabase = createServerClient()

  // Get the current user
  const { data: authData, error: authError } = await supabase.auth.getUser()

  // Try to fetch the profile with detailed error logging
  let profileData = null
  let profileError = null

  if (authData?.user) {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", authData.user.id).maybeSingle()

      profileData = data
      profileError = error
    } catch (e) {
      profileError = e
    }
  }

  // Try a direct SQL query to check if we can access the profiles table
  let sqlResult = null
  let sqlError = null

  try {
    const { data, error } = await supabase.rpc("get_profile_by_id", {
      user_id: authData?.user?.id,
    })

    sqlResult = data
    sqlError = error
  } catch (e) {
    sqlError = e
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Profile Test Page</h1>

      <div className="mb-8 p-4 border rounded-md">
        <h2 className="text-xl font-semibold mb-2">Auth Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
          {JSON.stringify({ data: authData, error: authError }, null, 2)}
        </pre>
      </div>

      <div className="mb-8 p-4 border rounded-md">
        <h2 className="text-xl font-semibold mb-2">Profile Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
          {JSON.stringify({ data: profileData, error: profileError }, null, 2)}
        </pre>
      </div>

      <div className="mb-8 p-4 border rounded-md">
        <h2 className="text-xl font-semibold mb-2">SQL Query Result</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
          {JSON.stringify({ data: sqlResult, error: sqlError }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
