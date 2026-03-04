"use server"

import { createClient } from "@/lib/supabase/server"

interface OffertePayload {
  systemType: string
  customer: {
    type: string
    address: string
    postcode: string
    city: string
    phone: string
    email: string
    salutation: string
    dateRecorded: string
    quotationDate: string
    quotationNumber: string
  }
  options: Record<string, any>
}

function sanitizeString(input: string): string {
  if (typeof input !== "string") return ""
  return input
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 500)
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, "")
  return cleaned.length >= 10 && cleaned.length <= 15
}

function isValidPostcode(postcode: string): boolean {
  const cleaned = postcode.replace(/\s/g, "").toUpperCase()
  return cleaned.length >= 6 && cleaned.length <= 7
}

export async function submitOfferte(payload: OffertePayload) {
  try {
    console.log("[v0] Server: Submit offerte called")
    const supabase = await createClient()

    console.log("[v0] Server: Checking authentication")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Server: Auth error:", authError)
      return {
        success: false,
        error: "Je moet ingelogd zijn om een offerte te versturen",
      }
    }

    console.log("[v0] Server: User authenticated:", user.email)

    const email = user.email || ""
    const domain = email.split("@")[1]
    const allowedDomains = ["waveaisolutions.nl", "dongemondklimaattechniek.nl"]

    if (!allowedDomains.includes(domain)) {
      console.log("[v0] Server: Domain not allowed:", domain)
      return {
        success: false,
        error: "Je account heeft geen toegang tot deze functie",
      }
    }

    console.log("[v0] Server: Validating customer data")

    if (!payload.customer.email || !isValidEmail(payload.customer.email)) {
      console.log("[v0] Server: Invalid customer email:", payload.customer.email)
      return {
        success: false,
        error: "Vul een geldig email adres in voor de klant",
      }
    }

    if (!payload.customer.phone) {
      console.log("[v0] Server: Missing phone")
      return {
        success: false,
        error: "Vul een telefoonnummer in voor de klant",
      }
    }

    if (!payload.customer.postcode) {
      console.log("[v0] Server: Missing postcode")
      return {
        success: false,
        error: "Vul een postcode in voor de klant",
      }
    }

    console.log("[v0] Server: Sanitizing payload")
    const sanitizedPayload = {
      systemType: sanitizeString(payload.systemType),
      customer: {
        type: sanitizeString(payload.customer.type),
        address: sanitizeString(payload.customer.address),
        postcode: sanitizeString(payload.customer.postcode),
        city: sanitizeString(payload.customer.city),
        phone: sanitizeString(payload.customer.phone),
        email: sanitizeString(payload.customer.email),
        salutation: sanitizeString(payload.customer.salutation),
        dateRecorded: sanitizeString(payload.customer.dateRecorded),
        quotationDate: sanitizeString(payload.customer.quotationDate),
        quotationNumber: sanitizeString(payload.customer.quotationNumber),
      },
      options: payload.options,
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL

    if (!webhookUrl) {
      console.log("[v0] Server: Webhook URL not configured")
      return {
        success: false,
        error: "N8N webhook is niet geconfigureerd. Voeg N8N_WEBHOOK_URL toe aan environment variables.",
      }
    }

    console.log("[v0] Server: Full webhook URL:", webhookUrl)
    console.log("[v0] Server: Webhook URL length:", webhookUrl.length)

    console.log("[v0] Server: Sending to webhook...")

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...sanitizedPayload,
        submittedBy: email,
        submittedAt: new Date().toISOString(),
      }),
    })

    console.log("[v0] Server: Webhook response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Server: Webhook failed:", errorText)
      return {
        success: false,
        error: `Webhook error (${response.status}): ${errorText.substring(0, 100)}`,
      }
    }

    console.log("[v0] Server: Webhook success!")

    return {
      success: true,
      message: "Offerte succesvol verzonden!",
    }
  } catch (error) {
    console.error("[v0] Server: Error in submitOfferte:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
    }
  }
}
