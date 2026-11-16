import { images, type SiteImage } from './images'

/** Weight options offered for the food items. */
export const PORTIONS = ['100g', '250g', '500g'] as const
export type Portion = (typeof PORTIONS)[number]
/** Pre-selected portion on cards and quick adds. */
export const DEFAULT_PORTION: Portion = '250g'

/** Items can override the list later (e.g. a dish sold only in 500g). */
export function itemPortions(item: { portions?: readonly Portion[] }): readonly Portion[] {
  return item.portions ?? PORTIONS
}

export type MenuCategoryId = 'chicken' | 'mutton'

export interface MenuItem {
  id: string
  /** Item name exactly as supplied by the business — do not rename. */
  name: string
  category: MenuCategoryId
  /**
   * Short, owner-editable description. Chicken Pakodi / Joint / Lollipop use
   * straightforward descriptions of the dish; Reshma and Vuda are left open
   * until the owner confirms the exact preparation.
   */
  description: string
  /**
   * Prices are deliberately empty — never invent them.
   * `null` renders the "Price on ask" state.
   */
  price: string | null
  image: SiteImage
  /** Small label shown on the card. */
  tag?: string
  /** Optional per-item portion list; defaults to 100g / 250g / 500g. */
  portions?: readonly Portion[]
}

export const menuItems: MenuItem[] = [
  {
    id: 'chicken-pakodi',
    name: 'Chicken Pakodi',
    category: 'chicken',
    description:
      'Crispy, bite-sized chicken pakodi fried to order and served hot with a dip.',
    price: null,
    image: images.menuPakodi,
    tag: 'Signature',
  },
  {
    id: 'chicken-joint',
    name: 'Chicken Joint',
    category: 'chicken',
    description:
      'Bone-in chicken joint pieces, fried golden and packed with masala flavour.',
    price: null,
    image: images.menuJoint,
  },
  {
    id: 'chicken-lollipop',
    name: 'Chicken Lollipop',
    category: 'chicken',
    description:
      'Frenched chicken winglets, fried crisp and finished in our signature masala.',
    price: null,
    image: images.menuLollipop,
    tag: 'Crowd Favourite',
  },
  {
    id: 'reshma',
    name: 'Reshma',
    category: 'chicken',
    description:
      'A ZEESHAN house speciality. Ask us for today’s preparation and price.',
    price: null,
    image: images.menuReshma,
    tag: 'Speciality',
  },
  {
    id: 'vuda',
    name: 'Vuda',
    category: 'chicken',
    description:
      'A ZEESHAN speciality from our kitchen. Message us for details and today’s price.',
    price: null,
    image: images.menuVuda,
    tag: 'Speciality',
  },
]

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
  name: string
  tagline: string
  description: string
  image: SiteImage
}

export const chickenSpecials: ChickenSpecial[] = [
  {
    index: '01',
    name: 'Chicken Pakodi',
    tagline: 'Crisp outside. Juicy inside.',
    description:
      'The snack that starts every order — small, crunchy chicken pakodi pieces, fried fresh and served hot.',
    image: images.specialPakodi,
  },
  {
    index: '02',
    name: 'Chicken Lollipop',
    tagline: 'The one everyone asks for.',
    description:
      'Winglets shaped into lollipops, coated in masala and fried until the edges turn deep red.',
    image: images.specialLollipop,
  },
  {
    index: '03',
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
