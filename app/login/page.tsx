"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const ALLOWED_DOMAINS = ["waveaisolutions.nl", "dongemondklimaattechniek.nl"]

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get("error")
    const errorDescription = params.get("error_description")

    if (errorParam) {
      console.error("[v0] OAuth error:", errorParam, errorDescription)
      setError(errorDescription || errorParam)
    }
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const emailDomain = email.split("@")[1]
      if (!ALLOWED_DOMAINS.includes(emailDomain)) {
        throw new Error(
          `Dit email domein is niet toegestaan. Alleen gebruikers van ${ALLOWED_DOMAINS.join(", ")} kunnen inloggen.`,
        )
      }

      const supabase = createClient()

      if (!supabase || !supabase.auth) {
        throw new Error("Supabase client is niet beschikbaar")
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        router.push("/")
        router.refresh()
      }
    } catch (error: unknown) {
      console.error("[v0] Email login error:", error)
      setError(error instanceof Error ? error.message : "Onjuist email of wachtwoord")
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Starting Google login")
      const supabase = createClient()

      if (!supabase || !supabase.auth) {
        throw new Error("Supabase client is niet beschikbaar")
      }

      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log("[v0] Redirect URL:", redirectUrl)

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      })

      console.log("[v0] OAuth response:", { data, error: signInError })

      if (signInError) throw signInError
    } catch (error: unknown) {
      console.error("[v0] Login error:", error)
      setError(error instanceof Error ? error.message : "Er is een fout opgetreden")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 className="sectionTitle" style={{ fontSize: "32px", marginBottom: "0.5rem" }}>
              Welkom
            </h1>
            <p style={{ color: "#64748b", fontSize: "16px" }}>Log in om verder te gaan</p>
          </div>

          <form onSubmit={handleEmailLogin} style={{ marginBottom: "1.5rem" }}>
            <div style={{ marginBottom: "1rem", textAlign: "left" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#334155",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="jouw@email.nl"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#334155",
                }}
              >
                Wachtwoord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn"
              style={{
                width: "100%",
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Bezig met inloggen..." : "Inloggen met Email"}
            </button>
          </form>

          <div style={{ position: "relative", marginBottom: "1.5rem" }}>
            <div style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center" }}>
              <div style={{ width: "100%", borderTop: "1px solid #e2e8f0" }} />
            </div>
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <span style={{ backgroundColor: "white", padding: "0 12px", fontSize: "14px", color: "#64748b" }}>
                Of
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="btn"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLoading ? "Bezig met inloggen..." : "Inloggen met Google"}
          </button>

          {error && (
            <div
              style={{
                marginTop: "1rem",
                padding: "12px",
                backgroundColor: "#fee2e2",
                border: "1px solid #fca5a5",
                borderRadius: "8px",
                color: "#991b1b",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
