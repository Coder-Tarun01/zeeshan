/**
 * ============================================================================
 *  ZEESHAN — BUSINESS CONFIGURATION
 * ============================================================================
 *  This is the single place the owner (or developer) edits real business data.
 *  Nothing here should be invented: leave a field as an empty string until the
 *  confirmed value is available and the UI will gracefully hide / soften it.
 * ============================================================================
 */

export type SocialPlatform = 'instagram' | 'facebook' | 'youtube'

export interface SocialLink {
  label: string
  platform: SocialPlatform
  /** Full profile URL. Leave empty to hide the link until it exists. */
  href: string
}

export interface BusinessHour {
  days: string
  time: string
}

export const business = {
  /** Primary brand lockup — shown exactly as on the shop signage. */
  name: 'ZEESHAN',
  signLine: 'Mutton & Chicken',
  tagline: 'Cravings That Deserve More.',
  shortDescription:
    'A chicken and mutton food outlet serving crispy chicken specialities and delicious non-veg favourites.',

  /* ---------------------------------------------------------------- contact */
  /** Click-to-call number, international format with + and spaces. */
  phone: '+91 7036369022',
  /** Human friendly version of `phone`, shown on screen. */
  phoneDisplay: '+91 7036369022',
  /** WhatsApp number, digits only, country code first (wa.me requirement). */
  whatsapp: '917036369022',

  /* ---------------------------------------------------------------- address */
  /** e.g. "Shop No. 4, Main Market Road" — EDIT ME. */
  addressLine: '',
  /** e.g. "Old City, Hyderabad 500002" — EDIT ME. */
  addressArea: '',
  /** Short line used when the street address has not been shared yet. */
  addressFallback:
    'We share our exact shop location on request — message us on WhatsApp and the team will send the location pin straight away.',

  /* ------------------------------------------------------------------ hours */
  /** Add real timings as rows, e.g. { days: 'Monday – Sunday', time: '12:00 pm – 11:30 pm' }. */
  hours: [] as BusinessHour[],
  hoursFallback: 'Timings change with the day — message us on WhatsApp for today’s kitchen hours.',

  /* ------------------------------------------------------------------- maps */
  /**
   * Paste a Google Maps *embed* URL here once the shop pin is confirmed
   * (Maps → Share → Embed a map → copy the src value).
   */
  mapsEmbedUrl: '',
  /** Paste the normal Google Maps place link used by "Get directions". */
  mapsLink: '',
  /** Pre-filled Google Maps search used while no pin exists yet. */
  mapsSearchQuery: 'ZEESHAN Mutton & Chicken',

  /* ----------------------------------------------------------------- social */
  socials: [
    { label: 'Instagram', platform: 'instagram', href: '' },
    { label: 'Facebook', platform: 'facebook', href: '' },
    { label: 'YouTube', platform: 'youtube', href: '' },
  ] as SocialLink[],

  /* --------------------------------------------------------------- delivery */
  /** Delivery offer shown on the order bag page. */
  delivery: {
    title: 'Free Delivery',
    note: 'On orders above ₹1000',
  },
}

/** Digits-only WhatsApp number (wa.me requirement). */
export const whatsappNumber = business.whatsapp.replace(/[^\d]/g, '')

/** True once a real WhatsApp number has been added to the config above. */
export const isWhatsAppConfigured = whatsappNumber.length >= 8

/** True once a real call number has been added to the config above. */
export const isPhoneConfigured = business.phone.replace(/[^\d]/g, '').length >= 6

export const activeSocials = business.socials.filter((social) => social.href.trim().length > 0)
