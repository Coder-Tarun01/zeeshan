import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Reveal } from './Reveal'

interface SectionHeadingProps {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
  id?: string
  /** Use `1` on standalone pages so each page has a single h1. */
  level?: 1 | 2
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  id,
  level = 2,
}: SectionHeadingProps) {
  const centered = align === 'center'
  const Heading = level === 1 ? 'h1' : 'h2'

  return (
    <div className={cn(centered && 'mx-auto text-center', className)}>
      <Reveal>
        <span
          className={cn(
            'inline-flex items-center gap-3 text-[10px] font-medium uppercase tracking-label text-gold sm:text-[11px]',
            centered && 'justify-center',
          )}
        >
          <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
          {eyebrow}
          {centered && <span className="h-px w-8 bg-gold/60" aria-hidden="true" />}
        </span>
      </Reveal>

      <Reveal delay={80}>
        <Heading
          id={id}
          className={cn(
            'mt-5 font-display text-[clamp(2rem,4.6vw,3.65rem)] font-medium leading-[1.06] tracking-[-0.01em] text-cream',
            centered && 'mx-auto max-w-3xl',
          )}
        >
          {title}
        </Heading>
      </Reveal>

      {description && (
        <Reveal delay={150}>
          <p
            className={cn(
              'mt-5 max-w-xl text-[15px] leading-relaxed text-cream/60',
              centered && 'mx-auto',
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  )
}
