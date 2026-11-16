import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { images } from '../../data/images'
import { business } from '../../data/site'
import { enquiryWhatsAppUrl } from '../../lib/whatsapp'
import { SPECIALS_PATH } from '../../lib/router'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { SmartImage } from '../ui/SmartImage'

const aboutHighlights = [
  {
    title: 'Chicken & mutton, nothing else',
    copy: 'A menu that stays focused on the non-veg dishes this kitchen does best.',
  },
  {
    title: 'Fried when you order',
    copy: 'Your order goes into the fryer after you ask for it — then straight into the pack.',
  },
  {
    title: 'A counter you can talk to',
    copy: 'One WhatsApp message tells you what is ready, what it costs and when to collect.',
  },
]

export function About({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  return (
    <section id="about" className="relative overflow-hidden bg-ink py-20 sm:py-24 lg:py-32">
      <div
        className="pointer-events-none absolute right-0 top-1/4 h-[420px] w-[420px] rounded-full bg-gold/[0.05] blur-[130px]"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* ---------------------------------------------------- visual collage */}
          <Reveal variant="left" className="relative">
            <div className="relative">
              <div
                className="absolute -left-3 -top-3 hidden h-full w-full border border-gold/25 sm:block"
                aria-hidden="true"
              />
              <SmartImage
                image={images.aboutMain}
                className="relative aspect-[4/3] w-full sm:w-[88%]"
                imgClassName="transition-transform duration-[1600ms] ease-premium hover:scale-[1.03]"
                sizes="(min-width: 1024px) 44vw, 100vw"
              />

              <div className="absolute -bottom-10 right-0 hidden w-[42%] border-[6px] border-ink shadow-card sm:block">
                <SmartImage
                  image={images.aboutInset}
                  className="aspect-[3/4] w-full"
                  imgClassName="transition-transform duration-[1600ms] ease-premium hover:scale-[1.05]"
                  sizes="(min-width: 1024px) 18vw, 42vw"
                />
              </div>

              <div className="absolute left-4 top-4 flex flex-col border border-gold/40 bg-coal/80 px-4 py-3 backdrop-blur-md sm:left-6 sm:top-6">
                <span className="font-display text-lg leading-none tracking-[0.16em] text-cream">
                  {business.name}
                </span>
                <span className="mt-1.5 text-[7px] uppercase tracking-[0.3em] text-gold/85">
                  {business.signLine}
                </span>
              </div>
            </div>
          </Reveal>

          <div className="lg:pl-4">
            <SectionHeading
              eyebrow="About ZEESHAN"
              level={headingLevel}
              title={
                <>
                  More Than Food.
                  <br />
                  It&apos;s <span className="italic text-gold">ZEESHAN.</span>
                </>
              }
            />

            <div className="mt-6 space-y-4 prose-editorial">
              <Reveal delay={80}>
                <p>
                  {business.name} is a chicken and mutton food outlet — not a café, not a bakery,
                  and not trying to be. Our board says {business.signLine}, and that is exactly what
                  comes out of the kitchen: crispy chicken pakodi, chicken lollipop, chicken joint
                  and the house specialities people come back for.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <p>
                  We keep the menu tight and the service direct. Tell us what you&apos;re craving,
                  we fry it fresh, pack it hot, and you&apos;re on your way — or send a message and
                  we&apos;ll have it ready when you arrive.
                </p>
              </Reveal>
            </div>

            <ul className="mt-8 space-y-4">
              {aboutHighlights.map((highlight, index) => (
                <Reveal as="li" key={highlight.title} delay={180 + index * 90}>
                  <div className="flex gap-4 border-t border-cream/10 pt-4">
                    <span className="font-display text-sm text-gold/70">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-cream/85">
                        {highlight.title}
                      </p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-cream/50">
                        {highlight.copy}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={420} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={enquiryWhatsAppUrl('ZEESHAN')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Talk to Us on WhatsApp
              </a>
              <a
                href={SPECIALS_PATH}
                className="group inline-flex w-full items-center justify-center gap-2 px-2 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/60 transition-colors duration-300 hover:text-gold sm:w-auto"
              >
                Chicken Specials
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
