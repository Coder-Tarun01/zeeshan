import { ArrowDown, ArrowUpRight, MessageCircle, Star } from 'lucide-react'
import { images } from '../../data/images'
import { business } from '../../data/site'
import { enquiryWhatsAppUrl } from '../../lib/whatsapp'
import { SmartImage } from '../ui/SmartImage'

const heroHighlights = ['Chicken Pakodi', 'Chicken Lollipop', 'Chicken Joint']

export function Hero() {
  return (
    <section
      id="home"
      aria-label="ZEESHAN — chicken and mutton specialities"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden bg-coal pb-16 pt-28 sm:pb-20 lg:pb-24 lg:pt-32"
    >
      {/* ------------------------------------------------------- background */}
      <div className="absolute inset-0 -z-10">
        <SmartImage
          image={images.hero}
          priority
          sizes="100vw"
          className="h-full w-full opacity-[0.8]"
          imgClassName="object-[58%_42%] saturate-[1.08] animate-kenburns"
        />
        <div className="absolute inset-0 bg-hero-vignette" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-coal via-coal/70 to-coal/5"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_88%_8%,rgba(11,11,11,0.9),rgba(11,11,11,0.35)_32%,transparent_55%)]"
          aria-hidden="true"
        />
        <div
          className="absolute left-[-10%] top-1/4 h-[420px] w-[420px] rounded-full bg-gold/[0.09] blur-[130px] animate-glowPulse"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-[8%] h-[360px] w-[360px] rounded-full bg-burgundy/25 blur-[140px]"
          aria-hidden="true"
        />
      </div>

      <div className="container-page relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8 xl:col-span-7">
            {/* brand lockup */}
            <div className="animate-fadeUp">
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-gold/70" aria-hidden="true" />
                <p className="text-[9px] font-medium uppercase tracking-label text-gold sm:text-[10px]">
                  Chicken &amp; Mutton Specialities
                </p>
              </div>

              <p className="mt-6 font-display text-[clamp(2.4rem,6.4vw,3.9rem)] font-medium leading-none tracking-[0.18em] text-cream">
                {business.name}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <span className="h-px w-6 bg-gold/50 sm:w-10" aria-hidden="true" />
                <p className="text-[8.5px] uppercase tracking-[0.44em] text-gold/85 sm:text-[10px]">
                  {business.signLine}
                </p>
                <span className="h-px w-6 bg-gold/50 sm:w-10" aria-hidden="true" />
              </div>
            </div>

            {/* headline */}
            <h1 className="mt-8 max-w-[15ch] font-display text-[clamp(2.1rem,5.6vw,4.15rem)] font-medium uppercase leading-[1.02] tracking-[0.005em] text-cream text-shadow-hero sm:mt-10">
              Cravings That <span className="italic text-gold-light">Deserve</span> More.
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-[1.85] text-cream/65 sm:text-[17px]">
              Experience the irresistible taste of chicken specialities and delicious non-veg
              favourites at {business.name}.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <a href="#menu" className="btn-gold w-full sm:w-auto">
                Explore Our Menu
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={enquiryWhatsAppUrl('placing an order')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Order on WhatsApp
              </a>
            </div>

            <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-cream/10 pt-6">
              {heroHighlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-cream/55"
                >
                  <Star className="h-3 w-3 fill-gold/80 text-gold/80" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* editorial side card (desktop) */}
          <div className="hidden lg:col-span-4 lg:block xl:col-span-5">
            <div className="ml-auto flex max-w-[290px] flex-col items-end gap-6">
              <span
                className="text-[9px] uppercase tracking-[0.5em] text-cream/40 [writing-mode:vertical-rl]"
                aria-hidden="true"
              >
                Mutton &amp; Chicken
              </span>

              <div className="group relative w-full overflow-hidden border border-gold/25 bg-coal/60 p-5 backdrop-blur-md">
                <div
                  className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gold/15 blur-2xl"
                  aria-hidden="true"
                />
                <p className="text-[9px] uppercase tracking-label text-gold/80">House Speciality</p>
                <p className="mt-3 font-display text-2xl leading-tight text-cream">
                  Chicken Lollipop
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-cream/55">
                  Fried crisp, tossed in masala, made to order.
                </p>
                <a
                  href="#specials"
                  className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-gold transition-colors duration-300 hover:text-gold-light"
                >
                  See the specials
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <div className="mt-14 flex items-center justify-between border-t border-cream/10 pt-5 lg:mt-20">
          <p className="text-[9px] uppercase tracking-[0.24em] text-cream/35">
            Chicken &middot; Mutton &middot; Non-Veg Favourites
          </p>
          <a
            href="#menu"
            className="group flex items-center gap-3 text-[9px] uppercase tracking-[0.24em] text-cream/45 transition-colors duration-300 hover:text-gold"
          >
            <span className="hidden sm:inline">Scroll to explore</span>
            <span className="hidden h-8 w-8 items-center justify-center rounded-full border border-cream/20 transition-colors duration-300 group-hover:border-gold/60 sm:flex">
              <ArrowDown className="h-3.5 w-3.5 animate-floaty" aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
