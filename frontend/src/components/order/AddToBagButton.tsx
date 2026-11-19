import { useEffect, useRef, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { useBag } from './BagContext'
import { useMenu } from '../menu/MenuContext'
import type { SiteImage } from '../../data/images'
import { defaultVariant, priceFor, unitSuffix, type Variant } from '../../data/menu'
import { cn } from '../../lib/cn'

type ButtonVariant = 'outline' | 'solid' | 'text' | 'chip' | 'icon'

interface AddToBagButtonProps {
  item: string
  category?: string
  image?: SiteImage
  /** Weight or plate size for by-size items (defaults to 250g / full). Ignored per piece. */
  portion?: Variant
  /** Label override for the idle state, e.g. "Add" or the item name. */
  label?: string
  variant?: ButtonVariant
  className?: string
}

const base =
  'inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold uppercase tracking-[0.18em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40'

const variants: Record<ButtonVariant, string> = {
  outline:
    'border border-gold/35 px-3.5 py-2.5 text-[9px] text-gold hover:border-gold hover:bg-gold hover:text-ink',
  solid:
    'bg-gold-sheen px-4 py-2.5 text-[9px] text-ink shadow-gold hover:brightness-110 hover:shadow-gold-strong',
  text: 'px-1 py-2 text-[9px] text-gold/85 hover:text-gold-light',
  chip: 'border border-cream/20 bg-coal/40 px-3 py-2 text-[9.5px] text-cream/75 backdrop-blur-sm hover:border-gold hover:bg-gold hover:text-ink',
  icon: 'h-8 w-8 border border-cream/15 text-cream/50 hover:border-gold/60 hover:text-gold',
}

const addedStyles: Record<ButtonVariant, string> = {
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
  image,
  portion,
  label,
  variant: buttonVariant = 'outline',
  className,
}: AddToBagButtonProps) {
  const { addItem } = useBag()
  const { getByName } = useMenu()
  const [added, setAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const menuItem = getByName(item)
  const soldOut = Boolean(menuItem) && !menuItem?.available
  const unavailable = !menuItem || soldOut
  const unit = menuItem?.pricing.unit ?? 'piece'
  const selectedPortion = unit === 'piece' ? undefined : (portion ?? defaultVariant(unit))
  const unitPrice = menuItem ? priceFor(menuItem, selectedPortion) : null
  const unitLabel = unit === 'piece' ? '1 piece' : unitSuffix(unit, selectedPortion)

  const handleClick = () => {
    if (unavailable) return

    addItem({
      name: item,
      category,
      unit,
      portion: selectedPortion,
      unitPrice,
      image,
      quantity: 1,
    })
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1600)
  }

  const isIcon = buttonVariant === 'icon'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={unavailable}
      aria-label={
        soldOut
          ? `${item} is sold out`
          : unavailable
            ? `${item} is not on the menu right now`
            : added
              ? `${item} ${unitLabel} added to your order list`
              : `Add ${item} ${unitLabel} to your order list`
      }
      className={cn(base, variants[buttonVariant], added && addedStyles[buttonVariant], className)}
    >
      {added ? (
        <Check className={isIcon ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden="true" />
      ) : (
        <Plus className={isIcon ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden="true" />
      )}
      {!isIcon && <span>{soldOut ? 'Sold out' : added && !label ? 'Added' : (label ?? 'Add')}</span>}
    </button>
  )
}

