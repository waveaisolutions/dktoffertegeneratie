"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { submitOfferte } from "./actions/submit-offerte"

type NoteField = { value: string; note: string }

type ACSubOption = {
  enabled: boolean
  location: NoteField
  indoorUnitPlace: NoteField
  color: NoteField
  daikinType: NoteField
  outdoorType: NoteField
  outdoorPlace: NoteField
  pipeRoute: NoteField
  acType: NoteField
  dryCoreDrilling: NoteField
  concrete: NoteField
  gutterColor: NoteField
  access: NoteField
  roofPassThrough: NoteField
  roofer: NoteField
  wallBrackets: NoteField
  power: NoteField
  drain: NoteField
  cornerPump: NoteField
  hardToReach: NoteField
  remarks: string
}

type HPSubOption = {
  enabled: boolean
  hpTypeModel: NoteField
  panasonicOptions: NoteField
  daikinOptions: NoteField
  smokePipeReplacement: NoteField
  hotWaterTank: NoteField
  roofPassThrough: NoteField
  roofAccessibility: NoteField
  currentGasUsage: NoteField
  livingArea: NoteField
  indoorUnitLocation: NoteField
  indoorUnitPlace: NoteField
  coolingPipeColorGutter: NoteField
  meterCoolingPipe: NoteField
  trace: NoteField
  throughRooms: NoteField
  currentCvPipeDiameter: NoteField
  currentWaterPipeDiameter: NoteField
  bathPresent: NoteField
  rainShowerPresent: NoteField
  numberOfPeople: NoteField
  hotWaterTank300L: NoteField
  hotWaterTank300LEasy: NoteField
  hotWaterTankCoil: NoteField
  existingDrainDiameter: NoteField
  floorHeatingBG: NoteField
  floorHeating1st: NoteField
  radiators: NoteField
  bufferTank: NoteField
  externalCirculationPump: NoteField
  controlAccessible: NoteField
  reuseThermostatCabling: NoteField
  outdoorUnitPlace: NoteField
  dryDiamondDrilling: NoteField
  dryDiamondDrillingCount: NoteField
  roofWallPassThrough: NoteField
  wallBrackets: NoteField
  verticalTransport: NoteField
  powerSupply: NoteField
  voltage380Present: NoteField
  energyReportRequired: NoteField
  difficult: NoteField
  olderHome: NoteField
  remarks: string
}

type ACOptions = Record<"1" | "2" | "3", Record<string, ACSubOption>>
type HPOptions = { [k: string]: HPSubOption }

const blankACSub = (isDefault = false): ACSubOption => ({
  enabled: isDefault,
  location: { value: "", note: "" },
  indoorUnitPlace: { value: "", note: "" },
  color: { value: "", note: "" },
  daikinType: { value: "", note: "" },
  outdoorType: { value: "", note: "" },
  outdoorPlace: { value: "", note: "" },
  pipeRoute: { value: "", note: "" },
  acType: { value: "", note: "" },
  dryCoreDrilling: { value: "", note: "" },
  concrete: { value: "", note: "" },
  gutterColor: { value: "", note: "" },
  access: { value: "", note: "" },
  roofPassThrough: { value: "", note: "" },
  roofer: { value: "", note: "" },
  wallBrackets: { value: "", note: "" },
  power: { value: "", note: "" },
  drain: { value: "", note: "" },
  cornerPump: { value: "", note: "" },
  hardToReach: { value: "", note: "" },
  remarks: "",
})

const blankHPSub = (): HPSubOption => ({
  enabled: false,
  hpTypeModel: { value: "", note: "" },
  panasonicOptions: { value: "", note: "" },
  daikinOptions: { value: "", note: "" },
  smokePipeReplacement: { value: "", note: "" },
  hotWaterTank: { value: "", note: "" },
  roofPassThrough: { value: "", note: "" },
  roofAccessibility: { value: "", note: "" },
  currentGasUsage: { value: "", note: "" },
  livingArea: { value: "", note: "" },
  indoorUnitLocation: { value: "", note: "" },
  indoorUnitPlace: { value: "", note: "" },
  coolingPipeColorGutter: { value: "", note: "" },
  meterCoolingPipe: { value: "", note: "" },
  trace: { value: "", note: "" },
  throughRooms: { value: "", note: "" },
  currentCvPipeDiameter: { value: "", note: "" },
  currentWaterPipeDiameter: { value: "", note: "" },
  bathPresent: { value: "", note: "" },
  rainShowerPresent: { value: "", note: "" },
  numberOfPeople: { value: "", note: "" },
  hotWaterTank300L: { value: "", note: "" },
  hotWaterTank300LEasy: { value: "", note: "" },
  hotWaterTankCoil: { value: "", note: "" },
  existingDrainDiameter: { value: "", note: "" },
  floorHeatingBG: { value: "", note: "" },
  floorHeating1st: { value: "", note: "" },
  radiators: { value: "", note: "" },
  bufferTank: { value: "", note: "" },
  externalCirculationPump: { value: "", note: "" },
  controlAccessible: { value: "", note: "" },
  reuseThermostatCabling: { value: "", note: "" },
  outdoorUnitPlace: { value: "", note: "" },
  dryDiamondDrilling: { value: "", note: "" },
  dryDiamondDrillingCount: { value: "", note: "" },
  roofWallPassThrough: { value: "", note: "" },
  wallBrackets: { value: "", note: "" },
  verticalTransport: { value: "", note: "" },
  powerSupply: { value: "", note: "" },
  voltage380Present: { value: "", note: "" },
  energyReportRequired: { value: "", note: "" },
  difficult: { value: "", note: "" },
  olderHome: { value: "", note: "" },
  remarks: "",
})

const acFieldOptions: { [key: string]: string[] } = {
  location: ["Slaapkamer", "Woonkamer", "Zolder", "Anders"],
  indoorUnitPlace: [],
  color: ["Zwart", "Wit", "Zilver", "Anders"],
  daikinType: ["FTXF", "FTXP", "FTXM", "FVXM", "FTXA", "FTXJ"],
  outdoorType: ["RXM", "RXF", "RXJ", "RXP", "RXA", "2MXM68", "3MXM68", "4MXM80"],
  outdoorPlace: ["Voorgevel", "Voortuin", "Achtergevel", "Dak", "Zijmuur"],
  pipeRoute: ["Onder dakbeschot", "Langs dakbeschot", "Binnenlangs", "Buitenlangs", "Anders"],
  acType: ["Split", "MS1", "MS2", "MS3", "MS4", "MS5"],
  dryCoreDrilling: ["Ja", "Nee"],
  concrete: ["Ja", "Nee"],
  gutterColor: ["Wit", "Crème", "Zwart"],
  access: ["Liftje", "Steiger", "Geen bijzonderheden"],
  roofPassThrough: ["Ja", "Nee"],
  roofer: ["Derden", "Wij"],
  wallBrackets: ["Ja", "Nee"],
  power: ["Derde buitend", "Wij–WS", "Wij–Stekker", "Wij–WCD"],
  drain: ["Vast", "Pompje"],
  cornerPump: ["Ja", "Nee"],
  hardToReach: ["Ja", "Nee"],
}

const hpFieldOptions: { [key: string]: string[] } = {
  panasonicOptions: ["J-gen", "T-Cap", "T-Cap Silent", "Hybride + PLUS"],
  daikinOptions: [
    "Hybride: EHYHBH08AV3 heating only + EVLQ08CV3 + NHYKOMB33AA2/3",
    "Hybride koelen/verwarmen: EHYHBX08AV3 + EVLQ08CV3 + NHYKOMB33AA2/3",
    "55 °C: EHBH/EHBX + ERGA/EVH7",
    "60 °C: EBBH/EBBX + ERLA/DW17",
    "Hydrosplit: 65–70 °C",
  ],
  smokePipeReplacement: ["Ja", "Nee"],
  hotWaterTank: ["Ja", "Nee"],
  roofPassThrough: ["Vervangen", "Aanbrengen", "Hergebruik", "Niet van toepassing"],
  roofAccessibility: ["Makkelijk", "Moeilijk"],
  indoorUnitLocation: ["Begane grond", "1e verdieping"],
  coolingPipeColorGutter: ["Wit", "Crème", "Zwart"],
  trace: ["Onder dakbeschot", "Langs dakbeschot", "Binnenlangs"],
  throughRooms: ["0", "1", "2", "3", "4+"],
  currentCvPipeDiameter: ["15", "22", "28"],
  currentWaterPipeDiameter: ["12", "15", "22"],
  bathPresent: ["Ja", "Nee"],
  rainShowerPresent: ["Ja", "Nee"],
  numberOfPeople: ["1", "2", "3", "4", "5+"],
  hotWaterTank300L: ["Ja", "Nee", "Geïntegreerd All-in-One 230 L"],
  hotWaterTank300LEasy: ["Ja", "Nee"],
  hotWaterTankCoil: ["Met spiraal", "Zonder spiraal", "Niet van toepassing"],
  existingDrainDiameter: ["32", "40", "50"],
  floorHeatingBG: ["Ja", "Nee"],
  floorHeating1st: ["Ja", "Nee"],
  radiators: ["Begane grond", "1e verdieping", "Zolder", "Gang", "Anders"],
  bufferTank: ["20 L", "50 L", "100 L"],
  externalCirculationPump: ["Ja", "Nee"],
  controlAccessible: ["Ja", "Nee"],
  reuseThermostatCabling: ["Ja", "Nee"],
  outdoorUnitPlace: ["Boven plat dak", "Gevel", "Op de grond", "Anders"],
  dryDiamondDrilling: ["Ja", "Nee"],
  roofWallPassThrough: ["Ja", "Nee"],
  wallBrackets: ["Ja", "Nee"],
  verticalTransport: ["Liftje", "Kanalenlift", "Niet van toepassing"],
  voltage380Present: ["Ja", "Nee"],
  energyReportRequired: ["Ja", "Nee"],
  difficult: ["Ja", "Nee"],
  olderHome: ["Ja", "Nee"],
}

type ACFieldProps = {
  label: string
  i: "1" | "2" | "3"
  j: string
  k: keyof ACSubOption
  currentValue: string
  currentNote: string
  onValueChange: (value: string) => void
  onNoteChange: (note: string) => void
  multiSelect?: boolean
}

type HPFieldProps = {
  label: string
  optionKey: "1" | "2"
  k: keyof HPSubOption
  currentValue: string
  currentNote: string
  onValueChange: (value: string) => void
  onNoteChange: (note: string) => void
  isTextInput?: boolean
  multiSelect?: boolean
}

function ACField({ label, k, currentValue, currentNote, onValueChange, onNoteChange, multiSelect }: ACFieldProps) {
  const opts = acFieldOptions[k as string] || []
  const selectedValues = multiSelect && currentValue ? currentValue.split(", ").filter(Boolean) : []

  const handleMultiToggle = (opt: string) => {
    if (selectedValues.includes(opt)) {
      onValueChange(selectedValues.filter((v) => v !== opt).join(", "))
    } else {
      onValueChange([...selectedValues, opt].join(", "))
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <label className="label" style={{ fontSize: 16 }}>
        {label}
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        {opts.map((opt) => {
          const isSelected = multiSelect ? selectedValues.includes(opt) : currentValue === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => multiSelect ? handleMultiToggle(opt) : onValueChange(currentValue === opt ? "" : opt)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: isSelected ? "2px solid #0066cc" : "2px solid #ddd",
                background: isSelected ? "#e6f2ff" : "#fff",
                color: isSelected ? "#0066cc" : "#333",
                cursor: "pointer",
                fontFamily: "Calibri, sans-serif",
                fontSize: 14,
                fontWeight: isSelected ? 600 : 400,
                transition: "all 0.2s",
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
      <input
        className="note"
        value={currentNote}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Opmerking"
      />
    </div>
  )
}

function HPField({
  label,
  k,
  currentValue,
  currentNote,
  onValueChange,
  onNoteChange,
  isTextInput,
  multiSelect,
}: HPFieldProps) {
  const opts = hpFieldOptions[k as string] || []

  const selectedValues = multiSelect && currentValue ? currentValue.split(", ") : []

  const handleMultiSelectToggle = (opt: string) => {
    if (selectedValues.includes(opt)) {
      const newValues = selectedValues.filter((v) => v !== opt)
      onValueChange(newValues.join(", "))
    } else {
      const newValues = [...selectedValues, opt]
      onValueChange(newValues.join(", "))
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <label className="label" style={{ fontSize: 16 }}>
        {label}
      </label>
      {isTextInput || opts.length === 0 ? (
        <input
          className="input"
          value={currentValue}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={label}
          style={{ marginBottom: 8 }}
        />
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {opts.map((opt) => {
            const isSelected = multiSelect ? selectedValues.includes(opt) : currentValue === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => (multiSelect ? handleMultiSelectToggle(opt) : onValueChange(currentValue === opt ? "" : opt))}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: isSelected ? "2px solid #0066cc" : "2px solid #ddd",
                  background: isSelected ? "#e6f2ff" : "#fff",
                  color: isSelected ? "#0066cc" : "#333",
                  cursor: "pointer",
                  fontFamily: "Calibri, sans-serif",
                  fontSize: 14,
                  fontWeight: isSelected ? 600 : 400,
                  transition: "all 0.2s",
                }}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )}
      <input
        className="note"
        value={currentNote}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Opmerking"
      />
    </div>
  )
}

export default function Page() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // This state should be declared at the top level of the component
  const [systemType, setSystemType] = useState<"Airconditioning" | "Warmtepomp">("Airconditioning")
  const [customer, setCustomer] = useState({
    type: "Particulier",
    address: "",
    postcode: "",
    city: "",
    phone: "",
    email: "",
    salutation: "",
    dateRecorded: "",
    quotationDate: "",
    quotationNumber: "",
  })

  const [acOptions, setAcOptions] = useState<ACOptions>({
    "1": { "1": blankACSub(true) },
    "2": { "1": blankACSub(false) },
    "3": { "1": blankACSub(false) },
  })

  const [hpOptions, setHpOptions] = useState<HPOptions>({
    "1": blankHPSub(),
    "2": blankHPSub(),
  })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
      } else {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 50,
              height: 50,
              border: "4px solid #e2e8f0",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#64748b", fontSize: 16 }}>Bezig met laden...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const toggleACEnabled = (i: "1" | "2" | "3", j: string) => {
    setAcOptions((prev) => ({
      ...prev,
      [i]: {
        ...prev[i],
        [j]: {
          ...prev[i][j],
          enabled: !prev[i][j].enabled,
        },
      },
    }))
  }

  const addACSubOption = (i: "1" | "2" | "3") => {
    setAcOptions((prev) => {
      const keys = Object.keys(prev[i])
      if (keys.length >= 6) return prev
      const nextKey = String(keys.length + 1)
      return {
        ...prev,
        [i]: {
          ...prev[i],
          [nextKey]: blankACSub(true),
        },
      }
    })
  }

  const removeACSubOption = (i: "1" | "2" | "3", j: string) => {
    setAcOptions((prev) => {
      const entries = Object.values(prev[i]).filter((_, idx) => String(idx + 1) !== j)
      const reumbered: Record<string, ACSubOption> = {}
      entries.forEach((sub, idx) => {
        reumbered[String(idx + 1)] = sub
      })
      return { ...prev, [i]: reumbered }
    })
  }

  const toggleHPEnabled = (optionKey: "1" | "2") => {
    setHpOptions((prev) => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        enabled: !prev[optionKey].enabled,
      },
    }))
  }

  const updateACFieldValue = (i: "1" | "2" | "3", j: string, field: keyof ACSubOption, value: string) => {
    setAcOptions((prev) => ({
      ...prev,
      [i]: {
        ...prev[i],
        [j]: {
          ...prev[i][j],
          [field]: { ...(prev[i][j][field] as NoteField), value },
        },
      },
    }))
  }

  const updateACFieldNote = (i: "1" | "2" | "3", j: string, field: keyof ACSubOption, note: string) => {
    setAcOptions((prev) => ({
      ...prev,
      [i]: {
        ...prev[i],
        [j]: {
          ...prev[i][j],
          [field]: { ...(prev[i][j][field] as NoteField), note },
        },
      },
    }))
  }

  const updateACRemarks = (i: "1" | "2" | "3", j: string, remarks: string) => {
    setAcOptions((prev) => ({
      ...prev,
      [i]: {
        ...prev[i],
        [j]: {
          ...prev[i][j],
          remarks,
        },
      },
    }))
  }

  const updateHPFieldValue = (optionKey: "1" | "2", field: keyof HPSubOption, value: string) => {
    setHpOptions((prev) => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        [field]: { ...(prev[optionKey][field] as NoteField), value },
      },
    }))
  }

  const updateHPFieldNote = (optionKey: "1" | "2", field: keyof HPSubOption, note: string) => {
    setHpOptions((prev) => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        [field]: { ...(prev[optionKey][field] as NoteField), note },
      },
    }))
  }

  const updateHPRemarks = (optionKey: "1" | "2", remarks: string) => {
    setHpOptions((prev) => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        remarks,
      },
    }))
  }

  const updateSalutation = (salutation: string) => {
    setCustomer((prev) => ({ ...prev, salutation }))
  }

  const save = async () => {
    console.log("[v0] Starting form submission")
    const payload = {
      systemType,
      customer,
      options: systemType === "Airconditioning" ? acOptions : hpOptions,
    }

    console.log("[v0] Payload:", JSON.stringify(payload, null, 2))

    try {
      console.log("[v0] Calling submitOfferte")
      const result = await submitOfferte(payload)
      console.log("[v0] Result:", result)

      if (result.success) {
        alert(result.message || "Offerte succesvol verzonden!")
      } else {
        console.error("[v0] Submission failed:", result.error)
        alert(result.error || "Er is een fout opgetreden bij het verzenden.")
      }
    } catch (error) {
      console.error("[v0] Submit error:", error)
      alert("Kan geen verbinding maken met de server.")
    }
  }

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 24, position: "relative" }}>
      <button
        onClick={async () => {
          const supabase = createClient()
          await supabase.auth.signOut()
          router.push("/login")
        }}
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          padding: "10px 20px",
          borderRadius: 8,
          border: "2px solid #e2e8f0",
          background: "#ffffff",
          color: "#64748b",
          cursor: "pointer",
          fontFamily: "Calibri, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          transition: "all 0.3s",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#3b82f6"
          e.currentTarget.style.color = "#3b82f6"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e2e8f0"
          e.currentTarget.style.color = "#64748b"
        }}
      >
        Uitloggen
      </button>

      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 24,
          background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textAlign: "center",
          letterSpacing: "1px",
        }}
      >
        Offerte-configurator
      </h1>

      <section className="card" style={{ marginBottom: 24 }}>
        <div className="sectionTitle">Type systeem</div>
        <div style={{ display: "flex", gap: 12 }}>
          {(["Airconditioning", "Warmtepomp"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSystemType(type)}
              style={{
                flex: 1,
                padding: "16px 24px",
                borderRadius: 12,
                border: systemType === type ? "3px solid #3b82f6" : "2px solid #e2e8f0",
                background: systemType === type ? "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)" : "#ffffff",
                color: systemType === type ? "#ffffff" : "#64748b",
                cursor: "pointer",
                fontFamily: "Calibri, sans-serif",
                fontSize: 18,
                fontWeight: 600,
                transition: "all 0.3s",
                boxShadow: systemType === type ? "0 0 20px rgba(59, 130, 246, 0.4)" : "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* Gegevens klant */}
      <section className="card">
        <div className="sectionTitle">Gegevens klant</div>
        <label className="label">Aanhef</label>
        <input
          className="input"
          value={customer.salutation}
          onChange={(e) => updateSalutation(e.target.value)}
          placeholder="Aanhef"
        />
        <label className="label">Type klant</label>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          {["Particulier", "Zakelijk"].map((t) => (
            <label key={t} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="radio"
                name="custType"
                checked={customer.type === t}
                onChange={() => setCustomer({ ...customer, type: t })}
              />
              {t}
            </label>
          ))}
        </div>
        <label className="label">Adres</label>
        <input
          className="input"
          value={customer.address}
          onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
          placeholder="Straat en huisnummer"
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="label">Postcode</label>
            <input
              className="input"
              value={customer.postcode}
              onChange={(e) => setCustomer({ ...customer, postcode: e.target.value })}
              placeholder="1234 AB"
            />
          </div>
          <div>
            <label className="label">Plaats</label>
            <input
              className="input"
              value={customer.city}
              onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
              placeholder="Plaatsnaam"
            />
          </div>
        </div>
        <label className="label">Telefoonnummer</label>
        <input
          className="input"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          placeholder="06 12345678"
        />
        <label className="label">E-mailadres</label>
        <input
          className="input"
          value={customer.email}
          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
          placeholder="naam@voorbeeld.nl"
        />

        <label className="label">Offertedatum</label>
        <input
          className="input"
          type="date"
          value={customer.quotationDate}
          onChange={(e) => setCustomer({ ...customer, quotationDate: e.target.value })}
        />

        <label className="label">Offertenummer</label>
        <input
          className="input"
          value={customer.quotationNumber}
          onChange={(e) => setCustomer({ ...customer, quotationNumber: e.target.value })}
        />
      </section>

      {systemType === "Airconditioning" ? (
        <>
          {(["1", "2", "3"] as const).map((i) => (
            <section key={i} className="card">
              <div className="sectionTitle">Optie {i}</div>
              {Object.keys(acOptions[i]).map((j) => {
                const subOption = acOptions[i][j]

                return (
                  <div key={j} className="subCard" style={{ marginBottom: 32 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#60a5fa", display: "flex", alignItems: "center" }}>
                        Suboptie {i}.{j}
                        {Object.keys(acOptions[i]).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeACSubOption(i, j)}
                            style={{
                              marginLeft: "8px",
                              padding: "2px 8px",
                              fontSize: "12px",
                              border: "1px solid #ef4444",
                              borderRadius: "4px",
                              background: "transparent",
                              color: "#ef4444",
                              cursor: "pointer",
                            }}
                          >
                            Verwijderen
                          </button>
                        )}
                      </h3>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => toggleACEnabled(i, j)}
                          style={{
                            padding: "8px 20px",
                            borderRadius: 8,
                            border: subOption.enabled ? "2px solid #22c55e" : "2px solid #ddd",
                            background: subOption.enabled ? "#22c55e" : "#fff",
                            color: subOption.enabled ? "#fff" : "#333",
                            cursor: "pointer",
                            fontFamily: "Calibri, sans-serif",
                            fontSize: 14,
                            fontWeight: 600,
                            transition: "all 0.2s",
                          }}
                        >
                          Ja
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleACEnabled(i, j)}
                          style={{
                            padding: "8px 20px",
                            borderRadius: 8,
                            border: !subOption.enabled ? "2px solid #ef4444" : "2px solid #ddd",
                            background: !subOption.enabled ? "#ef4444" : "#fff",
                            color: !subOption.enabled ? "#fff" : "#333",
                            cursor: "pointer",
                            fontFamily: "Calibri, sans-serif",
                            fontSize: 14,
                            fontWeight: 600,
                            transition: "all 0.2s",
                          }}
                        >
                          Nee
                        </button>
                      </div>
                    </div>

                    {subOption.enabled && (
                      <>
                        <ACField
                          label="Locatie Airco"
                          i={i}
                          j={j}
                          k="location"
                          currentValue={subOption.location.value}
                          currentNote={subOption.location.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "location", value)}
                          multiSelect={true}
                          onNoteChange={(note) => updateACFieldNote(i, j, "location", note)}
                        />
                        <ACField
                          label="Plaats binnendeel"
                          i={i}
                          j={j}
                          k="indoorUnitPlace"
                          currentValue={subOption.indoorUnitPlace.value}
                          currentNote={subOption.indoorUnitPlace.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "indoorUnitPlace", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "indoorUnitPlace", note)}
                        />
                        <ACField
                          label="Kleur"
                          i={i}
                          j={j}
                          k="color"
                          currentValue={subOption.color.value}
                          currentNote={subOption.color.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "color", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "color", note)}
                        />
                        <ACField
                          label="Daikin Airco Type"
                          i={i}
                          j={j}
                          k="daikinType"
                          currentValue={subOption.daikinType.value}
                          currentNote={subOption.daikinType.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "daikinType", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "daikinType", note)}
                        />
                        <ACField
                          label="Type buitendeel"
                          i={i}
                          j={j}
                          k="outdoorType"
                          currentValue={subOption.outdoorType.value}
                          currentNote={subOption.outdoorType.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "outdoorType", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "outdoorType", note)}
                        />
                        <ACField
                          label="Plaats buitendeel"
                          i={i}
                          j={j}
                          k="outdoorPlace"
                          currentValue={subOption.outdoorPlace.value}
                          currentNote={subOption.outdoorPlace.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "outdoorPlace", value)}
                          multiSelect={true}
                          onNoteChange={(note) => updateACFieldNote(i, j, "outdoorPlace", note)}
                        />
                        <ACField
                          label="Leidingroute"
                          i={i}
                          j={j}
                          k="pipeRoute"
                          currentValue={subOption.pipeRoute.value}
                          currentNote={subOption.pipeRoute.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "pipeRoute", value)}
                          multiSelect={true}
                          onNoteChange={(note) => updateACFieldNote(i, j, "pipeRoute", note)}
                        />
                        <ACField
                          label="Type Airco"
                          i={i}
                          j={j}
                          k="acType"
                          currentValue={subOption.acType.value}
                          currentNote={subOption.acType.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "acType", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "acType", note)}
                        />
                        <ACField
                          label="Droge Diamantboring"
                          i={i}
                          j={j}
                          k="dryCoreDrilling"
                          currentValue={subOption.dryCoreDrilling.value}
                          currentNote={subOption.dryCoreDrilling.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "dryCoreDrilling", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "dryCoreDrilling", note)}
                        />
                        <ACField
                          label="Beton"
                          i={i}
                          j={j}
                          k="concrete"
                          currentValue={subOption.concrete.value}
                          currentNote={subOption.concrete.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "concrete", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "concrete", note)}
                        />
                        <ACField
                          label="Kleur goot"
                          i={i}
                          j={j}
                          k="gutterColor"
                          currentValue={subOption.gutterColor.value}
                          currentNote={subOption.gutterColor.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "gutterColor", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "gutterColor", note)}
                        />
                        <ACField
                          label="Toegang"
                          i={i}
                          j={j}
                          k="access"
                          currentValue={subOption.access.value}
                          currentNote={subOption.access.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "access", value)}
                          multiSelect={true}
                          onNoteChange={(note) => updateACFieldNote(i, j, "access", note)}
                        />
                        <ACField
                          label="Dakdoorvoer"
                          i={i}
                          j={j}
                          k="roofPassThrough"
                          currentValue={subOption.roofPassThrough.value}
                          currentNote={subOption.roofPassThrough.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "roofPassThrough", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "roofPassThrough", note)}
                        />
                        <ACField
                          label="Dakdekker"
                          i={i}
                          j={j}
                          k="roofer"
                          currentValue={subOption.roofer.value}
                          currentNote={subOption.roofer.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "roofer", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "roofer", note)}
                        />
                        <ACField
                          label="Muursteunen"
                          i={i}
                          j={j}
                          k="wallBrackets"
                          currentValue={subOption.wallBrackets.value}
                          currentNote={subOption.wallBrackets.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "wallBrackets", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "wallBrackets", note)}
                        />
                        <ACField
                          label="Voeding"
                          i={i}
                          j={j}
                          k="power"
                          currentValue={subOption.power.value}
                          currentNote={subOption.power.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "power", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "power", note)}
                        />
                        <ACField
                          label="Afvoer"
                          i={i}
                          j={j}
                          k="drain"
                          currentValue={subOption.drain.value}
                          currentNote={subOption.drain.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "drain", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "drain", note)}
                        />
                        <ACField
                          label="Hoekpompje"
                          i={i}
                          j={j}
                          k="cornerPump"
                          currentValue={subOption.cornerPump.value}
                          currentNote={subOption.cornerPump.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "cornerPump", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "cornerPump", note)}
                        />
                        <ACField
                          label="Lastig?"
                          i={i}
                          j={j}
                          k="hardToReach"
                          currentValue={subOption.hardToReach.value}
                          currentNote={subOption.hardToReach.note}
                          onValueChange={(value) => updateACFieldValue(i, j, "hardToReach", value)}
                          onNoteChange={(note) => updateACFieldNote(i, j, "hardToReach", note)}
                        />

                        <label className="label" style={{ fontSize: 16 }}>
                          Overige opmerkingen
                        </label>
                        <textarea
                          className="input"
                          style={{ height: 80 }}
                          value={subOption.remarks}
                          onChange={(e) => updateACRemarks(i, j, e.target.value)}
                          placeholder="Vrije tekst"
                        />
                      </>
                    )}
                  </div>
                )
              })}
              {Object.keys(acOptions[i]).length < 6 && (
                <button
                  type="button"
                  onClick={() => addACSubOption(i)}
                  style={{
                    marginTop: "8px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    border: "1px dashed #3b82f6",
                    borderRadius: "6px",
                    background: "transparent",
                    color: "#3b82f6",
                    cursor: "pointer",
                  }}
                >
                  + Sub-optie toevoegen
                </button>
              )}
            </section>
          ))}
        </>
      ) : (
        <>
          {(["1", "2"] as const).map((optionKey) => {
            const option = hpOptions[optionKey]

            return (
              <section key={optionKey} className="card">
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}
                >
                  <div className="sectionTitle" style={{ marginBottom: 0 }}>
                    Optie {optionKey}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => toggleHPEnabled(optionKey)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: 8,
                        border: option.enabled ? "2px solid #22c55e" : "2px solid #ddd",
                        background: option.enabled ? "#22c55e" : "#fff",
                        color: option.enabled ? "#fff" : "#333",
                        cursor: "pointer",
                        fontFamily: "Calibri, sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                    >
                      Ja
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleHPEnabled(optionKey)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: 8,
                        border: !option.enabled ? "2px solid #ef4444" : "2px solid #ddd",
                        background: !option.enabled ? "#ef4444" : "#fff",
                        color: !option.enabled ? "#fff" : "#333",
                        cursor: "pointer",
                        fontFamily: "Calibri, sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                    >
                      Nee
                    </button>
                  </div>
                </div>

                {option.enabled && (
                  <>
                    <HPField
                      label="Type WP / merk + model"
                      optionKey={optionKey}
                      k="hpTypeModel"
                      currentValue={option.hpTypeModel.value}
                      currentNote={option.hpTypeModel.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "hpTypeModel", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "hpTypeModel", note)}
                      isTextInput={true}
                    />
                    <HPField
                      label="Panasonic-opties"
                      optionKey={optionKey}
                      k="panasonicOptions"
                      currentValue={option.panasonicOptions.value}
                      currentNote={option.panasonicOptions.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "panasonicOptions", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "panasonicOptions", note)}
                    />
                    <HPField
                      label="Daikin-opties"
                      optionKey={optionKey}
                      k="daikinOptions"
                      currentValue={option.daikinOptions.value}
                      currentNote={option.daikinOptions.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "daikinOptions", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "daikinOptions", note)}
                    />
                    <HPField
                      label="Rookgasafvoer vervangen"
                      optionKey={optionKey}
                      k="smokePipeReplacement"
                      currentValue={option.smokePipeReplacement.value}
                      currentNote={option.smokePipeReplacement.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "smokePipeReplacement", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "smokePipeReplacement", note)}
                    />
                    <HPField
                      label="Tapwatertank"
                      optionKey={optionKey}
                      k="hotWaterTank"
                      currentValue={option.hotWaterTank.value}
                      currentNote={option.hotWaterTank.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "hotWaterTank", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "hotWaterTank", note)}
                    />
                    <HPField
                      label="Dakdoorvoer"
                      optionKey={optionKey}
                      k="roofPassThrough"
                      currentValue={option.roofPassThrough.value}
                      currentNote={option.roofPassThrough.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "roofPassThrough", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "roofPassThrough", note)}
                    />
                    <HPField
                      label="Toegankelijkheid dakdoorvoer"
                      optionKey={optionKey}
                      k="roofAccessibility"
                      currentValue={option.roofAccessibility.value}
                      currentNote={option.roofAccessibility.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "roofAccessibility", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "roofAccessibility", note)}
                    />
                    <HPField
                      label="Huidig gasverbruik"
                      optionKey={optionKey}
                      k="currentGasUsage"
                      currentValue={option.currentGasUsage.value}
                      currentNote={option.currentGasUsage.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "currentGasUsage", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "currentGasUsage", note)}
                      isTextInput={true}
                    />
                    <HPField
                      label="Woonoppervlakte (m²)"
                      optionKey={optionKey}
                      k="livingArea"
                      currentValue={option.livingArea.value}
                      currentNote={option.livingArea.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "livingArea", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "livingArea", note)}
                      isTextInput={true}
                    />
                    <HPField
                      label="Locatie binnendeel"
                      optionKey={optionKey}
                      k="indoorUnitLocation"
                      currentValue={option.indoorUnitLocation.value}
                      currentNote={option.indoorUnitLocation.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "indoorUnitLocation", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "indoorUnitLocation", note)}
                    />
                    <HPField
                      label="Plaats binnendeel"
                      optionKey={optionKey}
                      k="indoorUnitPlace"
                      currentValue={option.indoorUnitPlace.value}
                      currentNote={option.indoorUnitPlace.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "indoorUnitPlace", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "indoorUnitPlace", note)}
                      isTextInput={true}
                    />
                    <HPField
                      label="Leidingverloop koeltechnisch – kleur goot"
                      optionKey={optionKey}
                      k="coolingPipeColorGutter"
                      currentValue={option.coolingPipeColorGutter.value}
                      currentNote={option.coolingPipeColorGutter.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "coolingPipeColorGutter", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "coolingPipeColorGutter", note)}
                    />
                    <HPField
                      label="Meter koelleiding"
                      optionKey={optionKey}
                      k="meterCoolingPipe"
                      currentValue={option.meterCoolingPipe.value}
                      currentNote={option.meterCoolingPipe.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "meterCoolingPipe", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "meterCoolingPipe", note)}
                      isTextInput={true}
                    />
                    <HPField
                      label="Tracé"
                      optionKey={optionKey}
                      k="trace"
                      currentValue={option.trace.value}
                      currentNote={option.trace.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "trace", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "trace", note)}
                    />
                    <HPField
                      label="Door aantal ruimtes"
                      optionKey={optionKey}
                      k="throughRooms"
                      currentValue={option.throughRooms.value}
                      currentNote={option.throughRooms.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "throughRooms", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "throughRooms", note)}
                    />
                    <HPField
                      label="Huidige cv-leiding diameter (mm)"
                      optionKey={optionKey}
                      k="currentCvPipeDiameter"
                      currentValue={option.currentCvPipeDiameter.value}
                      currentNote={option.currentCvPipeDiameter.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "currentCvPipeDiameter", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "currentCvPipeDiameter", note)}
                    />
                    <HPField
                      label="Huidige waterleiding diameter (mm)"
                      optionKey={optionKey}
                      k="currentWaterPipeDiameter"
                      currentValue={option.currentWaterPipeDiameter.value}
                      currentNote={option.currentWaterPipeDiameter.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "currentWaterPipeDiameter", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "currentWaterPipeDiameter", note)}
                    />
                    <HPField
                      label="Bad aanwezig"
                      optionKey={optionKey}
                      k="bathPresent"
                      currentValue={option.bathPresent.value}
                      currentNote={option.bathPresent.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "bathPresent", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "bathPresent", note)}
                    />
                    <HPField
                      label="Stortdouche aanwezig"
                      optionKey={optionKey}
                      k="rainShowerPresent"
                      currentValue={option.rainShowerPresent.value}
                      currentNote={option.rainShowerPresent.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "rainShowerPresent", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "rainShowerPresent", note)}
                    />
                    <HPField
                      label="Aantal personen"
                      optionKey={optionKey}
                      k="numberOfPeople"
                      currentValue={option.numberOfPeople.value}
                      currentNote={option.numberOfPeople.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "numberOfPeople", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "numberOfPeople", note)}
                    />
                    <HPField
                      label="Tapwatertank (300 L / Geïntegreerd)"
                      optionKey={optionKey}
                      k="hotWaterTank300L"
                      currentValue={option.hotWaterTank300L.value}
                      currentNote={option.hotWaterTank300L.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "hotWaterTank300L", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "hotWaterTank300L", note)}
                    />
                    <HPField
                      label="300 L taptank makkelijk naar locatie?"
                      optionKey={optionKey}
                      k="hotWaterTank300LEasy"
                      currentValue={option.hotWaterTank300LEasy.value}
                      currentNote={option.hotWaterTank300LEasy.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "hotWaterTank300LEasy", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "hotWaterTank300LEasy", note)}
                    />
                    <HPField
                      label="Tapwatertank boiler"
                      optionKey={optionKey}
                      k="hotWaterTankCoil"
                      currentValue={option.hotWaterTankCoil.value}
                      currentNote={option.hotWaterTankCoil.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "hotWaterTankCoil", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "hotWaterTankCoil", note)}
                    />
                    <HPField
                      label="Bestaande afvoer diameter (mm)"
                      optionKey={optionKey}
                      k="existingDrainDiameter"
                      currentValue={option.existingDrainDiameter.value}
                      currentNote={option.existingDrainDiameter.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "existingDrainDiameter", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "existingDrainDiameter", note)}
                    />
                    <HPField
                      label="Vloerverwarming Begane grond"
                      optionKey={optionKey}
                      k="floorHeatingBG"
                      currentValue={option.floorHeatingBG.value}
                      currentNote={option.floorHeatingBG.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "floorHeatingBG", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "floorHeatingBG", note)}
                    />
                    <HPField
                      label="Vloerverwarming Eerste verdieping"
                      optionKey={optionKey}
                      k="floorHeating1st"
                      currentValue={option.floorHeating1st.value}
                      currentNote={option.floorHeating1st.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "floorHeating1st", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "floorHeating1st", note)}
                    />
                    <HPField
                      label="Radiatoren"
                      optionKey={optionKey}
                      k="radiators"
                      currentValue={option.radiators.value}
                      currentNote={option.radiators.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "radiators", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "radiators", note)}
                      multiSelect={true}
                    />
                    <HPField
                      label="Buffertank"
                      optionKey={optionKey}
                      k="bufferTank"
                      currentValue={option.bufferTank.value}
                      currentNote={option.bufferTank.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "bufferTank", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "bufferTank", note)}
                    />
                    <HPField
                      label="Externe circulatiepomp aanwezig"
                      optionKey={optionKey}
                      k="externalCirculationPump"
                      currentValue={option.externalCirculationPump.value}
                      currentNote={option.externalCirculationPump.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "externalCirculationPump", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "externalCirculationPump", note)}
                    />
                    <HPField
                      label="Plaats bediening makkelijk bereikbaar?"
                      optionKey={optionKey}
                      k="controlAccessible"
                      currentValue={option.controlAccessible.value}
                      currentNote={option.controlAccessible.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "controlAccessible", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "controlAccessible", note)}
                    />
                    <HPField
                      label="Hergebruik bekabeling thermostaat"
                      optionKey={optionKey}
                      k="reuseThermostatCabling"
                      currentValue={option.reuseThermostatCabling.value}
                      currentNote={option.reuseThermostatCabling.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "reuseThermostatCabling", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "reuseThermostatCabling", note)}
                    />
                    <HPField
                      label="Plaats buitendeel"
                      optionKey={optionKey}
                      k="outdoorUnitPlace"
                      currentValue={option.outdoorUnitPlace.value}
                      currentNote={option.outdoorUnitPlace.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "outdoorUnitPlace", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "outdoorUnitPlace", note)}
                    />
                    <HPField
                      label="Droge diamantboring"
                      optionKey={optionKey}
                      k="dryDiamondDrilling"
                      currentValue={option.dryDiamondDrilling.value}
                      currentNote={option.dryDiamondDrilling.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "dryDiamondDrilling", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "dryDiamondDrilling", note)}
                    />
                    <HPField
                      label="Dakdoorvoer / Muurdoorvoer"
                      optionKey={optionKey}
                      k="roofWallPassThrough"
                      currentValue={option.roofWallPassThrough.value}
                      currentNote={option.roofWallPassThrough.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "roofWallPassThrough", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "roofWallPassThrough", note)}
                    />
                    <HPField
                      label="Muursteunen"
                      optionKey={optionKey}
                      k="wallBrackets"
                      currentValue={option.wallBrackets.value}
                      currentNote={option.wallBrackets.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "wallBrackets", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "wallBrackets", note)}
                    />
                    <HPField
                      label="Verticaal transport"
                      optionKey={optionKey}
                      k="verticalTransport"
                      currentValue={option.verticalTransport.value}
                      currentNote={option.verticalTransport.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "verticalTransport", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "verticalTransport", note)}
                    />
                    <HPField
                      label="Voeding (spec.)"
                      optionKey={optionKey}
                      k="powerSupply"
                      currentValue={option.powerSupply.value}
                      currentNote={option.powerSupply.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "powerSupply", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "powerSupply", note)}
                      isTextInput={true}
                    />
                    <HPField
                      label="380V aanwezig (Bij all electric vaak nodig!)"
                      optionKey={optionKey}
                      k="voltage380Present"
                      currentValue={option.voltage380Present.value}
                      currentNote={option.voltage380Present.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "voltage380Present", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "voltage380Present", note)}
                    />
                    <HPField
                      label="Meetrapport energie noodzakelijk"
                      optionKey={optionKey}
                      k="energyReportRequired"
                      currentValue={option.energyReportRequired.value}
                      currentNote={option.energyReportRequired.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "energyReportRequired", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "energyReportRequired", note)}
                    />
                    <HPField
                      label="Lastig?"
                      optionKey={optionKey}
                      k="difficult"
                      currentValue={option.difficult.value}
                      currentNote={option.difficult.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "difficult", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "difficult", note)}
                    />
                    <HPField
                      label="Oudere woning"
                      optionKey={optionKey}
                      k="olderHome"
                      currentValue={option.olderHome.value}
                      currentNote={option.olderHome.note}
                      onValueChange={(value) => updateHPFieldValue(optionKey, "olderHome", value)}
                      onNoteChange={(note) => updateHPFieldNote(optionKey, "olderHome", note)}
                    />

                    <label className="label" style={{ fontSize: 16 }}>
                      Overige opmerkingen
                    </label>
                    <textarea
                      className="input"
                      style={{ height: 80 }}
                      value={option.remarks}
                      onChange={(e) => updateHPRemarks(optionKey, e.target.value)}
                      placeholder="Vrije tekst"
                    />
                  </>
                )}
              </section>
            )
          })}
        </>
      )}

      <button className="btn" onClick={save}>
        Verzenden / Offerte genereren
      </button>
    </main>
  )
}
