import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export function createServerClient() {
  // Don't await cookies() here - pass it directly to the client
  return createServerComponentClient<Database>({
    cookies,
  })
}
