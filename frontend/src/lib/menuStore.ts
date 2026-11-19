/**
 * Menu storage.
 *
 * The menu the site ships with lives in `src/data/menu.ts`. The `/admin` panel
 * edits a copy that is saved in the browser (`localStorage`), so the owner can
 * add dishes, change prices and mark items sold out without a rebuild.
 *
 * The panel also exports the edited menu as JSON / TypeScript so a change can be
 * pasted into `src/data/menu.ts` when it should reach every visitor.
 */
import { images, type SiteImage } from '../data/images'
import {
  PLATE_SIZES,
  PORTIONS,
  menuCategories,
  menuItems as shippedItems,
  type MenuCategory,
  type MenuCategoryId,
  type MenuItem,
  type MenuPricing,
  type PlateSize,
  type Portion,
} from '../data/menu'

export const MENU_STORAGE_KEY = 'zeeshan:menu:v1'
/** Categories live in their own key so an old saved menu still loads. */
export const CATEGORY_STORAGE_KEY = 'zeeshan:categories:v1'

/** Photos offered by the admin panel's photo picker (one entry per file). */
const IMAGE_OPTIONS = [
  { key: 'menuPakodi', label: 'Chicken Pakodi' },
  { key: 'menuJoint', label: 'Chicken Joint' },
  { key: 'menuLollipop', label: 'Chicken Lollipop' },
  { key: 'menuReshma', label: 'Chicken Reshmi Kabab' },
  { key: 'menuVuda', label: 'Chicken Vuda' },
  { key: 'categoryMutton', label: 'Mutton (placeholder photo)' },
] as const

export const menuImageOptions = IMAGE_OPTIONS.map((option) => ({
  key: option.key,
  label: option.label,
  image: images[option.key],
}))

/** A fresh copy of the menu that ships with the site. */
export function defaultMenu(): MenuItem[] {
  return shippedItems.map((item) => ({ ...item, available: item.available !== false }))
}

/* ---------------------------------------------------------------- categories */

/** A fresh copy of the categories that ship with the site. */
export function defaultCategories(): MenuCategory[] {
  return menuCategories.map((category) => ({ ...category }))
}

const MAX_CATEGORY_LABEL = 28
const MAX_CATEGORY_DESCRIPTION = 90

/** Anything read from storage is treated as untrusted and rebuilt field by field. */
export function sanitizeCategory(raw: unknown): MenuCategory | null {
  if (!raw || typeof raw !== 'object') return null

  const entry = raw as Partial<MenuCategory>
  const label = typeof entry.label === 'string' ? entry.label.trim().slice(0, MAX_CATEGORY_LABEL) : ''
  if (!label) return null

  const id = typeof entry.id === 'string' && entry.id.trim() ? slugify(entry.id) : slugify(label)
  const description =
    typeof entry.description === 'string'
      ? entry.description.trim().slice(0, MAX_CATEGORY_DESCRIPTION)
      : ''

  return { id, label, ...(description ? { description } : {}) }
}

/**
 * Reads the stored categories. Falls back to the shipped pair when there is
 * nothing usable, so the shop always keeps at least one category to file items
 * under.
 */
export function readStoredCategories(): MenuCategory[] {
  let raw: string | null = null

  try {
    raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY)
  } catch {
    return defaultCategories()
  }

  if (!raw) return defaultCategories()

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultCategories()

    const seen = new Set<string>()
    const categories: MenuCategory[] = []

    for (const entry of parsed) {
      const category = sanitizeCategory(entry)
      if (!category || seen.has(category.id)) continue
      seen.add(category.id)
      categories.push(category)
    }

    return categories.length > 0 ? categories : defaultCategories()
  } catch {
    return defaultCategories()
  }
}

/** Saving can fail in private mode — the panel keeps working for this page view. */
export function persistCategories(categories: MenuCategory[]): void {
  try {
    window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories))
  } catch {
    /* storage blocked — changes stay in memory */
  }
}

/** Keeps ids unique even when a label is reused after a delete. */
export function uniqueCategoryId(label: string, categories: MenuCategory[]): MenuCategoryId {
  const base = slugify(label)
  const taken = new Set(categories.map((category) => category.id))
  if (!taken.has(base)) return base

  let suffix = 2
  while (taken.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}

/**
 * Label for a category id. Falls back to a title-cased id so items that were
 * filed under a removed category still read sensibly ("sea-food" → "Sea Food").
 */
export function categoryLabelFor(categories: MenuCategory[], id: string): string {
  const match = categories.find((category) => category.id === id)
  if (match) return match.label

  const words = id.replace(/[-_]+/g, ' ').trim()
  return words ? words.replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Uncategorised'
}

const positivePrice = (value: unknown): number | null => {
  const price = Math.round(Number(value))
  return Number.isFinite(price) && price > 0 ? price : null
}

function sanitizePricing(raw: unknown): MenuPricing | null {
  if (!raw || typeof raw !== 'object') return null
  const pricing = raw as { unit?: unknown; price?: unknown; prices?: Record<string, unknown> }

  if (pricing.unit === 'piece') {
    const price = positivePrice(pricing.price)
    return price === null ? null : { unit: 'piece', price }
  }

  if (pricing.unit === 'plate' && pricing.prices && typeof pricing.prices === 'object') {
    const prices = {} as Record<PlateSize, number>

    for (const size of PLATE_SIZES) {
      const price = positivePrice(pricing.prices[size])
      if (price === null) return null
      prices[size] = price
    }

    return { unit: 'plate', prices }
  }

  if (pricing.unit === 'weight' && pricing.prices && typeof pricing.prices === 'object') {
    const prices = {} as Record<Portion, number>

    for (const portion of PORTIONS) {
      const price = positivePrice(pricing.prices[portion])
      if (price === null) return null
      prices[portion] = price
    }

    return { unit: 'weight', prices }
  }

  return null
}

function sanitizeImage(raw: unknown): SiteImage {
  if (raw && typeof raw === 'object') {
    const image = raw as Partial<SiteImage>
    if (typeof image.src === 'string' && image.src.trim()) {
      return {
        src: image.src,
        alt: typeof image.alt === 'string' ? image.alt : '',
        width: Number(image.width) > 0 ? Number(image.width) : 900,
        height: Number(image.height) > 0 ? Number(image.height) : 600,
      }
    }
  }

  return images.menuJoint
}

/** Anything read from storage is treated as untrusted and rebuilt field by field. */
export function sanitizeMenuItem(raw: unknown): MenuItem | null {
  if (!raw || typeof raw !== 'object') return null

  const entry = raw as Partial<MenuItem>
  const name = typeof entry.name === 'string' ? entry.name.trim() : ''
  const pricing = sanitizePricing(entry.pricing)
  if (!name || !pricing) return null

  const id = typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : slugify(name)
  const tag = typeof entry.tag === 'string' ? entry.tag.trim() : ''
  const category =
    typeof entry.category === 'string' && entry.category.trim()
      ? slugify(entry.category)
      : 'chicken'

  return {
    id,
    name,
    category,
    description: typeof entry.description === 'string' ? entry.description.trim() : '',
    pricing,
    image: sanitizeImage(entry.image),
    tag: tag || undefined,
    available: entry.available !== false,
  }
}

/** Reads the stored menu; falls back to the shipped menu when there is nothing usable. */
export function readStoredMenu(): MenuItem[] {
  let raw: string | null = null

  try {
    raw = window.localStorage.getItem(MENU_STORAGE_KEY)
  } catch {
    return defaultMenu()
  }

  if (!raw) return defaultMenu()

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultMenu()

    return parsed
      .map(sanitizeMenuItem)
      .filter((item): item is MenuItem => item !== null)
  } catch {
    return defaultMenu()
  }
}

/** Saving can fail in private mode — the panel keeps working for this page view. */
export function persistMenu(items: MenuItem[]): void {
  try {
    window.localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* storage blocked — changes stay in memory */
  }
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'item'
}

/** Keeps ids unique even when a name is reused after a delete. */
export function uniqueId(name: string, items: MenuItem[]): string {
  const base = slugify(name)
  const taken = new Set(items.map((item) => item.id))
  if (!taken.has(base)) return base

  let suffix = 2
  while (taken.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}

const quote = (value: string) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

const imageKeyFor = (image: SiteImage) =>
  menuImageOptions.find((option) => option.image.src === image.src)?.key

function pricingToTypeScript(pricing: MenuPricing): string {
  if (pricing.unit === 'piece') return `{ unit: 'piece', price: ${pricing.price} }`

  if (pricing.unit === 'plate') {
    const prices = PLATE_SIZES.map((size) => `'${size}': ${pricing.prices[size]}`).join(', ')
    return `{ unit: 'plate', prices: { ${prices} } }`
  }

  const prices = PORTIONS.map((portion) => `'${portion}': ${pricing.prices[portion]}`).join(', ')
  return `{ unit: 'weight', prices: { ${prices} } }`
}

function imageToTypeScript(image: SiteImage): string {
  const key = imageKeyFor(image)
  if (key) return `images.${key}`

  return `{ src: ${quote(image.src)}, alt: ${quote(image.alt)}, width: ${image.width}, height: ${image.height} }`
}

/** Pretty JSON — the admin panel's own storage format. */
export function menuToJson(items: MenuItem[]): string {
  return JSON.stringify(items, null, 2)
}

/** Drop-in replacement for the `menuItems` array in `src/data/menu.ts`. */
export function menuToTypeScript(items: MenuItem[]): string {
  const rows = items.map((item) => {
    const lines = [
      '  {',
      `    id: ${quote(item.id)},`,
      `    name: ${quote(item.name)},`,
      `    category: '${item.category}',`,
      `    description: ${quote(item.description)},`,
      `    pricing: ${pricingToTypeScript(item.pricing)},`,
      `    image: ${imageToTypeScript(item.image)},`,
      item.tag ? `    tag: ${quote(item.tag)},` : null,
      `    available: ${item.available},`,
      '  },',
    ]

    return lines.filter(Boolean).join('\n')
  })

  return `export const menuItems: MenuItem[] = [\n${rows.join('\n')}\n]\n`
}

/** Drop-in for the `menuCategories` array in `src/data/menu.ts`. */
export function categoriesToTypeScript(categories: MenuCategory[]): string {
  const rows = categories.map((category) => {
    const lines = [
      '  {',
      `    id: ${quote(category.id)},`,
      `    label: ${quote(category.label)},`,
      category.description ? `    description: ${quote(category.description)},` : null,
      '  },',
    ]

    return lines.filter(Boolean).join('\n')
  })

  return `export const menuCategories: MenuCategory[] = [\n${rows.join('\n')}\n]\n`
}
