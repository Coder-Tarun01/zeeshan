/** Shared phone helpers (India: 10-digit mobile, optional +91 prefix). */

export const digitsOnly = (value: string) => value.replace(/\D/g, '')

export function normalizeMobile(value: string): string {
  const digits = digitsOnly(value)
  if (digits.length > 10 && digits.startsWith('91')) return digits.slice(-10)
  return digits.length > 10 ? digits.slice(-10) : digits
}

export const isValidMobile = (value: string) => /^[6-9]\d{9}$/.test(normalizeMobile(value))
