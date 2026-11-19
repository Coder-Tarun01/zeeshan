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

/** `weight` → pick 100g / 250g / 500g. `piece` → quantity is a piece count. */
export type PriceUnit = 'weight' | 'piece'

export type MenuPricing =
  | { unit: 'weight'; prices: Record<Portion, number> }
  | { unit: 'piece'; price: number }

export type MenuCategoryId = 'chicken' | 'mutton'

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

/** Price of one portion (by weight) or one piece; `null` when unknown. */
export function priceFor(item: MenuItem, portion?: Portion): number | null {
  const pricing = item.pricing
  if (pricing.unit === 'piece') return pricing.price
  const key = portion ?? DEFAULT_PORTION
  return pricing.prices[key] ?? null
}

/** Cheapest way to order the item — used for "from ₹60" hints. */
export function lowestPrice(item: MenuItem): number {
  const pricing = item.pricing
  if (pricing.unit === 'piece') return pricing.price
  return Math.min(...PORTIONS.map((portion) => pricing.prices[portion]))
}

/** Compact price label for lists: "₹60 / piece" or "from ₹60". */
export function priceHint(item: MenuItem): string {
  return item.pricing.unit === 'piece'
    ? `${formatINR(item.pricing.price)} / piece`
    : `from ${formatINR(lowestPrice(item))}`
}

export interface MenuFilter {
  id: 'all' | MenuCategoryId
  label: string
}

export const menuFilters: MenuFilter[] = [
  { id: 'all', label: 'All Specialities' },
  { id: 'chicken', label: 'Chicken' },
  { id: 'mutton', label: 'Mutton' },
]

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
