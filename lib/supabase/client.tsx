"use client"

import type React from "react"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createContext, useContext, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type SupabaseContext = {
  supabase: SupabaseClient<Database>
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

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [supabase] = useState(() => {
    const client = createClientComponentClient<Database>()

    // Log auth state changes during development
    if (process.env.NODE_ENV === "development") {
      client.auth.onAuthStateChange((event, session) => {
        console.log(`Auth event: ${event}`, session ? `User: ${session.user.email}` : "No session")
      })
    }

    return client
  })

  return <Context.Provider value={{ supabase }}>{children}</Context.Provider>
}
