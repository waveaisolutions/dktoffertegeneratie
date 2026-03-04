import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const ALLOWED_DOMAINS = ["waveaisolutions.nl", "dongemondklimaattechniek.nl"] // Updated to only allow waveaisolutions.nl and dongemondklimaattechniek.nl

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (data?.user?.email) {
      const emailDomain = data.user.email.split("@")[1]

      if (!ALLOWED_DOMAINS.includes(emailDomain)) {
        console.log(`[v0] Login geblokkeerd voor domein: ${emailDomain}`)

        // Uitloggen van de gebruiker
        await supabase.auth.signOut()

        // Redirect naar login met error
        return NextResponse.redirect(
          `${origin}/login?error=unauthorized_domain&error_description=Dit email domein is niet toegestaan. Alleen gebruikers van ${ALLOWED_DOMAINS.join(", ")} kunnen inloggen.`,
        )
      }

      console.log(`[v0] Login toegestaan voor domein: ${emailDomain}`)
    }

    if (error) {
      console.error("[v0] Error exchanging code:", error)
      return NextResponse.redirect(`${origin}/login?error=auth_error&error_description=${error.message}`)
    }
  }

  // Redirect naar de hoofdpagina na succesvolle login
  return NextResponse.redirect(`${origin}/`)
}
