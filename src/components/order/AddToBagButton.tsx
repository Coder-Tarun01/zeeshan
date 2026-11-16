import { useEffect, useRef, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { useBag } from './BagContext'
import type { SiteImage } from '../../data/images'
import { DEFAULT_PORTION, type Portion } from '../../data/menu'
import { cn } from '../../lib/cn'

type Variant = 'outline' | 'solid' | 'text' | 'chip' | 'icon'

interface AddToBagButtonProps {
  item: string
  category?: string
  price?: string | null
  image?: SiteImage
  /** Weight added to the order list (defaults to 250g). */
  portion?: Portion
  /** Label override for the idle state, e.g. "Add" or the item name. */
  label?: string
  variant?: Variant
  className?: string
}

const base =
  'inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold uppercase tracking-[0.18em] transition-all duration-300 disabled:cursor-not-allowed'

const variants: Record<Variant, string> = {
  outline:
    'border border-gold/35 px-3.5 py-2.5 text-[9px] text-gold hover:border-gold hover:bg-gold hover:text-ink',
  solid:
    'bg-gold-sheen px-4 py-2.5 text-[9px] text-ink shadow-gold hover:brightness-110 hover:shadow-gold-strong',
  text: 'px-1 py-2 text-[9px] text-gold/85 hover:text-gold-light',
  chip: 'border border-cream/20 bg-coal/40 px-3 py-2 text-[9.5px] text-cream/75 backdrop-blur-sm hover:border-gold hover:bg-gold hover:text-ink',
  icon: 'h-8 w-8 border border-cream/15 text-cream/50 hover:border-gold/60 hover:text-gold',
}

const addedStyles: Record<Variant, string> = {
  outline: 'border-gold bg-gold text-ink',
  solid: 'brightness-110',
  text: 'text-gold-light',
  chip: 'border-gold bg-gold text-ink',
  icon: 'border-gold bg-gold text-ink',
}

/**
 * One-tap "add to order list" control used on every menu card, speciality card,
 * category chip and footer row. Shows a short "Added" confirmation in place.
 */
export function AddToBagButton({
  item,
  category,
  price,
  image,
  portion = DEFAULT_PORTION,
  label,
  variant = 'outline',
  className,
}: AddToBagButtonProps) {
  const { addItem } = useBag()
  const [added, setAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const handleClick = () => {
    addItem({ name: item, category, price: price ?? null, portion, image, quantity: 1 })
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1600)
  }

  const isIcon = variant === 'icon'

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        added
          ? `${item} ${portion} added to your order list`
          : `Add ${item} ${portion} to your order list`
      }
      className={cn(base, variants[variant], added && addedStyles[variant], className)}
    >
      {added ? (
        <Check className={isIcon ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden="true" />
      ) : (
        <Plus className={isIcon ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden="true" />
      )}
      {!isIcon && <span>{added && !label ? 'Added' : (label ?? 'Add')}</span>}
    </button>
  )
}
