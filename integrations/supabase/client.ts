import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

function getClient() {
  if (typeof window === "undefined") {
    return {
      auth: {
        signInWithOAuth: async () => ({ data: null, error: new Error("Client-side only") }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
      },
    } as any
  }

  if (client) {
    return client
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  console.log("[v0] Creating Supabase client")
  console.log("[v0] URL:", url || "MISSING")
  console.log("[v0] Key:", key ? "present" : "MISSING")

  if (!url || !key) {
    console.error("[v0] Cannot create Supabase client - missing environment variables")
    return {
      auth: {
        signInWithOAuth: async () => ({
          data: null,
          error: new Error(
            "Supabase environment variables zijn niet ingesteld. Voeg NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY toe in de Vars sectie.",
          ),
        }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
      },
    } as any
  }

  try {
    client = createBrowserClient(url, key)
    console.log("[v0] Supabase client created successfully")
    return client
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    return {
      auth: {
        signInWithOAuth: async () => ({
          data: null,
          error: error instanceof Error ? error : new Error("Failed to create client"),
        }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
      },
    } as any
  }
}

export const supabase = getClient()
