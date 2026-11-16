import { cn } from '../../lib/cn'

const marqueeItems = [
  'Chicken Pakodi',
  'Chicken Lollipop',
  'Chicken Joint',
  'Mutton & Chicken',
  'Reshma',
  'Vuda',
]

function MarqueeTrack({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      className="flex min-w-full shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {marqueeItems.map((item) => (
        <li
          key={item}
          className="flex items-center gap-8 whitespace-nowrap pr-8 font-display text-[13px] uppercase tracking-[0.28em] text-cream/85 sm:text-[15px]"
        >
          {item}
          <span className="text-[9px] text-gold" aria-hidden="true">
            ◆
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Thin burgundy band of dish names — a small nod to the illuminated shop board. */
export function MarqueeStrip() {
  return (
    <div
      className={cn(
        'relative flex overflow-hidden border-y border-gold/25 bg-gradient-to-r from-burgundy-deep via-burgundy to-burgundy-deep py-4',
      )}
    >
      <div className="flex w-max animate-marquee">
        <MarqueeTrack />
        <MarqueeTrack hidden />
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-burgundy-deep to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-burgundy-deep to-transparent"
        aria-hidden="true"
      />
    </div>
  )
}
