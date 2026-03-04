"use server"

import { createClient } from "@/lib/supabase/server"
import { generateOfferteText, generateOfferteDoc } from "@/lib/generate-offerte"

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

export async function submitOfferte(payload: OffertePayload) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "Je moet ingelogd zijn om een offerte te versturen",
      }
    }

    const email = user.email || ""
    const domain = email.split("@")[1]
    const allowedDomains = ["waveaisolutions.nl", "dongemondklimaattechniek.nl"]

    if (!allowedDomains.includes(domain)) {
      return {
        success: false,
        error: "Je account heeft geen toegang tot deze functie",
      }
    }

    if (!payload.customer.email || !isValidEmail(payload.customer.email)) {
      return {
        success: false,
        error: "Vul een geldig email adres in voor de klant",
      }
    }

    if (!payload.customer.phone) {
      return {
        success: false,
        error: "Vul een telefoonnummer in voor de klant",
      }
    }

    if (!payload.customer.postcode) {
      return {
        success: false,
        error: "Vul een postcode in voor de klant",
      }
    }

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
      return {
        success: false,
        error: "N8N webhook is niet geconfigureerd. Voeg N8N_WEBHOOK_URL toe aan environment variables.",
      }
    }

    // Genereer AI-tekst
    const aiOutput = await generateOfferteText(sanitizedPayload)

    // Genereer .docx bestand
    const docBuffer = await generateOfferteDoc(sanitizedPayload, aiOutput)

    // Bestandsnaam op basis van offertenummer
    const offerteNummer = sanitizedPayload.customer.quotationNumber || Date.now().toString()
    const filename = `Offerte-DKT-${offerteNummer}.docx`

    // Stuur alleen het bestand + metadata naar n8n
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemType: sanitizedPayload.systemType,
        filename,
        fileBase64: docBuffer.toString("base64"),
        customerEmail: sanitizedPayload.customer.email,
        submittedBy: email,
        submittedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `Webhook error (${response.status}): ${errorText.substring(0, 100)}`,
      }
    }

    return {
      success: true,
      message: "Offerte succesvol gegenereerd en verzonden!",
    }
  } catch (error) {
    console.error("[DKT] Error in submitOfferte:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
    }
  }
}
