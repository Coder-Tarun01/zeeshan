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

/** Delivery is charged by distance. */
const DELIVERY_RATE_PER_KM = 5
/** Distance used in the worked example shown to customers. */
const DELIVERY_EXAMPLE_KM = 5

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
  /** Public email address. Leave empty to hide the email row. */
  email: '',

  /* ---------------------------------------------------------------- address */
  addressLine: 'Opposite Indian Oil Petrol Bunk, Near Ghati Center',
  addressArea: 'Kakinada, Andhra Pradesh 533016',
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
  /** Normal Google Maps place link used by every "Get directions" button. */
  mapsLink: 'https://maps.app.goo.gl/kTEd4ZHJfx1hvu2SA',
  /** Pre-filled Google Maps search used for directions / the map link. */
  mapsSearchQuery:
    'ZEESHAN Chicken & Mutton, Opposite Indian Oil Petrol Bunk, Ghati Center, Kakinada, Andhra Pradesh 533016',

  /* ----------------------------------------------------------------- social */
  socials: [
    { label: 'Instagram', platform: 'instagram', href: '' },
    { label: 'Facebook', platform: 'facebook', href: '' },
    { label: 'YouTube', platform: 'youtube', href: '' },
  ] as SocialLink[],

  /* --------------------------------------------------------------- delivery */
  /**
   * Delivery is charged per kilometre: ₹5 / km. The copy always shows a worked
   * example ("5 km = ₹25") so the customer knows exactly what to expect.
   * Change DELIVERY_RATE_PER_KM at the top of this file to re-price delivery.
   */
  delivery: {
    /** Rupees per kilometre. */
    ratePerKm: DELIVERY_RATE_PER_KM,
    /** Distance used in the worked example below. */
    exampleKm: DELIVERY_EXAMPLE_KM,
    /** What that example costs, e.g. 25. */
    exampleCharge: DELIVERY_RATE_PER_KM * DELIVERY_EXAMPLE_KM,
    /** Label used in the order summaries. */
    title: 'Delivery',
    /** Short explanation, e.g. "₹5 per km — 5 km = ₹25". */
    note: `₹${DELIVERY_RATE_PER_KM} per km — ${DELIVERY_EXAMPLE_KM} km = ₹${
      DELIVERY_RATE_PER_KM * DELIVERY_EXAMPLE_KM
    }`,
    /** Announcement bar — the "₹5 PER KM" phrase is highlighted automatically. */
    banner: `DELIVERY ₹${DELIVERY_RATE_PER_KM} PER KM · ${DELIVERY_EXAMPLE_KM} KM = ₹${
      DELIVERY_RATE_PER_KM * DELIVERY_EXAMPLE_KM
    }`,
  },
}

/** Digits-only WhatsApp number (wa.me requirement). */
export const whatsappNumber = business.whatsapp.replace(/[^\d]/g, '')

/** True once a real WhatsApp number has been added to the config above. */
export const isWhatsAppConfigured = whatsappNumber.length >= 8

/** True once a real call number has been added to the config above. */
export const isPhoneConfigured = business.phone.replace(/[^\d]/g, '').length >= 6

export const activeSocials = business.socials.filter((social) => social.href.trim().length > 0)
