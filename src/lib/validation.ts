import { isValidMobile } from './phone'

/**
 * Shared form rules for the checkout and contact forms.
 * Every helper returns an error message, or `undefined` when the value is valid.
 */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Letters (any script) plus spaces, apostrophes, dots and hyphens. */
export const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u

const clean = (value: string) => value.trim()

export function validateName(value: string, label = 'name'): string | undefined {
  const name = clean(value)

  if (!name) return `Enter your ${label}`
  if (name.length < 2) return 'Enter at least 2 characters'
  if (name.length > 60) return 'Keep this under 60 characters'
  if (!NAME_PATTERN.test(name)) return 'Use letters, spaces, apostrophes or hyphens only'

  return undefined
}

export function validateEmail(value: string): string | undefined {
  const email = clean(value)

  if (!email) return undefined
  if (email.length > 100) return 'Email is too long'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address'

  return undefined
}

export function validatePhone(value: string, required = true): string | undefined {
  const phone = clean(value)

  if (!phone) return required ? 'Enter your mobile number' : undefined
  if (/[^\d+\s()-]/.test(phone)) return 'Use digits only'
  if (!isValidMobile(phone)) return 'Enter a valid 10-digit mobile number'

  return undefined
}

export function validatePincode(value: string): string | undefined {
  const pincode = clean(value)

  if (!pincode) return 'Enter your pincode'
  if (!/^\d{6}$/.test(pincode)) return 'Enter a 6-digit pincode'
  if (pincode.startsWith('0')) return 'Pincode cannot start with 0'

  return undefined
}

/** H.No — required delivery line. */
export function validateAddressLine(value: string, label = 'house number'): string | undefined {
  const line = clean(value)

  if (!line) return `Enter your ${label}`
  if (line.length < 1) return 'Enter a valid house number'
  if (line.length > 80) return 'Keep this under 80 characters'

  return undefined
}

/** Landmark — optional, but must be meaningful when filled. */
export function validateLandmark(value: string): string | undefined {
  const landmark = clean(value)

  if (!landmark) return undefined
  if (landmark.length < 3) return 'Enter at least 3 characters'
  if (landmark.length > 80) return 'Keep this under 80 characters'

  return undefined
}

/** City / state names. */
export function validatePlace(value: string, label: 'city' | 'state'): string | undefined {
  const place = clean(value)

  if (!place) return `Enter your ${label}`
  if (place.length < 2) return 'Enter at least 2 characters'
  if (place.length > 40) return 'Keep this under 40 characters'
  if (!NAME_PATTERN.test(place)) return 'Use letters, spaces or hyphens only'

  return undefined
}

/** Free-text message (contact form). */
export function validateMessage(value: string, min = 10, max = 600): string | undefined {
  const message = clean(value)

  if (!message) return 'Tell us what you need'
  if (message.length < min) return `Add a few more details (at least ${min} characters)`
  if (message.length > max) return `Keep this under ${max} characters`

  return undefined
}
