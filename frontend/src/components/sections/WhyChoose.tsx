import { Drumstick, Flame, HeartHandshake, MapPin, MessageCircle } from 'lucide-react'
import { whyChooseFeatures } from '../../data/menu'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { cn } from '../../lib/cn'

const iconMap = {
  flame: Flame,
  drumstick: Drumstick,
  handshake: HeartHandshake,
  message: MessageCircle,
  pin: MapPin,
} as const

export function WhyChoose({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  return (
    <section id="why-us" className="relative overflow-hidden bg-coal py-20 sm:py-24 lg:py-32">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.045] blur-[150px]"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <SectionHeading
          align="center"
          eyebrow="Why ZEESHAN"
          level={headingLevel}
          title={
            <>
              Five Reasons the <span className="italic text-gold">Line Moves</span>
            </>
          }
          description="No certifications we cannot prove, no claims we cannot back. Just the things a good non-veg outlet should get right."
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3 xl:gap-4">
          {whyChooseFeatures.map((feature, index) => {
            const Icon = iconMap[feature.icon]
            return (
              <Reveal
                as="li"
                key={feature.title}
                delay={index * 90}
                className={cn(
                  'group relative flex h-full flex-col border border-cream/10 bg-night/70 p-6',
                  'transition-all duration-500 ease-premium hover:-translate-y-1.5 hover:border-gold/40 hover:bg-night',
                )}
              >
                <span
                  className="absolute right-5 top-5 font-display text-[11px] text-cream/20 transition-colors duration-500 group-hover:text-gold/60"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] text-gold transition-all duration-500 ease-premium group-hover:border-gold group-hover:bg-gold group-hover:text-ink group-hover:shadow-[0_0_30px_-8px_rgba(214,168,75,0.8)]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>

                <h3 className="mt-6 font-display text-[21px] leading-tight text-cream">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-cream/50">{feature.copy}</p>

                <div className="mt-auto pt-5">
                  <span
                    className="block h-px w-0 bg-gold/60 transition-all duration-700 group-hover:w-10"
                    aria-hidden="true"
                  />
                </div>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
