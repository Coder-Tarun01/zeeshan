import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { images } from '../../data/images'
import { menuItems, muttonNote } from '../../data/menu'
import { enquiryWhatsAppUrl } from '../../lib/whatsapp'
import { AddToBagButton } from '../order/AddToBagButton'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'

export function MuttonChicken({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const chickenItems = menuItems.filter((item) => item.category === 'chicken')

  return (
    <section
      id="mutton-chicken"
      className="relative overflow-hidden border-y border-cream/[0.06] bg-night py-20 sm:py-24 lg:py-32"
    >
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full bg-burgundy/20 blur-[130px]"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <SectionHeading
          align="center"
          eyebrow="The Board"
          level={headingLevel}
          title={
            <>
              Mutton &amp; <span className="italic text-gold">Chicken</span>
            </>
          }
          description="Two words from our shop board, and the two things our kitchen is built around. Chicken is served all day — ask us what mutton is ready."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:gap-6">
          {/* chicken */}
          <Reveal
            variant="left"
            className="group relative min-h-[520px] overflow-hidden border border-cream/10 lg:min-h-[590px]"
          >
            <div className="absolute inset-0" aria-hidden="false">
              <SmartImage
                image={images.categoryChicken}
                className="h-full w-full"
                imgClassName="transition-transform duration-[1800ms] ease-premium group-hover:scale-[1.06]"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
            <div
              className="absolute inset-0 bg-gradient-to-t from-coal via-coal/85 to-coal/30"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-coal/80 via-transparent to-transparent"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 border border-transparent transition-colors duration-700 group-hover:border-gold/30"
              aria-hidden="true"
            />

            <div className="relative flex h-full flex-col justify-end p-6 sm:p-9">
              <p className="text-[9px] uppercase tracking-label text-gold/80">Category 01</p>
              <h3 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.4rem)] leading-none text-cream">
                Chicken
              </h3>
              <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-cream/60">
                Crispy, masala-forward and fried to order. These are the chicken plates our counter
                serves every day.
              </p>

              <p className="mt-6 text-[8.5px] uppercase tracking-[0.2em] text-gold/70">
                Add to your order list
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {chickenItems.map((item) => (
                  <li key={item.id}>
                    <AddToBagButton
                      variant="chip"
                      label={item.name}
                      item={item.name}
                      category="Mutton & Chicken — Chicken"
                      price={item.price}
                      image={item.image}
                    />
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() =>
                  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="mt-6 inline-flex w-fit items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors duration-300 hover:text-gold-light"
              >
                View chicken menu
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </Reveal>

          {/* mutton */}
          <Reveal
            variant="right"
            delay={120}
            className="group relative min-h-[520px] overflow-hidden border border-gold/20 lg:min-h-[590px]"
          >
            <div className="absolute inset-0">
              <SmartImage
                image={images.categoryMutton}
                className="h-full w-full opacity-90"
                imgClassName="transition-transform duration-[1800ms] ease-premium group-hover:scale-[1.06]"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#2c0c0e] via-coal/90 to-coal/40"
              aria-hidden="true"
            />

            <div className="relative flex h-full flex-col justify-end p-6 sm:p-9">
              <p className="text-[9px] uppercase tracking-label text-gold/80">Category 02</p>
              <h3 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.4rem)] leading-none text-cream">
                Mutton
              </h3>
              <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-cream/65">
                {muttonNote.description}
              </p>

              <div className="mt-6 border border-dashed border-gold/35 bg-coal/35 p-4 backdrop-blur-sm">
                <p className="text-[9px] uppercase tracking-[0.22em] text-gold/80">
                  Space reserved for the menu
                </p>
                <p className="mt-2 font-display text-lg text-cream">{muttonNote.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-cream/50">
                  Mutton dishes are added here as soon as they are confirmed — no invented names,
                  no made-up prices.
                </p>
              </div>

              <a
                href={enquiryWhatsAppUrl('mutton specialities')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold mt-5 w-fit !px-6 !py-3.5 !text-[9.5px]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {muttonNote.cta}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
