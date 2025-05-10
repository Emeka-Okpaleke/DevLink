import { createServerClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DebugProfilePage() {
  const supabase = await createServerClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Test results container
  const results = {
    auth: { success: !authError, data: user, error: authError },
    directQuery: { success: false, data: null, error: null },
    functionQuery: { success: false, data: null, error: null },
    rpcQuery: { success: false, data: null, error: null },
  }

  // Only run tests if we have a user
  if (user) {
    try {
      // Test 1: Direct query to profiles table
      const { data: directData, error: directError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      results.directQuery = {
        success: !directError && !!directData,
        data: directData,
        error: directError,
      }
    } catch (e) {
      results.directQuery.error = e
    }

    try {
      // Test 2: Using our custom function
      const { data: functionData, error: functionError } = await supabase
        .rpc("get_profile_by_id", { user_id: user.id })
        .maybeSingle()

      results.functionQuery = {
        success: !functionError && !!functionData,
        data: functionData,
        error: functionError,
      }
    } catch (e) {
      results.functionQuery.error = e
    }

    try {
      // Test 3: Simple RPC call to test database connection
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_service_role")

      results.rpcQuery = {
        success: !rpcError,
        data: rpcData,
        error: rpcError,
      }
    } catch (e) {
      results.rpcQuery.error = e
    }
  }

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-6">Profile Debug Page</h1>

      <div className="grid gap-6">
        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            {results.auth.success ? (
              <Alert>
                <AlertTitle>Authenticated</AlertTitle>
                <AlertDescription>
                  User ID: {results.auth.data?.id}
                  <br />
                  Email: {results.auth.data?.email}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Not Authenticated</AlertTitle>
                <AlertDescription>Error: {JSON.stringify(results.auth.error)}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Direct Query Test */}
        <Card>
          <CardHeader>
            <CardTitle>Direct Profile Query Test</CardTitle>
          </CardHeader>
          <CardContent>
            {results.directQuery.success ? (
              <Alert>
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  <pre className="mt-2 w-full overflow-auto rounded-md bg-slate-950 p-4 text-xs text-white">
                    {JSON.stringify(results.directQuery.data, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Failed</AlertTitle>
                <AlertDescription>Error: {JSON.stringify(results.directQuery.error, null, 2)}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Function Query Test */}
        <Card>
          <CardHeader>
            <CardTitle>Function Query Test (get_profile_by_id)</CardTitle>
          </CardHeader>
          <CardContent>
            {results.functionQuery.success ? (
              <Alert>
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  <pre className="mt-2 w-full overflow-auto rounded-md bg-slate-950 p-4 text-xs text-white">
                    {JSON.stringify(results.functionQuery.data, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Failed</AlertTitle>
                <AlertDescription>Error: {JSON.stringify(results.functionQuery.error, null, 2)}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
