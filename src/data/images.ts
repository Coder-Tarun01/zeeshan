/**
 * Image registry — every photograph used on the site.
 *
 * To swap in ZEESHAN's own photography:
 *   1. Drop the file into `public/images/`
 *   2. Update the `src` (and optional width/height) below.
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
    src: '/images/hero-chicken-lollipop.jpg',
    alt: 'Close-up of glazed chicken lollipops garnished with spring onion',
    width: 1800,
    height: 1350,
  },
  menuPakodi: {
    src: '/images/menu-chicken-pakodi.jpg',
    alt: 'Crispy chicken pakodi pieces served with a dip on a white plate',
    width: 900,
    height: 506,
  },
  menuJoint: {
    src: '/images/menu-chicken-joint.jpg',
    alt: 'Golden fried chicken joint pieces with dipping sauces',
    width: 900,
    height: 563,
  },
  menuLollipop: {
    src: '/images/menu-chicken-lollipop.jpg',
    alt: 'Chicken lollipops arranged on a plate with a bowl of dip',
    width: 900,
    height: 675,
  },
  menuReshma: {
    src: '/images/menu-reshma.jpg',
    alt: 'Golden fried chicken pieces, freshly fried and served',
    width: 900,
    height: 600,
  },
  menuVuda: {
    src: '/images/menu-vuda.jpg',
    alt: 'Glossy masala-coated chicken pieces garnished with spring onion',
    width: 900,
    height: 600,
  },
  specialPakodi: {
    src: '/images/special-pakodi.jpg',
    alt: 'A generous plate of freshly fried chicken pakodi',
    width: 1100,
    height: 732,
  },
  specialLollipop: {
    src: '/images/special-lollipop.jpg',
    alt: 'Tray of chicken lollipops coated in a deep red masala',
    width: 1100,
    height: 825,
  },
  specialJoint: {
    src: '/images/special-joint.jpg',
    alt: 'Fried chicken joint pieces plated with French fries and garnish',
    width: 1100,
    height: 755,
  },
  categoryChicken: {
    src: '/images/category-chicken.jpg',
    alt: 'Chicken curry served in a black karahi',
    width: 1000,
    height: 750,
  },
  categoryMutton: {
    src: '/images/category-mutton.jpg',
    alt: 'Mutton curry served in a traditional serving dish',
    width: 1000,
    height: 750,
  },
  aboutMain: {
    src: '/images/about-main.jpg',
    alt: 'Charred tandoori-style chicken pieces resting on a serving tray',
    width: 1100,
    height: 825,
  },
  aboutInset: {
    src: '/images/about-inset.jpg',
    alt: 'Chicken skewer being grilled over open flame',
    width: 700,
    height: 1050,
  },
  gallery: [
    {
      src: '/images/gallery-01.jpg',
      alt: 'Dark fried chicken pieces garnished with onion rings',
      width: 1000,
      height: 748,
    },
    {
      src: '/images/gallery-02.jpg',
      alt: 'Glazed chicken lollipops stacked on a serving plate',
      width: 1000,
      height: 562,
    },
    {
      src: '/images/gallery-03.jpg',
      alt: 'Golden fried chicken served with dips and sweet potato fries',
      width: 960,
      height: 810,
    },
    {
      src: '/images/gallery-04.jpg',
      alt: 'Mutton speciality curry in a copper serving dish',
      width: 1000,
      height: 750,
    },
    {
      src: '/images/gallery-05.jpg',
      alt: 'Tandoori chicken served with cucumber, onion and lemon',
      width: 1000,
      height: 750,
    },
    {
      src: '/images/gallery-06.jpg',
      alt: 'Roasted chicken portion plated with rice',
      width: 1000,
      height: 653,
    },
    {
      src: '/images/gallery-07.jpg',
      alt: 'Close-up texture of crisp fried chicken pakodi pieces',
      width: 1000,
      height: 664,
    },
  ] as SiteImage[],
} satisfies Record<string, SiteImage | SiteImage[]>
