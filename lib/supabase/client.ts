import { createBrowserClient } from "@supabase/ssr"

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === "undefined") {
    console.log("[v0] Server-side rendering, skipping client creation")
    return {
      auth: {
        signInWithOAuth: async () => ({ data: null, error: new Error("Client-side only") }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
      },
    } as any
  }

  if (clientInstance) {
    return clientInstance
  }

  // Use the actual env variable values directly - Next.js replaces these at build time
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!url || !key) {
    console.error("[v0] Supabase environment variables are missing")
    console.error("[v0] URL:", url ? "present" : "missing")
    console.error("[v0] Key:", key ? "present" : "missing")

    return {
      auth: {
        signInWithOAuth: async () => ({
          data: null,
          error: new Error(
            "Supabase is niet correct geconfigureerd. Controleer de environment variables in de Vars sectie.",
          ),
        }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
      },
    } as any
  }

  try {
    clientInstance = createBrowserClient(url, key)
    console.log("[v0] Supabase client created with URL:", url)
    return clientInstance
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    return {
      auth: {
        signInWithOAuth: async () => ({ data: null, error: new Error("Failed to create Supabase client") }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
      },
    } as any
  }
}

export const supabase = createClient()
