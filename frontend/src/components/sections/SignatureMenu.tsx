import { useMemo, useState } from 'react'
import { ArrowUpRight, MessageCircle, SlidersHorizontal } from 'lucide-react'
import {
  muttonNote,
  DEFAULT_PORTION,
  defaultVariant,
  priceFor,
  unitSuffix,
  variantOptions,
  type MenuFilter,
  type MenuItem,
  type Variant,
} from '../../data/menu'
import { images } from '../../data/images'
import { useMenu } from '../menu/MenuContext'
import { categoryLabelFor } from '../../lib/menuStore'
import { formatINR } from '../../lib/price'
import { enquiryWhatsAppUrl } from '../../lib/whatsapp'
import { SectionHeading } from '../ui/SectionHeading'
import { SmartImage } from '../ui/SmartImage'
import { Reveal } from '../ui/Reveal'
import { AddToBagButton } from '../order/AddToBagButton'
import { useOrder } from '../order/OrderContext'
import { cn } from '../../lib/cn'

/** The panel's `mutton` category also shows the "ask for today's mutton" panel. */
const MUTTON_CATEGORY_ID = 'mutton'

function MenuCard({
  item,
  index,
  categoryLabel,
}: {
  item: MenuItem
  index: number
  /** Label of the item's category, resolved from the categories created in the panel. */
  categoryLabel: string
}) {
  const { openOrder } = useOrder()
  const soldOut = !item.available
  const isWeight = item.pricing.unit === 'weight'
  const choices = variantOptions(item.pricing.unit)
  const [variant, setVariant] = useState<Variant>(
    () => defaultVariant(item.pricing.unit) ?? DEFAULT_PORTION,
  )
  const unitPrice = priceFor(item, variant)
  const unitLabel = ` / ${unitSuffix(item.pricing.unit, variant)}`
  const selectable = choices.length > 0

  return (
    <Reveal as="article" delay={index * 80} className="group relative h-full">
      <div className="relative flex h-full flex-col overflow-hidden border border-cream/10 bg-night transition-all duration-700 ease-premium group-hover:border-gold/45 group-hover:shadow-[0_36px_90px_-48px_rgba(214,168,75,0.5)]">
        <div className="relative aspect-[4/3] overflow-hidden">
          <SmartImage
            image={item.image}
            className="h-full w-full"
            imgClassName={cn(
              'transition-transform duration-[1400ms] ease-premium group-hover:scale-[1.08]',
              soldOut && 'opacity-45 grayscale',
            )}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-night via-night/10 to-transparent"
            aria-hidden="true"
          />

          {soldOut ? (
            <span className="absolute left-4 top-4 border border-cream/30 bg-coal/80 px-2.5 py-1 text-[8px] uppercase tracking-[0.22em] text-cream/80 backdrop-blur-sm">
              Sold out
            </span>
          ) : (
            item.tag && (
              <span className="absolute left-4 top-4 border border-gold/40 bg-coal/70 px-2.5 py-1 text-[8px] uppercase tracking-[0.22em] text-gold backdrop-blur-sm">
                {item.tag}
              </span>
            )
          )}

          <span
            className="absolute right-4 top-3 font-display text-[28px] leading-none text-cream/25"
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          <div className="absolute inset-x-0 bottom-0 px-5 pb-4">
            <p className="text-[8.5px] uppercase tracking-label text-gold/80">{categoryLabel}</p>
            <h3 className="mt-1.5 font-display text-[27px] leading-tight text-cream">
              {item.name}
            </h3>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <p className="text-[13.5px] leading-relaxed text-cream/55">{item.description}</p>

          <div className="mt-auto pt-4">
            {selectable ? (
              <>
                <p className="text-[8px] uppercase tracking-[0.2em] text-cream/35">
                  {isWeight ? 'Weight' : 'Plate'}
                </p>
                <div
                  role="group"
                  aria-label={`${isWeight ? 'Weight' : 'Plate size'} for ${item.name}`}
                  className="mt-1.5 flex gap-1.5"
                >
                  {choices.map((choice) => {
                    const isActive = choice === variant
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setVariant(choice)}
                        disabled={soldOut}
                        aria-pressed={isActive}
                        className={cn(
                          'flex-1 border px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40',
                          isActive
                            ? 'border-gold bg-gold/15 text-gold'
                            : 'border-cream/15 text-cream/45 hover:border-gold/45 hover:text-cream/75',
                        )}
                      >
                        {choice}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="text-[8px] uppercase tracking-[0.2em] text-cream/35">
                Sold by the piece
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-cream/10 pt-4">
            <span className="text-[14px] font-semibold text-cream">
              {unitPrice !== null ? formatINR(unitPrice) : 'Price on ask'}
              <span className="ml-1 text-[9px] uppercase tracking-[0.16em] text-cream/40">
                {unitLabel}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <AddToBagButton
                variant="solid"
                item={item.name}
                category={`ZEESHAN Menu — ${categoryLabel}`}
                portion={selectable ? variant : undefined}
                image={item.image}
              />
              <button
                type="button"
                onClick={() =>
                  openOrder({
                    item: item.name,
                    category: `ZEESHAN Menu — ${categoryLabel}`,
                    portion: selectable ? variant : undefined,
                    image: item.image,
                  })
                }
                disabled={soldOut}
                className="group/btn inline-flex items-center gap-2 border border-gold/35 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gold/35 disabled:hover:bg-transparent disabled:hover:text-gold"
              >
                Order Now
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

export function SignatureMenu({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const { items, categories } = useMenu()
  const [requested, setRequested] = useState<string>('all')

  /** Filter chips come from the categories the owner created in the panel. */
  const filters = useMemo<MenuFilter[]>(
    () => [
      { id: 'all', label: 'All Specialities' },
      ...categories.map((category) => ({ id: category.id, label: category.label })),
    ],
    [categories],
  )

  /* A category deleted in the panel falls back to "All" instead of an empty grid. */
  const active = filters.some((filter) => filter.id === requested) ? requested : 'all'
  const visibleItems = active === 'all' ? items : items.filter((item) => item.category === active)
  const showMuttonPanel = active === MUTTON_CATEGORY_ID
  const description =
    items.length > 0
      ? 'House preparations, fried and finished to order. Chicken Pakodi is sold by weight — 100g, 250g or 500g — and the rest are priced per piece, full or half.'
      : 'The menu is being updated. Message us on WhatsApp and we will tell you what is ready today.'

  return (
    <section id="menu" className="relative overflow-hidden bg-ink py-20 sm:py-24 lg:py-32">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 top-24 h-[440px] w-[440px] rounded-full bg-gold/[0.05] blur-[120px]"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Our Menu"
            level={headingLevel}
            title={
              <>
                The Signature <span className="italic text-gold">Menu</span>
              </>
            }
            description={description}
            className="max-w-2xl"
          />

          <Reveal delay={120} className="shrink-0">
            <a
              href={enquiryWhatsAppUrl('the full menu')}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-cream/55 transition-colors duration-300 hover:text-gold"
            >
              <MessageCircle className="h-4 w-4 text-gold/80" aria-hidden="true" />
              Ask for today&apos;s availability
              <span
                className="h-px w-8 bg-gold/50 transition-all duration-500 group-hover:w-12"
                aria-hidden="true"
              />
            </a>
          </Reveal>
        </div>

        {/* filters */}
        <Reveal delay={80} className="mt-10">
          <div className="flex items-center gap-3">
            <SlidersHorizontal
              className="hidden h-4 w-4 shrink-0 text-gold/60 sm:block"
              aria-hidden="true"
            />
            <div
              className="flex gap-2 overflow-x-auto no-scrollbar"
              role="tablist"
              aria-label="Menu categories"
            >
              {filters.map((filter) => {
                const isActive = active === filter.id
                return (
                  <button
                    key={filter.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setRequested(filter.id)}
                    className={cn(
                      'shrink-0 border px-5 py-3 text-[9.5px] font-semibold uppercase tracking-[0.18em] transition-all duration-300',
                      isActive
                        ? 'border-gold bg-gold text-ink'
                        : 'border-cream/15 text-cream/55 hover:border-gold/50 hover:text-cream',
                    )}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>
          </div>
        </Reveal>

        {/* grid */}
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {visibleItems.length === 0 && !showMuttonPanel && (
            <Reveal className="border border-dashed border-gold/25 px-6 py-14 text-center sm:col-span-2 lg:col-span-3">
              <p className="font-display text-2xl text-cream">Nothing on this list right now</p>
              <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-cream/45">
                The kitchen is updating this section — message us on WhatsApp and we will tell you
                what is ready today.
              </p>
            </Reveal>
          )}

          {visibleItems.map((item, index) => (
            <MenuCard
              key={item.id}
              item={item}
              index={index}
              categoryLabel={categoryLabelFor(categories, item.category)}
            />
          ))}

          {showMuttonPanel && (
            <Reveal className="sm:col-span-2 lg:col-span-3">
              <div className="grid overflow-hidden border border-gold/20 bg-night md:grid-cols-[1.1fr_1fr]">
                <SmartImage
                  image={images.categoryMutton}
                  className="aspect-[16/10] w-full md:aspect-auto md:h-full md:min-h-[320px]"
                  sizes="(min-width: 768px) 55vw, 100vw"
                />
                <div className="flex flex-col justify-center px-7 py-9 sm:px-10">
                  <p className="text-[9px] uppercase tracking-label text-gold">Mutton</p>
                  <h3 className="mt-3 font-display text-3xl leading-tight text-cream">
                    {muttonNote.title}
                  </h3>
                  <p className="mt-3 max-w-md text-[14px] leading-relaxed text-cream/55">
                    {muttonNote.description}
                  </p>
                  <a
                    href={enquiryWhatsAppUrl('mutton specialities')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline mt-6 w-fit !px-6 !py-3.5"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    {muttonNote.cta}
                  </a>
                </div>
              </div>
            </Reveal>
          )}
        </div>

        {active === 'all' && (
          <Reveal
            delay={100}
            className="mt-8 flex flex-wrap items-center gap-3 text-[12px] text-cream/40"
          >
            <span className="h-px w-8 bg-gold/40" aria-hidden="true" />
            Mutton is on the board too —
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById('mutton-chicken')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="text-gold/90 underline decoration-gold/40 underline-offset-4 transition-colors duration-300 hover:text-gold-light"
            >
              see the Mutton &amp; Chicken section
            </button>
          </Reveal>
        )}
      </div>
    </section>
  )
}
