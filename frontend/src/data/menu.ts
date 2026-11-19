import { images, type SiteImage } from './images'
import { formatINR } from '../lib/price'

/**
 * Chicken Pakodi is the only item sold by weight. The other four are sold by
 * the piece, so their quantity in the bag is a piece count.
 */
export const PORTIONS = ['100g', '250g', '500g'] as const
export type Portion = (typeof PORTIONS)[number]
/** Pre-selected weight on cards and quick adds. */
export const DEFAULT_PORTION: Portion = '250g'

/** Plate sizes — "Full / half" is one option in the form, with a price for each. */
export const PLATE_SIZES = ['full', 'half'] as const
export type PlateSize = (typeof PLATE_SIZES)[number]
/** Pre-selected plate size on cards, quick adds and the order panel. */
export const DEFAULT_PLATE_SIZE: PlateSize = 'full'

/** `weight` → 100g/250g/500g prices · `plate` → full/half prices · `piece` → one price. */
export type PriceUnit = 'weight' | 'plate' | 'piece'

export type MenuPricing =
  | { unit: 'weight'; prices: Record<Portion, number> }
  | { unit: 'plate'; prices: Record<PlateSize, number> }
  | { unit: 'piece'; price: number }

/** The choice a customer makes for one line — a weight or a plate size. */
export type Variant = Portion | PlateSize

/** Reads a stored choice — anything that isn't a weight or plate size becomes `undefined`. */
export function normalizeVariant(value: unknown): Variant | undefined {
  return typeof value === 'string' && (isPortion(value) || isPlateSize(value)) ? value : undefined
}

/** Options for the admin panel's "Sold by" buttons, in display order. */
export const SOLD_BY_OPTIONS: { id: PriceUnit; label: string; description: string }[] = [
  {
    id: 'piece',
    label: 'Per piece',
    description: 'One price per piece — the customer orders a piece count.',
  },
  {
    id: 'weight',
    label: 'By weight',
    description: 'A price for 100g, 250g and 500g — the customer picks the weight.',
  },
  {
    id: 'plate',
    label: 'Full / half',
    description: 'A price for a full plate and one for a half plate — the customer picks either.',
  },
]

export const isPortion = (value: string): value is Portion =>
  (PORTIONS as readonly string[]).includes(value)

export const isPlateSize = (value: string): value is PlateSize =>
  (PLATE_SIZES as readonly string[]).includes(value)

/** Choices a customer can pick for a line of this unit — empty for per-piece items. */
export function variantOptions(unit: PriceUnit): readonly Variant[] {
  if (unit === 'weight') return PORTIONS
  if (unit === 'plate') return PLATE_SIZES
  return []
}

/** The choice a line starts on when the customer hasn't picked one yet. */
export function defaultVariant(unit: PriceUnit): Variant | undefined {
  if (unit === 'weight') return DEFAULT_PORTION
  if (unit === 'plate') return DEFAULT_PLATE_SIZE
  return undefined
}

/** "250g" / "full" / "half" / "piece" — how one unit of a line is described. */
export function unitSuffix(unit: PriceUnit, variant?: Variant): string {
  if (unit === 'weight') return variant && isPortion(variant) ? variant : DEFAULT_PORTION
  if (unit === 'plate') return variant && isPlateSize(variant) ? variant : DEFAULT_PLATE_SIZE
  return 'piece'
}

/** Reads a stored unit — anything unknown becomes `null`. */
export function normalizeUnit(value: unknown): PriceUnit | null {
  return value === 'weight' || value === 'plate' || value === 'piece' ? value : null
}

/**
 * Category ids are free-form slugs. The two below are only the **seed**: the
 * `/admin` panel lets the owner create, rename, reorder and delete categories at
 * runtime, and stores them in this browser under `zeeshan:categories:v1`.
 */
export type MenuCategoryId = string

export interface MenuCategory {
  /** Stable slug referenced by `MenuItem.category` — never rewritten by a rename. */
  id: string
  /** Name shown on the menu filter chips, cards and in the admin panel. */
  label: string
  /** Optional note for staff (shown under the label in the admin panel). */
  description?: string
}

/** Categories shipped with the site — also the seed for the `/admin` manager. */
export const menuCategories: MenuCategory[] = [
  { id: 'chicken', label: 'Chicken' },
  { id: 'mutton', label: 'Mutton' },
]

export interface MenuItem {
  id: string
  /** Item name exactly as supplied by the business — do not rename. */
  name: string
  category: MenuCategoryId
  /** Short, owner-editable description. */
  description: string
  /** Owner-supplied rates. Never invent a number here. */
  pricing: MenuPricing
  image: SiteImage
  /** Small label shown on the card. */
  tag?: string
  /** `false` shows a "Sold out" badge and blocks ordering until it is switched back on. */
  available: boolean
}

/** The menu shipped with the site — also the seed for the `/admin` manager. */
export const menuItems: MenuItem[] = [
  {
    id: 'chicken-pakodi',
    name: 'Chicken Pakodi',
    category: 'chicken',
    description:
      'Crispy, bite-sized chicken pakodi fried to order and served hot with a dip.',
    pricing: { unit: 'weight', prices: { '100g': 60, '250g': 150, '500g': 300 } },
    image: images.menuPakodi,
    tag: 'Signature',
    available: true,
  },
  {
    id: 'chicken-joint',
    name: 'Chicken Joint',
    category: 'chicken',
    description:
      'Bone-in chicken joint pieces, fried golden and packed with masala flavour.',
    pricing: { unit: 'piece', price: 60 },
    image: images.menuJoint,
    available: true,
  },
  {
    id: 'chicken-lollipop',
    name: 'Chicken Lollipop',
    category: 'chicken',
    description:
      'Frenched chicken winglets, fried crisp and finished in our signature masala.',
    pricing: { unit: 'piece', price: 25 },
    image: images.menuLollipop,
    tag: 'Crowd Favourite',
    available: true,
  },
  {
    id: 'reshma',
    name: 'Reshma',
    category: 'chicken',
    description: 'A ZEESHAN house speciality from our kitchen, served by the piece.',
    pricing: { unit: 'piece', price: 30 },
    image: images.menuReshma,
    tag: 'Speciality',
    available: true,
  },
  {
    id: 'vuda',
    name: 'Vuda',
    category: 'chicken',
    description: 'A ZEESHAN speciality from our kitchen, served by the piece.',
    pricing: { unit: 'piece', price: 20 },
    image: images.menuVuda,
    tag: 'Speciality',
    available: true,
  },
]

/** Looks an item up by the name used on cards, chips and footer links. */
export function findMenuItem(name: string): MenuItem | undefined {
  const key = name.trim().toLowerCase()
  return menuItems.find((item) => item.name.trim().toLowerCase() === key)
}

export function findMenuItemById(id: string): MenuItem | undefined {
  return menuItems.find((item) => item.id === id)
}

/** Price of one weight portion, one plate size or one piece; `null` when unknown. */
export function priceFor(item: MenuItem, variant?: Variant): number | null {
  const pricing = item.pricing
  if (pricing.unit === 'piece') return pricing.price

  if (pricing.unit === 'weight') {
    const key = variant && isPortion(variant) ? variant : DEFAULT_PORTION
    return pricing.prices[key] ?? null
  }

  const key = variant && isPlateSize(variant) ? variant : DEFAULT_PLATE_SIZE
  return pricing.prices[key] ?? null
}

/** Cheapest way to order the item — used for "from ₹60" hints. */
export function lowestPrice(item: MenuItem): number {
  const pricing = item.pricing
  if (pricing.unit === 'piece') return pricing.price
  if (pricing.unit === 'weight') {
    return Math.min(...PORTIONS.map((portion) => pricing.prices[portion]))
  }
  return Math.min(...PLATE_SIZES.map((size) => pricing.prices[size]))
}

/** Compact price label for lists: "₹60 / piece" or "from ₹150". */
export function priceHint(item: MenuItem): string {
  return item.pricing.unit === 'piece'
    ? `${formatINR(item.pricing.price)} / piece`
    : `from ${formatINR(lowestPrice(item))}`
}

export interface MenuFilter {
  /** `'all'` shows every item; anything else is a category id. */
  id: 'all' | MenuCategoryId
  label: string
}

/* ------------------------------------------------------------------ specials */

export interface ChickenSpecial {
  index: string
  /** Menu item this special is priced from (`menuItems` id). */
  menuId: string
  name: string
  tagline: string
  description: string
  image: SiteImage
}

export const chickenSpecials: ChickenSpecial[] = [
  {
    index: '01',
    menuId: 'chicken-pakodi',
    name: 'Chicken Pakodi',
    tagline: 'Crisp outside. Juicy inside.',
    description:
      'The snack that starts every order — small, crunchy chicken pakodi pieces, fried fresh and served hot.',
    image: images.specialPakodi,
  },
  {
    index: '02',
    menuId: 'chicken-lollipop',
    name: 'Chicken Lollipop',
    tagline: 'The one everyone asks for.',
    description:
      'Winglets shaped into lollipops, coated in masala and fried until the edges turn deep red.',
    image: images.specialLollipop,
  },
  {
    index: '03',
    menuId: 'chicken-joint',
    name: 'Chicken Joint',
    tagline: 'Bone-in, bold and golden.',
    description:
      'Proper joint pieces with the bone kept in — more flavour, more bite, fried the classic way.',
    image: images.specialJoint,
  },
]

/* ------------------------------------------------------- mutton placeholder */

export const muttonNote = {
  title: 'Mutton specialities',
  description:
    'Our mutton menu is being added here. Today’s preparations change, so message us and we will tell you exactly what is ready.',
  cta: 'Ask for Mutton Today',
}

/* ------------------------------------------------------------- why choose us */

export const whyChooseFeatures = [
  {
    icon: 'flame' as const,
    title: 'Chicken Specialities',
    copy: 'Pakodi, lollipop and joint — the dishes our kitchen is known for.',
  },
  {
    icon: 'drumstick' as const,
    title: 'Mutton & Chicken',
    copy: 'A menu built around the two things the ZEESHAN board promises.',
  },
  {
    icon: 'handshake' as const,
    title: 'Customer-Friendly Service',
    copy: 'Straight answers on what is available, what it costs and when it is ready.',
  },
  {
    icon: 'message' as const,
    title: 'Easy WhatsApp Ordering',
    copy: 'Tap an item, send the message, collect your order. No forms, no waiting on hold.',
  },
  {
    icon: 'pin' as const,
    title: 'Convenient Location',
    copy: 'Find us on the map, call for directions or ask for the location pin.',
  },
]
