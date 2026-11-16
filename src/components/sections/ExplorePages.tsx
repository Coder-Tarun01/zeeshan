import { ArrowUpRight } from 'lucide-react'
import { images } from '../../data/images'
import { ABOUT_PATH, GALLERY_PATH, MENU_PATH, SPECIALS_PATH } from '../../lib/router'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'

const pages = [
  {
    title: 'Our Menu',
    copy: 'Pakodi, joint, lollipop, Reshma and Vuda — in 100g, 250g or 500g.',
    href: MENU_PATH,
    image: images.menuPakodi,
  },
  {
    title: 'Chicken Specials',
    copy: 'The three plates that leave our counter most often.',
    href: SPECIALS_PATH,
    image: images.specialLollipop,
  },
  {
    title: 'Food Gallery',
    copy: 'Close-ups of the coatings, the masala and the sides.',
    href: GALLERY_PATH,
    image: images.gallery[1],
  },
  {
    title: 'About ZEESHAN',
    copy: 'A chicken and mutton outlet, and how we work.',
    href: ABOUT_PATH,
    image: images.aboutMain,
  },
]

/** Home-page shortcuts into the dedicated section pages. */
export function ExplorePages() {
  return (
    <section id="explore" className="relative overflow-hidden bg-ink py-20 sm:py-24">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <SectionHeading
          eyebrow="Explore"
          title={
            <>
              Where To <span className="italic text-gold">Next?</span>
            </>
          }
          description="Everything is a page of its own — open the menu, see the specials, browse the gallery or read about the shop."
          className="max-w-xl"
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {pages.map((page, index) => (
            <Reveal as="li" key={page.href} delay={index * 80}>
              <a
                href={page.href}
                className="group relative block overflow-hidden border border-cream/10 transition-colors duration-500 hover:border-gold/45"
              >
                <SmartImage
                  image={page.image}
                  className="aspect-[4/5] w-full"
                  imgClassName="transition-transform duration-[1400ms] ease-premium group-hover:scale-[1.06]"
                  sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 100vw"
                />
                <span
                  className="absolute inset-0 bg-gradient-to-t from-coal via-coal/55 to-transparent"
                  aria-hidden="true"
                />
                <span className="absolute inset-x-0 bottom-0 block p-5">
                  <span className="block font-display text-[23px] leading-tight text-cream">
                    {page.title}
                  </span>
                  <span className="mt-2 block text-[12px] leading-relaxed text-cream/55">
                    {page.copy}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                    View page
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
