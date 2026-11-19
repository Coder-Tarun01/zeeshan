/**
 * Image registry — every photograph used on the site.
 *
 * These are ZEESHAN's own dish photos (the untouched originals live in
 * `source-photos/`, outside the published bundle). One file is often reused —
 * menu card, Chicken Specials, gallery and About all read from here.
 *
 * To swap or add a photo:
 *   1. Save a web-sized copy (≤ 1600 px wide) into `public/images/`
 *   2. Point the matching `src` below at it and update alt/width/height
 * Nothing else needs to change.
 */

export interface SiteImage {
  src: string
  /** Descriptive alt text — required for accessibility and SEO. */
  alt: string
  width: number
  height: number
}

export const images = {
  hero: {
    src: '/images/menu-chicken-lollipop.jpg',
    alt: 'Chicken lollipops coated in a glossy red masala, garnished with spring onion',
    width: 1536,
    height: 1024,
  },
  menuPakodi: {
    src: '/images/menu-chicken-pakodi.jpg',
    alt: 'Crispy chicken pakodi piled on a black plate with curry leaves, onion rings and a red dip',
    width: 1200,
    height: 800,
  },
  menuJoint: {
    src: '/images/menu-chicken-joint.jpg',
    alt: 'Golden fried chicken joint pieces with coriander, onion rings and a red dip',
    width: 1200,
    height: 800,
  },
  menuLollipop: {
    src: '/images/menu-chicken-lollipop.jpg',
    alt: 'Chicken lollipops in a deep red masala, finished with spring onion',
    width: 1536,
    height: 1024,
  },
  menuReshma: {
    src: '/images/menu-reshma.jpg',
    alt: 'Chicken reshmi kabab skewers in a crisp golden coating, served with a red dip',
    width: 1200,
    height: 800,
  },
  menuVuda: {
    src: '/images/menu-vuda.jpg',
    alt: 'Golden fried chicken vuda patties on a black plate with onion rings and coriander',
    width: 1200,
    height: 800,
  },
  specialPakodi: {
    src: '/images/menu-chicken-pakodi.jpg',
    alt: 'A generous plate of freshly fried chicken pakodi',
    width: 1200,
    height: 800,
  },
  specialLollipop: {
    src: '/images/menu-chicken-lollipop.jpg',
    alt: 'Tray of chicken lollipops coated in a deep red masala',
    width: 1536,
    height: 1024,
  },
  specialJoint: {
    src: '/images/menu-chicken-joint.jpg',
    alt: 'Fried chicken joint pieces plated with onion rings and dip',
    width: 1200,
    height: 800,
  },
  categoryChicken: {
    src: '/images/menu-chicken-joint.jpg',
    alt: 'Golden fried chicken joint pieces with onion rings and a red dip',
    width: 1200,
    height: 800,
  },
  categoryMutton: {
    src: '/images/category-mutton.jpg',
    alt: 'Mutton curry served in a traditional serving dish',
    width: 1000,
    height: 750,
  },
  aboutMain: {
    src: '/images/menu-chicken-pakodi.jpg',
    alt: 'Chicken pakodi served hot with curry leaves, onion rings and a red dip',
    width: 1200,
    height: 800,
  },
  aboutInset: {
    src: '/images/menu-vuda.jpg',
    alt: 'Golden chicken vuda patties, freshly fried and plated',
    width: 1200,
    height: 800,
  },
  gallery: [
    {
      src: '/images/menu-chicken-lollipop.jpg',
      alt: 'Chicken lollipops in a deep red masala with spring onion and a chilli dip',
      width: 1536,
      height: 1024,
    },
    {
      src: '/images/menu-reshma.jpg',
      alt: 'Chicken reshmi kabab skewers in a crisp golden coating, with onion rings and dip',
      width: 1200,
      height: 800,
    },
    {
      src: '/images/menu-chicken-joint.jpg',
      alt: 'Golden fried chicken joint pieces with coriander, onion rings and a red dip',
      width: 1200,
      height: 800,
    },
    {
      src: '/images/menu-vuda.jpg',
      alt: 'Chicken vuda patties fried golden, served on a black plate',
      width: 1200,
      height: 800,
    },
    {
      src: '/images/menu-chicken-pakodi.jpg',
      alt: 'Crispy chicken pakodi piled high with curry leaves and lemon',
      width: 1200,
      height: 800,
    },
  ] as SiteImage[],
} satisfies Record<string, SiteImage | SiteImage[]>
