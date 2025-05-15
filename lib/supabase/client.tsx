"use client"

import type React from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createContext, useContext, useState, useEffect } from "react"
import type { SupabaseClient, Session } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Define the SupabaseContext type properly with session
type SupabaseContext = {
  supabase: SupabaseClient<Database>
  session: Session | null // Explicitly define session as part of the context
  isLoading: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function useSupabase() {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}

export function createBrowserClient() {
  return createClientComponentClient<Database>()
}

// Helper function for retrying requests with exponential backoff
async function fetchWithRetry<T>(
  fetchFn: () => Promise<{ data: T | null; error: any }>,
  maxRetries = 3,
  initialDelay = 1000,
): Promise<{ data: T | null; error: any }> {
  let retries = 0
  let delay = initialDelay

  while (retries < maxRetries) {
    try {
      const result = await fetchFn()

      // If there's no error or it's not a rate limit error, return the result
      if (!result.error || !result.error.message?.includes("Too Many Requests")) {
        return result
      }

      // If we got a rate limit error, wait and retry
      console.warn(`Rate limit hit, retrying in ${delay}ms...`, result.error)
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Exponential backoff
      delay *= 2
      retries++
    } catch (error) {
      return { data: null, error }
    }
  }

  // If we've exhausted all retries, return the last error
  return { data: null, error: new Error(`Failed after ${maxRetries} retries due to rate limiting`) }
}

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [supabase] = useState(() => createClientComponentClient<Database>())
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await fetchWithRetry(() => supabase.auth.getSession())

        if (error) {
          console.error("Error getting session:", error.message)
        }
        setSession(data?.session || null)
      } catch (error) {
        console.error("Unexpected error during getSession:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return <Context.Provider value={{ supabase, session, isLoading }}>{children}</Context.Provider>
}
