import { business, isWhatsAppConfigured, whatsappNumber } from '../data/site'

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
  /** Selected weight, e.g. "250g". */
  portion?: string
  /** Optional category / menu context, e.g. "Chicken Specials". */
  category?: string
}

/** The exact message a customer sends when tapping "Order Now". */
export function buildOrderMessage({
  item,
  quantity,
  note,
  portion,
  category,
}: OrderMessageInput): string {
  const lines: string[] = [
    `Hello ${business.name}!`,
    '',
    `I would like to order from your ${category ?? 'menu'}:`,
    `• ${quantity} x ${item}${portion ? ` — ${portion}` : ''}`,
  ]

  const cleanNote = note?.trim()
  if (cleanNote) lines.push(`Note: ${cleanNote}`)

  lines.push('', 'Please confirm availability and the price. Thank you!')

  return lines.join('\n')
}

export interface BagMessageItem {
  name: string
  quantity: number
  portion?: string
  note?: string
}

/** Consolidated message for the whole order bag. */
export function buildBagMessage(items: BagMessageItem[]): string {
  const lines: string[] = [`Hello ${business.name}!`, '', 'I would like to order:']

  items.forEach((item) => {
    const note = item.note?.trim()
    const portion = item.portion ? ` — ${item.portion}` : ''
    lines.push(`• ${item.quantity} x ${item.name}${portion}${note ? ` (${note})` : ''}`)
  })

  lines.push('', 'Please confirm availability and the total. Thank you!')

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

  items.forEach((item) => {
    const note = item.note?.trim()
    const portion = item.portion ? ` — ${item.portion}` : ''
    lines.push(`• ${item.quantity} x ${item.name}${portion}${note ? ` (${note})` : ''}`)
  })

  lines.push('', 'Delivery details', `Name: ${customer.name.trim()}`)

  const mobile = customer.mobile.trim()
  if (mobile) lines.push(`Mobile: ${mobile}`)

  lines.push(`Address: ${formatAddress(customer)}`)

  if (customer.email?.trim()) lines.push(`Email: ${customer.email.trim()}`)

  lines.push('', 'Please confirm availability, the total and delivery. Thank you!')

  return lines.join('\n')
}

export function checkoutWhatsAppUrl(items: BagMessageItem[], customer: CustomerDetails): string {
  return buildWhatsAppUrl(buildCheckoutMessage(items, customer))
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
