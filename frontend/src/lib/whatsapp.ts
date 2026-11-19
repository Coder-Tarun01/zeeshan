import { business, isWhatsAppConfigured, whatsappNumber } from '../data/site'
import type { PriceUnit } from '../data/menu'
import { formatINR } from './price'

/**
 * Builds a wa.me link with a pre-filled message.
 * Falls back to WhatsApp's share composer (no recipient) when the business
 * number has not been added to `src/data/site.ts` yet — the ordering flow
 * always works, it simply lets the customer pick the chat.
 */
export function buildWhatsAppUrl(message: string): string {
  const text = encodeURIComponent(message)
  return isWhatsAppConfigured
    ? `https://wa.me/${whatsappNumber}?text=${text}`
    : `https://wa.me/?text=${text}`
}

export interface OrderMessageInput {
  item: string
  quantity: number
  note?: string
  /** Selected weight, e.g. "250g" (by-weight items only). */
  portion?: string
  /** 'piece' → quantity is a piece count; 'weight' → quantity is portions. */
  unit?: PriceUnit
  /** Price of one portion / one piece. */
  unitPrice?: number | null
  /** Optional category / menu context, e.g. "Chicken Specials". */
  category?: string
}

/** " — 250g" / " — full" for a by-size line, nothing for a piece count. */
function sizeSuffix(unit: PriceUnit | undefined, portion: string | undefined): string {
  if (!portion) return ''
  if (unit === 'weight' || unit === 'plate') return ` — ${portion}`
  return ''
}

/** The exact message a customer sends when tapping "Order Now". */
export function buildOrderMessage({
  item,
  quantity,
  note,
  portion,
  unit,
  unitPrice,
  category,
}: OrderMessageInput): string {
  const lines: string[] = [
    `Hello ${business.name}!`,
    '',
    `I would like to order from your ${category ?? 'menu'}:`,
    `• ${quantity} x ${item}${sizeSuffix(unit, portion)}`,
  ]

  if (typeof unitPrice === 'number') {
    const per =
      unit === 'piece' ? 'piece' : unit === 'weight' || unit === 'plate' ? portion : undefined
    lines[lines.length - 1] += per
      ? ` (${formatINR(unitPrice)} per ${per})`
      : ` (${formatINR(unitPrice)} each)`
    lines.push(`Estimated total: ${formatINR(unitPrice * quantity)}`)
  }

  const cleanNote = note?.trim()
  if (cleanNote) lines.push(`Note: ${cleanNote}`)

  lines.push(
    '',
    `Delivery is charged at ₹${business.delivery.ratePerKm} per km. Please confirm availability, the distance and the total. Thank you!`,
  )

  return lines.join('\n')
}

export interface BagMessageItem {
  name: string
  quantity: number
  /** 'piece' → quantity is a piece count; 'weight' → quantity is portions. */
  unit?: PriceUnit
  /** Selected weight, e.g. "250g" (by-weight items only). */
  portion?: string
  /** Price of one portion / one piece. */
  unitPrice?: number | null
  note?: string
}

/** "• 2 x Chicken Pakodi — 250g @ ₹150 = ₹300" / "• 6 x Chicken Joint @ ₹60/piece = ₹360" */
function formatBagLine(item: BagMessageItem): string {
  const note = item.note?.trim()
  const price = item.unitPrice
  const priced = typeof price === 'number'

  let pricePart = ''
  if (priced) {
    const per = item.unit === 'piece' ? 'piece' : item.portion
    const rate = per ? `${formatINR(price)}/${per}` : formatINR(price)
    pricePart = ` @ ${rate} = ${formatINR(price * item.quantity)}`
  }

  return `• ${item.quantity} x ${item.name}${sizeSuffix(item.unit, item.portion)}${pricePart}${
    note ? ` (${note})` : ''
  }`
}

/** "Estimated total: ₹660" — only when every line has a published price. */
function totalLine(items: BagMessageItem[]): string | null {
  if (items.length === 0) return null
  if (items.some((item) => typeof item.unitPrice !== 'number')) return null

  const total = items.reduce(
    (sum, item) => sum + (item.unitPrice as number) * item.quantity,
    0,
  )
  return `Estimated total: ${formatINR(total)}`
}

/** Consolidated message for the whole order bag. */
export function buildBagMessage(items: BagMessageItem[]): string {
  const lines: string[] = [`Hello ${business.name}!`, '', 'I would like to order:']

  items.forEach((item) => lines.push(formatBagLine(item)))

  const total = totalLine(items)
  if (total) lines.push('', total)

  lines.push(
    '',
    `Delivery is charged at ₹${business.delivery.ratePerKm} per km. Please confirm availability, the distance and the final total. Thank you!`,
  )

  return lines.join('\n')
}

export function bagWhatsAppUrl(items: BagMessageItem[]): string {
  return buildWhatsAppUrl(buildBagMessage(items))
}

export interface CustomerDetails {
  name: string
  email?: string
  houseNumber?: string
  city: string
  state: string
  pincode: string
  landmark?: string
  mobile: string
}

/** "12-A, Near the temple, Kochi, Kerala - 682001" (empty parts are skipped). */
export function formatAddress(customer: CustomerDetails): string {
  const street = [customer.houseNumber, customer.landmark]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')
  const area = `${customer.city.trim()}, ${customer.state.trim()} - ${customer.pincode.trim()}`

  return street ? `${street}, ${area}` : area
}

/** Checkout message: the whole bag plus the delivery details the customer entered. */
export function buildCheckoutMessage(items: BagMessageItem[], customer: CustomerDetails): string {
  const lines: string[] = [`Hello ${business.name}!`, '', 'I would like to place an order:']

  items.forEach((item) => lines.push(formatBagLine(item)))

  const total = totalLine(items)
  if (total) lines.push('', total)

  lines.push('', 'Delivery details', `Name: ${customer.name.trim()}`)

  const mobile = customer.mobile.trim()
  if (mobile) lines.push(`Mobile: ${mobile}`)

  lines.push(`Address: ${formatAddress(customer)}`)

  if (customer.email?.trim()) lines.push(`Email: ${customer.email.trim()}`)

  lines.push(
    '',
    `Delivery is charged at ₹${business.delivery.ratePerKm} per km. Please confirm availability, the distance and the final total. Thank you!`,
  )

  return lines.join('\n')
}

export function checkoutWhatsAppUrl(items: BagMessageItem[], customer: CustomerDetails): string {
  return buildWhatsAppUrl(buildCheckoutMessage(items, customer))
}

export interface ContactEnquiry {
  name: string
  phone?: string
  email?: string
  description: string
}

/** Contact-page form → WhatsApp message. */
export function buildContactMessage(enquiry: ContactEnquiry): string {
  const lines: string[] = [`Hello ${business.name}!`, '', `Name: ${enquiry.name.trim()}`]

  if (enquiry.phone?.trim()) lines.push(`Phone: ${enquiry.phone.trim()}`)
  if (enquiry.email?.trim()) lines.push(`Email: ${enquiry.email.trim()}`)

  lines.push('', 'Message:', enquiry.description.trim())

  return lines.join('\n')
}

export function contactWhatsAppUrl(enquiry: ContactEnquiry): string {
  return buildWhatsAppUrl(buildContactMessage(enquiry))
}

/** Generic "talk to us" message used by the floating button and CTAs. */
export function buildEnquiryMessage(topic?: string): string {
  return [
    `Hello ${business.name}!`,
    '',
    topic
      ? `I would like to know more about ${topic}.`
      : 'I would like to know more about your chicken and mutton specialities.',
  ].join('\n')
}

export function orderWhatsAppUrl(input: OrderMessageInput): string {
  return buildWhatsAppUrl(buildOrderMessage(input))
}

export function enquiryWhatsAppUrl(topic?: string): string {
  return buildWhatsAppUrl(buildEnquiryMessage(topic))
}

/** tel: link when a number exists, otherwise a safe in-page fallback. */
export function callHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  return digits.length >= 6 ? `tel:${digits}` : '#contact'
}

export { isWhatsAppConfigured }
