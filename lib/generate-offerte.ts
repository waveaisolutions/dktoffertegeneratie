import fs from "fs"
import path from "path"
import OpenAI from "openai"
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ImageModule = require("docxtemplater-image-module-free")

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface NoteField {
  value: string
  note: string
}

interface ACSubOption {
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

interface HPSubOption {
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

export interface OffertePayload {
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

export interface AiOfferteOutput {
  offertedatum: string
  offertenummer: string
  offertezin: string
  aanhef: string
  gutterColor: string
  locatievariatie1?: string
  specificatie: string
}

// Module-scope helpers used by both spec builders and prompt builders
function nv(f?: NoteField): string {
  if (!f) return ""
  const parts = [f.value, f.note].filter(Boolean)
  return parts.join(" – ")
}

function hasValue(f?: NoteField): boolean {
  return !!(f?.value)
}

function buildACSpecification(payload: OffertePayload): string {
  const o = payload.options
  const lines: string[] = []

  for (const g of ["1", "2", "3"]) {
    const group = o?.[g]
    if (!group) continue
    for (const s of Object.keys(group)) {
      const opt = group[s] as ACSubOption | undefined
      if (!opt || !opt.enabled) continue

      // Skip options where all values are empty
      const hasData = [opt.location, opt.indoorUnitPlace, opt.color, opt.daikinType,
        opt.outdoorType, opt.outdoorPlace, opt.pipeRoute].some(hasValue)
      if (!hasData) continue

      // Option header
      const headerParts = [opt.location?.value, opt.indoorUnitPlace?.value].filter(Boolean)
      lines.push(`Optie ${g}.${s} – ${headerParts.join(" ")}:`)
      lines.push("")

      // Leveren en monteren
      const leverenParts = [opt.daikinType?.value, opt.acType?.value, "binnendeel", opt.color?.value ? `kleur ${opt.color.value}` : ""].filter(Boolean)
      if (leverenParts.length > 0) lines.push(`- Leveren en monteren van ${leverenParts.join(" ")}`)

      // Plaats binnendeel
      if (hasValue(opt.indoorUnitPlace)) lines.push(`- Plaats binnendeel: ${nv(opt.indoorUnitPlace)}`)

      // Multi-split koppeling
      const acTypeVal = opt.acType?.value ?? ""
      if (acTypeVal.startsWith("MS") && parseInt(acTypeVal.replace("MS", "")) >= 2) {
        // List all suboptions in this group that are enabled
        const siblingKeys = Object.keys(group).filter(k => group[k]?.enabled)
        if (siblingKeys.length > 1 && hasValue(opt.outdoorType)) {
          const subNums = siblingKeys.map(k => `${g}.${k}`).join(", ")
          lines.push(`- De binnendelen ${subNums} worden aangesloten op buitendeel ${opt.outdoorType.value}`)
        }
      }

      // Buitendeel
      if (hasValue(opt.outdoorType) || hasValue(opt.outdoorPlace)) {
        const buitenParts = [opt.outdoorType?.value, opt.outdoorPlace?.value ? `geplaatst ${opt.outdoorPlace.value}` : ""].filter(Boolean)
        let buitenLine = `- Buitendeel: ${buitenParts.join(" ")}`
        if (opt.outdoorType?.note || opt.outdoorPlace?.note) {
          buitenLine += ` – ${[opt.outdoorType?.note, opt.outdoorPlace?.note].filter(Boolean).join(", ")}`
        }
        lines.push(buitenLine)
      }

      // Leidingroute
      if (hasValue(opt.pipeRoute)) lines.push(`- De leidingen worden ${nv(opt.pipeRoute)} gevoerd`)

      // Goot kleur pricing block - ALWAYS include
      lines.push(`- De leidingen in het gezichtsveld worden in witte kunststof Inoac/Inaba goot afgewerkt met bijbehorende hulpstukken. De leidinggoot voor buiten kunnen in de volgende kleuren aangebracht worden:`)
      lines.push(`      Wit     merk: Inoac`)
      lines.push(`      Crème   merk: Inoac meerprijs € 20,- incl btw.`)
      lines.push(`      Zwart   merk: Inaba/inoac meerprijs € 50,- incl btw.`)
      lines.push(`  Graag op de laatste pagina aangeven welke kleur u wenst.`)

      // Drain
      if (hasValue(opt.drain)) {
        if (opt.drain.value.toLowerCase().includes("vast")) {
          const note = opt.drain.note ? ` (${opt.drain.note})` : ""
          lines.push(`- Condenswaterafvoer: Het water wordt d.m.v. een vaste afvoer afgewaterd${note}`)
        } else if (opt.drain.value.toLowerCase().includes("pomp")) {
          const note = opt.drain.note ? ` (${opt.drain.note})` : ""
          lines.push(`- Condenswaterafvoer: Het water wordt d.m.v. een condenswaterhoekpomp afgepompt${note}`)
        }
      }

      // Diamantboring
      if (opt.dryCoreDrilling?.value === "Ja") {
        const note = opt.dryCoreDrilling.note ? ` ${opt.dryCoreDrilling.note}` : ""
        lines.push(`- Inclusief de benodigde droge Diamantboring(en) door de steense muren.${note}`)
      }
      if (hasValue(opt.concrete) && opt.concrete.value === "Ja") {
        lines.push(`- Beton aanwezig: betonboring vereist`)
      }

      // Dakdoorvoer
      if (opt.roofPassThrough?.value === "Ja") {
        const roofer = hasValue(opt.roofer) ? ` – dakdekker: ${opt.roofer.value}` : ""
        const note = opt.roofPassThrough.note ? ` ${opt.roofPassThrough.note}` : ""
        lines.push(`- Inclusief dakdoorvoer${roofer}${note}`)
      }

      // Voeding
      if (hasValue(opt.power)) lines.push(`- De voeding: ${nv(opt.power)}`)

      // Muursteunen
      if (opt.wallBrackets?.value === "Ja") lines.push(`- Buitendeel: inclusief muursteunen voor bevestiging`)

      // Toegang / klimmateriaal
      if (opt.access?.value && !opt.access.value.toLowerCase().includes("geen")) {
        lines.push(`- Incl gebruik evt klim/hijsmateriaal`)
      }

      // Standaard verbatim lijn
      lines.push(`- Installatie wordt geleverd inclusief alle benodigde koelleidingen en communicatiebekabeling.`)

      // Remarks
      if (opt.remarks?.trim()) lines.push(`  ${opt.remarks.trim()}`)

      lines.push("")
    }
  }

  // Verbatim closing lines
  lines.push("De installatie wordt compleet geleverd en gemonteerd conform STEK / F-gassen verordening.")
  lines.push("De airconditioning is voorzien van het nieuwe milieuvriendelijke R32 koudemiddel.")

  return lines.join("\n")
}

function buildWPSpecification(payload: OffertePayload): string {
  const o = payload.options
  const lines: string[] = []

  for (const idx of ["1", "2"]) {
    const opt = o?.[idx] as HPSubOption | undefined
    if (!opt || !opt.enabled) continue

    const hasData = hasValue(opt.hpTypeModel) || hasValue(opt.panasonicOptions) || hasValue(opt.daikinOptions)
    if (!hasData) continue

    const modelVal = opt.hpTypeModel?.value || opt.panasonicOptions?.value || opt.daikinOptions?.value || `Optie ${idx}`
    lines.push(`Optie ${idx} – ${modelVal}:`)
    lines.push("")

    // Leveren en monteren
    const brandOpts = [opt.panasonicOptions?.value, opt.daikinOptions?.value].filter(Boolean).join(", ")
    if (hasValue(opt.hpTypeModel)) lines.push(`- Leveren en monteren van ${nv(opt.hpTypeModel)} warmtepomp${brandOpts ? ` (${brandOpts})` : ""}`)
    else if (brandOpts) lines.push(`- Leveren en monteren van warmtepomp: ${brandOpts}`)

    // Locatie binnendeel
    if (hasValue(opt.indoorUnitLocation) || hasValue(opt.indoorUnitPlace)) {
      const loc = [opt.indoorUnitLocation?.value, opt.indoorUnitPlace?.value].filter(Boolean).join(" – ")
      const note = [opt.indoorUnitLocation?.note, opt.indoorUnitPlace?.note].filter(Boolean).join(", ")
      lines.push(`- Locatie binnendeel: ${loc}${note ? ` – ${note}` : ""}`)
    }

    // Plaats buitendeel
    if (hasValue(opt.outdoorUnitPlace)) lines.push(`- Plaats buitendeel: ${nv(opt.outdoorUnitPlace)}`)

    // Rookgasafvoer
    if (opt.smokePipeReplacement?.value === "Ja") lines.push(`- Rookgasafvoer vervangen${opt.smokePipeReplacement.note ? `: ${opt.smokePipeReplacement.note}` : ""}`)

    // Leidingverloop
    const traceVal = hasValue(opt.trace) ? opt.trace.value : ""
    const meters = hasValue(opt.meterCoolingPipe) ? `${opt.meterCoolingPipe.value} meter` : ""
    const gootKleur = hasValue(opt.coolingPipeColorGutter) ? `${opt.coolingPipeColorGutter.value} goot` : ""
    const traceParts = [traceVal, opt.trace?.note, meters, gootKleur].filter(Boolean)
    if (traceParts.length) lines.push(`- Leidingverloop koeltechnisch: ${traceParts.join(", ")}`)

    // Dakdoorvoer
    if (opt.roofPassThrough?.value && !opt.roofPassThrough.value.toLowerCase().includes("niet van toepassing")) {
      lines.push(`- Dakdoorvoer: ${nv(opt.roofPassThrough)}`)
    }

    // Diamantboringen
    if (opt.dryDiamondDrilling?.value === "Ja") {
      const count = hasValue(opt.dryDiamondDrillingCount) ? `${opt.dryDiamondDrillingCount.value}x ` : ""
      lines.push(`- Inclusief ${count}droge diamantboring(en)`)
    }

    // Afgifte
    const afgifteParts: string[] = []
    if (opt.floorHeatingBG?.value === "Ja") afgifteParts.push("vloerverwarming begane grond")
    if (opt.floorHeating1st?.value === "Ja") afgifteParts.push("vloerverwarming 1e verdieping")
    if (hasValue(opt.radiators)) afgifteParts.push(`radiatoren: ${nv(opt.radiators)}`)
    if (afgifteParts.length) lines.push(`- Afgifte: ${afgifteParts.join(", ")}`)

    // Tapwatertank
    if (opt.hotWaterTank?.value === "Ja" || hasValue(opt.hotWaterTank300L)) {
      const tankParts = [opt.hotWaterTank300L?.value, opt.hotWaterTankCoil?.value, opt.hotWaterTank300L?.note].filter(Boolean)
      lines.push(`- Tapwatertank: ${tankParts.join(", ") || "aanwezig"}`)
    }

    // Voeding
    if (hasValue(opt.powerSupply)) lines.push(`- De voeding: ${nv(opt.powerSupply)}`)

    // Muursteunen
    if (opt.wallBrackets?.value === "Ja") lines.push(`- Inclusief muursteunen voor bevestiging buitendeel`)

    // Verticaal transport
    if (opt.verticalTransport?.value && !opt.verticalTransport.value.toLowerCase().includes("niet van toepassing")) {
      lines.push(`- Incl gebruik klim/hijsmateriaal: ${nv(opt.verticalTransport)}`)
    }

    // Buffertank
    if (hasValue(opt.bufferTank)) lines.push(`- Buffertank: ${nv(opt.bufferTank)}`)

    // Remarks
    if (opt.remarks?.trim()) lines.push(`  ${opt.remarks.trim()}`)

    lines.push("")
  }

  return lines.join("\n")
}

function buildACMetaPrompt(payload: OffertePayload): string {
  const o = payload.options
  const locations: string[] = []
  let firstAcType = ""

  for (const g of ["1", "2", "3"]) {
    const group = o?.[g]
    if (!group) continue
    for (const s of Object.keys(group)) {
      const opt = group[s] as ACSubOption | undefined
      if (!opt || !opt.enabled) continue
      if (opt.location?.value) locations.push(opt.location.value)
      if (!firstAcType && opt.acType?.value) firstAcType = opt.acType.value
    }
  }

  const gutterColor = o?.["1"]?.["1"]?.gutterColor?.value ?? ""
  const locatievariatie1 = o?.["1"]?.["1"]?.location?.value ?? ""

  return `Je bent een tekstschrijver voor technische offertes.
Genereer op basis van de input een JSON-object met ALLEEN:
- offertezin: een beknopte sectieheading (5-8 woorden) die de AC-configuratie beschrijft.
  Noem specifieke ruimtes. Bijv: "Multisplit opstelling woonkamer en zolder" of "Split airco kantoorruimte 3e verdieping".
  Geen "airco installatie" als prefix. Beschrijf WAT en WAAR.
- aanhef: de aanhef exact zoals opgegeven

Input: locaties = [${locations.join(", ")}], acType = [${firstAcType}]

Klant aanhef: "${payload.customer.salutation}"

OUTPUT:
{
  "offertedatum": "${payload.customer.quotationDate}",
  "offertenummer": "${payload.customer.quotationNumber}",
  "offertezin": "",
  "aanhef": "${payload.customer.salutation}",
  "locatievariatie1": "${locatievariatie1}",
  "gutterColor": "${gutterColor}"
}`
}

function buildWPMetaPrompt(payload: OffertePayload): string {
  const o = payload.options
  const models: string[] = []

  for (const idx of ["1", "2"]) {
    const opt = o?.[idx] as HPSubOption | undefined
    if (!opt || !opt.enabled) continue
    const modelVal = opt.hpTypeModel?.value || opt.panasonicOptions?.value || opt.daikinOptions?.value
    if (modelVal) models.push(modelVal)
  }

  const gutterColor = o?.["1"]?.coolingPipeColorGutter?.value ?? ""

  return `Je bent een tekstschrijver voor technische offertes.
Genereer op basis van de input een JSON-object met ALLEEN:
- offertezin: een beknopte sectieheading (5-8 woorden) die de warmtepomp-configuratie beschrijft.
  Noem specifieke modellen of kenmerken. Bijv: "Lucht-water warmtepomp Panasonic all-electric".
  Geen "warmtepomp installatie" als prefix. Beschrijf WAT.
- aanhef: de aanhef exact zoals opgegeven

Input: modellen = [${models.join(", ")}]

Klant aanhef: "${payload.customer.salutation}"

OUTPUT:
{
  "offertedatum": "${payload.customer.quotationDate}",
  "offertenummer": "${payload.customer.quotationNumber}",
  "offertezin": "",
  "aanhef": "${payload.customer.salutation}",
  "gutterColor": "${gutterColor}"
}`
}

export async function generateOfferteText(payload: OffertePayload): Promise<AiOfferteOutput> {
  const isAC = payload.systemType === "Airconditioning"
  const prompt = isAC ? buildACMetaPrompt(payload) : buildWPMetaPrompt(payload)

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  })

  const raw = response.choices[0]?.message?.content ?? "{}"
  const parsed = JSON.parse(raw)

  return {
    offertedatum: parsed.offertedatum ?? payload.customer.quotationDate,
    offertenummer: parsed.offertenummer ?? payload.customer.quotationNumber,
    offertezin: parsed.offertezin ?? "",
    aanhef: parsed.aanhef ?? payload.customer.salutation,
    gutterColor: parsed.gutterColor ?? "",
    locatievariatie1: parsed.locatievariatie1,
    specificatie: isAC ? buildACSpecification(payload) : buildWPSpecification(payload),
  }
}


function resolveACImageName(opt: ACSubOption): string {
  const daikinType = (opt.daikinType?.value ?? "").toUpperCase()
  const acType     = (opt.acType?.value ?? "").toUpperCase()
  const color      = (opt.color?.value ?? "").toLowerCase()
  const outdoorType = (opt.outdoorType?.value ?? "").toLowerCase()

  // Multi-split outdoor unit
  if (/^MS\d/.test(acType)) return "buitendeel-ms.png"
  // Evolar outdoor casing
  if (outdoorType.includes("evolar")) return "evolar-ombouw-zwart.png"
  // Cassette
  if (daikinType.startsWith("FCAG") || daikinType.startsWith("BYCQ")) return "cassette-bycq.png"
  // Vloermodel
  if (daikinType.startsWith("FVXM")) return "vloermodel-fvxm.png"
  // Design FTXA – kleurvariant
  if (daikinType.startsWith("FTXA")) {
    if (color.includes("zwart") || color.includes("black")) return "wandmodel-ftxa-zwart.png"
    if (color.includes("zilver") || color.includes("silver") || color.includes("grijs")) return "wandmodel-ftxa-zilver.png"
    return "wandmodel-ftxa-wit.png"
  }
  if (daikinType.startsWith("FTXP")) return "wandmodel-ftxp.png"
  if (daikinType.startsWith("FTXM") || daikinType.startsWith("FTXF") || daikinType.startsWith("FTXJ")) return "wandmodel-ftxm.png"
  // Fallback: generiek split buitendeel
  return "buitendeel-split.png"
}

function buildACImages(payload: OffertePayload): { offerteImageLabel: string; offerteImage: string }[] {
  if (payload.systemType !== "Airconditioning") return []
  const o = payload.options
  const result: { offerteImageLabel: string; offerteImage: string }[] = []

  for (const g of ["1", "2", "3"]) {
    const group = o?.[g]
    if (!group) continue
    for (const s of Object.keys(group)) {
      const opt = group[s] as ACSubOption | undefined
      if (!opt?.enabled) continue

      const imageName = resolveACImageName(opt)
      const imgPath = path.join(process.cwd(), "templates", "images", imageName)
      if (!fs.existsSync(imgPath)) continue

      const location = opt.location?.value ?? ""
      const label = `Optie ${g}.${s}${location ? ` – ${location}` : ""}`
      result.push({ offerteImageLabel: label, offerteImage: imgPath })
    }
  }
  return result
}

export async function generateOfferteDoc(
  payload: OffertePayload,
  ai: AiOfferteOutput
): Promise<Buffer> {
  const isAC = payload.systemType === "Airconditioning"
  const templateName = isAC ? "SJABLOON-DKT-AIRCO.docx" : "SJABLOON-DKT-WARMTEPOMP.docx"
  const templatePath = path.join(process.cwd(), "templates", templateName)
  const templateContent = fs.readFileSync(templatePath)

  const zip = new PizZip(templateContent)

  const klantadres = payload.customer.address ?? ""
  const klantpostcodeplaats = `${payload.customer.postcode ?? ""}  ${payload.customer.city ?? ""}`.trim()

  const acImages = isAC ? buildACImages(payload) : []
  const modules: object[] = []

  if (isAC) {
    modules.push(
      new ImageModule({
        centered: false,
        getImage: (tagValue: string) => fs.readFileSync(tagValue),
        getSize: () => [200, 150] as [number, number],
      })
    )
  }

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules,
  })

  const data = isAC
    ? {
        offertedatum: ai.offertedatum,
        offertenumer: ai.offertenummer, // typo in AIRCO template
        offertezin: ai.offertezin,
        aanhef: ai.aanhef,
        gutterColor: ai.gutterColor,
        locatievariatie1: ai.locatievariatie1 ?? "",
        klantadres,
        klantpostcodeplaats,
        "Specificatieinstallatie&uitgangspunten": ai.specificatie,
        acImages,
      }
    : {
        offertedatum: ai.offertedatum,
        offertenummer: ai.offertenummer,
        offertezin: ai.offertezin,
        aanhef: ai.aanhef,
        kleurbuitengoot: ai.gutterColor,
        klantadres,
        klantpostcodeplaats,
        "Specificatieinstallatie&uitgangspuntenV2": ai.specificatie,
      }

  doc.render(data)

  return doc.getZip().generate({ type: "nodebuffer" }) as Buffer
}
