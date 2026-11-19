import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, MapPin, Plus, X } from 'lucide-react'
import { images } from '../../data/images'
import { resolveMediaUrl } from '../../lib/api'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { CONTACT_PATH } from '../../lib/router'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'
import { cn } from '../../lib/cn'

const tiles = images.gallery
const ratios = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/2]']

export function Gallery({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const isOpen = activeIndex !== null
  const dialogRef = useRef<HTMLDivElement>(null)
  useLockBodyScroll(isOpen)

  const close = useCallback(() => setActiveIndex(null), [])

  const step = useCallback((direction: 1 | -1) => {
    setActiveIndex((current) => {
      if (current === null) return current
      return (current + direction + tiles.length) % tiles.length
    })
  }, [])

  useEffect(() => {
    if (!isOpen) return

    dialogRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button')
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close, step])

  const active = activeIndex !== null ? tiles[activeIndex] : null

  return (
    <section id="gallery" className="relative overflow-hidden bg-ink py-20 sm:py-24 lg:py-32">
      <div
        className="pointer-events-none absolute -right-24 top-16 h-[380px] w-[380px] rounded-full bg-burgundy/20 blur-[120px]"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Food Gallery"
            level={headingLevel}
            title={
              <>
                The Plates, <span className="italic text-gold">Up Close.</span>
              </>
            }
            description="Crisp coatings, deep masala and the sides that come with them. Tap any frame to see it larger."
            className="max-w-xl"
          />
          <Reveal delay={120}>
            <p className="max-w-xs text-[11px] leading-relaxed text-cream/35">
              A closer look at the plates we serve. Tap any frame to see it larger.
            </p>
          </Reveal>
        </div>

        <Reveal delay={100} className="mt-10 sm:mt-12">
          <div className="columns-2 gap-3 sm:gap-4 lg:columns-3">
            <div className="relative mb-3 flex aspect-[4/5] break-inside-avoid flex-col justify-between overflow-hidden border border-gold/30 bg-gradient-to-br from-night via-ink to-burgundy-deep p-5 sm:mb-4 sm:p-6">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 font-display text-[190px] leading-none text-gold/[0.07]"
              >
                Z
              </span>
              <p className="relative text-[9px] uppercase tracking-label text-gold/80">Our Shop</p>
              <div className="relative">
                <p className="font-display text-[26px] leading-none tracking-[0.14em] text-cream sm:text-[30px]">
                  ZEESHAN
                </p>
                <p className="mt-2 text-[7.5px] uppercase tracking-[0.34em] text-gold/85">
                  Mutton &amp; Chicken
                </p>
                <span className="mt-4 block h-px w-10 bg-gold/50" aria-hidden="true" />
                <p className="mt-4 text-[11.5px] leading-relaxed text-cream/50">
                  Step in, smell the fryer, and order at the counter — or message us first.
                </p>
              </div>
              <a
                href={CONTACT_PATH}
                className="relative inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors duration-300 hover:text-gold-light"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Find the shop
              </a>
            </div>

            {tiles.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="group relative mb-3 block w-full break-inside-avoid overflow-hidden border border-cream/10 transition-colors duration-500 hover:border-gold/50 sm:mb-4"
                aria-label={`Open larger image: ${image.alt}`}
              >
                <SmartImage
                  image={image}
                  className={cn('w-full', ratios[index % ratios.length])}
                  imgClassName="transition-transform duration-[1400ms] ease-premium group-hover:scale-[1.07]"
                  sizes="(min-width: 1024px) 30vw, 50vw"
                />
                <span
                  className="absolute inset-0 bg-gradient-to-t from-coal via-coal/35 to-coal/5 transition-opacity duration-500 group-hover:from-coal group-hover:via-coal/45"
                  aria-hidden="true"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-4">
                  <span className="text-left text-[9px] uppercase leading-relaxed tracking-[0.14em] text-cream/75 sm:text-[10px]">
                    {image.alt.split(',')[0]}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold opacity-0 transition-all duration-500 group-hover:opacity-100">
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {/* --------------------------------------------------------- lightbox */}
      {active && (
        <div
          ref={dialogRef}
          tabIndex={-1}
          className="fixed inset-0 z-[130] flex flex-col bg-coal/95 backdrop-blur-sm outline-none"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image viewer"
        >
          <div className="flex items-center justify-between border-b border-cream/10 px-4 py-4 sm:px-8">
            <p className="text-[9px] uppercase tracking-[0.22em] text-cream/50">
              {activeIndex !== null ? activeIndex + 1 : 1} / {tiles.length}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close gallery"
              className="flex h-10 w-10 items-center justify-center border border-cream/15 text-cream/70 transition-colors duration-300 hover:border-gold/60 hover:text-gold"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-3 py-4 sm:px-16">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 bg-coal/70 text-cream/80 transition-colors duration-300 hover:border-gold/70 hover:text-gold sm:left-5"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <figure className="flex max-h-full flex-col items-center">
              <img
                src={resolveMediaUrl(active.src)}
                alt={active.alt}
                className="max-h-[72svh] w-auto max-w-full border border-cream/10 object-contain"
              />
              <figcaption className="mt-4 max-w-xl text-center text-[12px] leading-relaxed text-cream/55">
                {active.alt}
              </figcaption>
            </figure>

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 bg-coal/70 text-cream/80 transition-colors duration-300 hover:border-gold/70 hover:text-gold sm:right-5"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
