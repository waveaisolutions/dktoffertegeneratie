import fs from "fs"
import path from "path"
import OpenAI from "openai"
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"

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

function buildACPrompt(payload: OffertePayload): string {
  const o = payload.options
  const nv = (f?: NoteField) => `${f?.value ?? ""}\n${f?.note ?? ""}`

  let optiesTekst = ""
  for (const g of ["1", "2", "3"]) {
    const group = o?.[g]
    if (!group) continue
    for (const s of Object.keys(group)) {
    const opt = group[s] as ACSubOption | undefined
    if (!opt) continue
    optiesTekst += `
optie ${g}.${s} ${opt.enabled}
Locatie Airco
${nv(opt.location)}
Plaats binnendeel
${nv(opt.indoorUnitPlace)}
Kleur
${nv(opt.color)}
Daikin Airco Type
${nv(opt.daikinType)}
Type buitendeel
${nv(opt.outdoorType)}
Plaats buitendeel
${nv(opt.outdoorPlace)}
Leidingroute
${nv(opt.pipeRoute)}
Type Airco
${nv(opt.acType)}
Droge Diamantboring
${nv(opt.dryCoreDrilling)}
Beton
${nv(opt.concrete)}
Toegang
${nv(opt.access)}
Dakdoorvoer
${nv(opt.roofPassThrough)}
Dakdekker
${nv(opt.roofer)}
Muursteunen
${nv(opt.wallBrackets)}
Voeding
${nv(opt.power)}
Afvoer
${nv(opt.drain)}
Hoekpompje
${nv(opt.cornerPump)}
`
    }
  }

  const gutterColor = o?.["1"]?.["1"]?.gutterColor?.value ?? ""
  const locatievariatie1 = o?.["1"]?.["1"]?.location?.value ?? ""

  return `Je bent een zakelijke AI-tekstschrijver gespecialiseerd in offertes voor installatietechniek. Hou er dus rekening mee dat dit offertes zijn en er nog geen werkzaamheden zijn uitgevoerd.
Je ontvangt gestructureerde input uit een formulier en genereert exact de onderstaande variabelen.
Je output moet bestaan uit één ruw JSON-object.
Gebruik geen string, geen array, geen tekst eromheen.
Gebruik geen backslashes, geen quotes om het hele object, geen markdown.

Je genereert op basis van de input:
offertezin → korte zakelijke samenvatting in één zin
Specificatieinstallatie&uitgangspunten → technische beschrijving met opsomming

Richtlijnen outputvelden
offertezin
3-5 woorden
beschrijft type installatie + ruimte

Specificatieinstallatie&uitgangspunten
Begin elke optie op een NIEUWE REGEL met de header: "Optie X.X – [locatie]:" gevolgd door een lege regel.
Schrijf daarna een volledige technische beschrijving van die optie (~100 woorden per optie).
Sluit elke optie af met een LEGE REGEL zodat opties visueel van elkaar gescheiden zijn.
Verwerk alle relevante informatie inhoudelijk, maar noem nooit de variabelen letterlijk.
JE MAG ALLEEN BENOEMEN WAT ER WEL GEDAAN GAAT WORDEN, BENOEM DUS NIET DE DINGEN DIE NIET GEDAAN GAAN WORDEN!
Noem gutterColor nooit in dit tekstveld.
De tekst moet klinken als een normale technische werkomschrijving.
Blijf feitelijk en concreet. Maak het geheel ongeveer 300 woorden in totaal.
Gebruik de broncodes zoals 1.1 of 2.3 in de header van elke optie.
NOEM HET OPTIE EN NIET INSTALLATIE AANGEZIEN ER NOG GEEN WERKZAAMHEDEN VERRICHT ZIJN.
Alleen ingeschakelde opties worden beschreven dus enabled = true; opties met enabled = false worden genegeerd.

${optiesTekst}

Een optie mag alleen worden opgenomen wanneer minstens één van de value-velden niet leeg is.
Opties waarvan álle value-velden leeg zijn moeten volledig genegeerd worden.
Je mag GEEN opties genereren of invullen die niet daadwerkelijk waarden bevatten in de input.
Je mag nooit opties invullen of bedenken voor varianten waar alle value-velden leeg zijn.
Noem de gootkleur NIET in dit veld (gutterColor is apart veld).

VERPLICHT OUTPUTFORMAT
Geef uitsluitend het volgende JSON-object, correct gevuld:
{
  "offertedatum": "${payload.customer.quotationDate}",
  "offertenummer": "${payload.customer.quotationNumber}",
  "offertezin": "",
  "aanhef": "${payload.customer.salutation}",
  "locatievariatie1": "${locatievariatie1}",
  "Specificatieinstallatie&uitgangspunten": "",
  "gutterColor": "${gutterColor}"
}

Belangrijk:
Geen wrapper-array
Geen extra velden
Geen uitleg
Geen markdown
Geen escaping
Geen backticks
Alleen het JSON-object`
}

function buildWPPrompt(payload: OffertePayload): string {
  const o = payload.options

  const nv = (f?: NoteField) => `${f?.value ?? ""}\n${f?.note ?? ""}`

  const buildOptie = (idx: string) => {
    const opt = o?.[idx] as HPSubOption | undefined
    if (!opt) return ""
    return `
optie ${idx} ${opt.enabled}
Type WP / merk + model
${nv(opt.hpTypeModel)}
Panasonic-opties
${nv(opt.panasonicOptions)}
Daikin-opties
${nv(opt.daikinOptions)}
Rookgasafvoer vervangen
${nv(opt.smokePipeReplacement)}
Tapwatertank
${nv(opt.hotWaterTank)}
Dakdoorvoer
${nv(opt.roofAccessibility)}
Toegankelijkheid dakdoorvoer
${nv(opt.roofAccessibility)}
Huidig gasverbruik
${nv(opt.currentGasUsage)}
Woonoppervlakte (m²)
${nv(opt.livingArea)}
Locatie binnendeel
${nv(opt.indoorUnitLocation)}
Plaats binnendeel
${nv(opt.indoorUnitPlace)}
Leidingverloop koeltechnisch – kleur goot
${nv(opt.coolingPipeColorGutter)}
Meter koelleiding
${nv(opt.meterCoolingPipe)}
Tracé
${nv(opt.trace)}
Door aantal ruimtes
${nv(opt.throughRooms)}
Huidige cv-leiding diameter (mm)
${nv(opt.currentCvPipeDiameter)}
Huidige waterleiding diameter (mm)
${nv(opt.currentWaterPipeDiameter)}
Bad aanwezig
${nv(opt.bathPresent)}
Stortdouche aanwezig
${nv(opt.rainShowerPresent)}
Aantal personen
${nv(opt.numberOfPeople)}
Tapwatertank (300 L / Geïntegreerd)
${nv(opt.hotWaterTank300L)}
300 L taptank makkelijk naar locatie?
${nv(opt.hotWaterTank300LEasy)}
Tapwatertank boiler (spiraal)
${nv(opt.hotWaterTankCoil)}
Bestaande afvoer diameter (mm)
${nv(opt.existingDrainDiameter)}
Vloerverwarming Begane grond
${nv(opt.floorHeatingBG)}
Vloerverwarming Eerste verdieping
${nv(opt.floorHeating1st)}
Radiatoren
${nv(opt.radiators)}
Buffertank
${nv(opt.bufferTank)}
Externe circulatiepomp aanwezig
${nv(opt.externalCirculationPump)}
Plaats bediening makkelijk bereikbaar?
${nv(opt.controlAccessible)}
Hergebruik bekabeling thermostaat
${nv(opt.reuseThermostatCabling)}
Plaats buitendeel
${nv(opt.outdoorUnitPlace)}
Droge diamantboring
${nv(opt.dryDiamondDrilling)}
Aantal diamantboringen
${nv(opt.dryDiamondDrillingCount)}
Dakdoorvoer / Muurdoorvoer
${nv(opt.roofWallPassThrough)}
Muursteunen
${nv(opt.wallBrackets)}
Verticaal transport
${nv(opt.verticalTransport)}
Voeding (spec.)
${nv(opt.powerSupply)}
380V aanwezig (Bij all electric vaak nodig!)
${nv(opt.voltage380Present)}
Meetrapport energie noodzakelijk
${nv(opt.energyReportRequired)}
`
  }

  const gutterColor = o?.["1"]?.coolingPipeColorGutter?.value ?? ""

  return `Je bent een zakelijke AI-tekstschrijver gespecialiseerd in offertes voor installatietechniek. Hou er dus rekening mee dat dit offertes zijn en er nog geen werkzaamheden zijn uitgevoerd.
Je ontvangt gestructureerde input uit een formulier en genereert exact de onderstaande variabelen.
Je output moet bestaan uit één ruw JSON-object.
Gebruik geen string, geen array, geen tekst eromheen.
Gebruik geen backslashes, geen quotes om het hele object, geen markdown.

Je genereert op basis van de input:
offertezin → korte zakelijke samenvatting in één zin
Specificatieinstallatie&uitgangspuntenV2 → technische beschrijving met opsomming

Richtlijnen outputvelden
offertezin
3-5 woorden
beschrijft type installatie + ruimte

JE MAG ALLEEN BENOEMEN WAT ER WEL GEDAAN GAAT WORDEN, BENOEM DUS NIET DE DINGEN DIE NIET GEDAAN GAAN WORDEN!

Specificatieinstallatie&uitgangspuntenV2
Begin elke optie op een NIEUWE REGEL met de header: "Optie X – [type warmtepomp]:" gevolgd door een lege regel.
Schrijf daarna een volledige technische beschrijving van die optie (~150 woorden per optie).
Sluit elke optie af met een LEGE REGEL zodat opties visueel van elkaar gescheiden zijn.
Verwerk alle relevante informatie inhoudelijk, maar noem nooit de variabelen letterlijk.
JE MAG ALLEEN BENOEMEN WAT ER WEL GEDAAN GAAT WORDEN, BENOEM DUS NIET DE DINGEN DIE NIET GEDAAN GAAN WORDEN!
Noem gutterColor nooit in dit tekstveld.
De tekst moet klinken als een normale technische werkomschrijving.
Blijf feitelijk en concreet. Maak het geheel ongeveer 300 woorden in totaal.
Gebruik de broncodes zoals 1 en 2 in de header van elke optie.
NOEM HET OPTIE EN NIET INSTALLATIE AANGEZIEN ER NOG GEEN WERKZAAMHEDEN VERRICHT ZIJN.
Alleen ingeschakelde opties worden beschreven dus enabled = true; opties met enabled = false worden genegeerd.

${buildOptie("1")}
${buildOptie("2")}

Een optie mag alleen worden opgenomen wanneer minstens één van de value-velden niet leeg is.
Opties waarvan álle value-velden leeg zijn moeten volledig genegeerd worden.
Je mag GEEN opties genereren of invullen die niet daadwerkelijk waarden bevatten in de input.
Je mag nooit opties invullen of bedenken voor varianten waar alle value-velden leeg zijn.
Noem de gootkleur NIET in dit veld (gutterColor is apart veld).

VERPLICHT OUTPUTFORMAT
Geef uitsluitend het volgende JSON-object, correct gevuld:
{
  "offertedatum": "${payload.customer.quotationDate}",
  "offertenummer": "${payload.customer.quotationNumber}",
  "offertezin": "",
  "aanhef": "${payload.customer.salutation}",
  "Specificatieinstallatie&uitgangspuntenV2": "",
  "gutterColor": "${gutterColor}"
}

Belangrijk:
Geen wrapper-array
Geen extra velden
Geen uitleg
Geen markdown
Geen escaping
Geen backticks
Alleen het JSON-object`
}

export async function generateOfferteText(payload: OffertePayload): Promise<AiOfferteOutput> {
  const isAC = payload.systemType === "Airconditioning"
  const prompt = isAC ? buildACPrompt(payload) : buildWPPrompt(payload)

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
    specificatie: isAC
      ? (parsed["Specificatieinstallatie&uitgangspunten"] ?? "")
      : (parsed["Specificatieinstallatie&uitgangspuntenV2"] ?? ""),
  }
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
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  const data = isAC
    ? {
        offertedatum: ai.offertedatum,
        offertenumer: ai.offertenummer, // typo in AIRCO template
        offertezin: ai.offertezin,
        aanhef: ai.aanhef,
        gutterColor: ai.gutterColor,
        locatievariatie1: ai.locatievariatie1 ?? "",
        "Specificatieinstallatie&uitgangspunten": ai.specificatie,
      }
    : {
        offertedatum: ai.offertedatum,
        offertenummer: ai.offertenummer,
        offertezin: ai.offertezin,
        aanhef: ai.aanhef,
        kleurbuitengoot: ai.gutterColor,
        "Specificatieinstallatie&uitgangspuntenV2": ai.specificatie,
      }

  doc.render(data)

  return doc.getZip().generate({ type: "nodebuffer" }) as Buffer
}
