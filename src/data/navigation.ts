export interface NavLink {
  label: string
  href: string
}

/** Real, path-based routes (no hash routing). */
export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Our Menu', href: '/menu' },
  { label: 'Chicken Specials', href: '/chicken-specials' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
]
