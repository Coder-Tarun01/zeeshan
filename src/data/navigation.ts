export interface NavLink {
  label: string
  href: string
}

export const navLinks: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Our Menu', href: '#menu' },
  { label: 'Chicken Specials', href: '#specials' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]

/** Section ids used by the scroll-spy (order matches the page). */
export const sectionIds = [
  'home',
  'menu',
  'specials',
  'mutton-chicken',
  'about',
  'why-us',
  'gallery',
  'contact',
]
