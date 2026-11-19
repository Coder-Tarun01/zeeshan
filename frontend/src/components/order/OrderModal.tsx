import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useOrder } from './OrderContext'
import { useBag } from './BagContext'
import { useMenu } from '../menu/MenuContext'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import {
  defaultVariant,
  priceFor,
  unitSuffix,
  variantOptions,
  type Variant,
} from '../../data/menu'
import { formatINR } from '../../lib/price'
import { buildOrderMessage, buildWhatsAppUrl, isWhatsAppConfigured } from '../../lib/whatsapp'
import { BAG_PATH, navigate } from '../../lib/router'
import { cn } from '../../lib/cn'

export function OrderModal() {
  const { request, closeOrder } = useOrder()
  const { addItem } = useBag()
  const { getByName } = useMenu()
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [portion, setPortion] = useState<Variant>('250g')

  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  const open = Boolean(request)
  useLockBodyScroll(open)

  /* Reset the form whenever a new item is opened. */
  useEffect(() => {
    if (!request) return
    const menuItem = getByName(request.item)
    const fallback = menuItem ? defaultVariant(menuItem.pricing.unit) : undefined
    setQuantity(1)
    setNote('')
    setPortion(request.portion ?? fallback ?? '250g')
  }, [request, getByName])

  /* Focus management + Escape to close. */
  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    const timer = window.setTimeout(() => panelRef.current?.focus(), 40)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeOrder()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
      )
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
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [open, closeOrder])

  if (!request) return null

  const menuItem = getByName(request.item)
  const soldOut = Boolean(menuItem) && !menuItem?.available
  const unit = menuItem?.pricing.unit ?? 'piece'
  const choices = variantOptions(unit)
  const selectable = choices.length > 0
  const unitPrice = menuItem ? priceFor(menuItem, portion) : null
  const lineTotal = typeof unitPrice === 'number' ? unitPrice * quantity : null
  const quantityUnit =
    unit === 'piece'
      ? quantity === 1
        ? 'piece'
        : 'pieces'
      : unit === 'plate'
        ? quantity === 1
          ? 'plate'
          : 'plates'
        : quantity === 1
          ? 'portion'
          : 'portions'

  const message = buildOrderMessage({
    item: request.item,
    quantity,
    note,
    portion: selectable ? portion : undefined,
    unit,
    unitPrice,
    category: request.category,
  })
  const whatsappUrl = buildWhatsAppUrl(message)

  const addToBag = () => {
    if (soldOut) return

    addItem({
      name: request.item,
      category: request.category,
      unit,
      portion: selectable ? portion : undefined,
      unitPrice,
      note,
      quantity,
      image: request.image,
    })
    closeOrder()
    navigate(BAG_PATH)
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close order panel"
        onClick={closeOrder}
        className="absolute inset-0 cursor-default bg-coal/85 backdrop-blur-sm"
      />
      {/* panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
        tabIndex={-1}
        className="relative z-10 max-h-[92svh] w-full max-w-lg overflow-y-auto border border-gold/25 bg-night px-5 pb-7 pt-6 shadow-card no-scrollbar animate-fadeUp sm:px-8 sm:pb-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-label text-gold/80">
              WhatsApp Order
            </p>
            <h3
              id="order-modal-title"
              className="mt-3 font-display text-3xl leading-tight text-cream sm:text-[2rem]"
            >
              {request.item}
            </h3>
            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-cream/40">
              {request.category ?? 'ZEESHAN Menu'}
            </p>
          </div>

          <button
            type="button"
            onClick={closeOrder}
            aria-label="Close"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center border border-cream/15 text-cream/60 transition-colors duration-300 hover:border-gold/60 hover:text-gold"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 h-px w-full bg-gradient-to-r from-gold/40 via-gold/15 to-transparent" />

        <dl className="mt-5 flex items-center justify-between text-sm">
          <dt className="label-caps">Price</dt>
          <dd className="text-cream/75">
            {typeof unitPrice === 'number'
              ? `${formatINR(unitPrice)} per ${unitSuffix(unit, portion)}`
              : 'Confirmed on WhatsApp'}
          </dd>
        </dl>

        {soldOut && (
          <p
            role="status"
            className="mt-4 border border-burgundy-light/40 bg-burgundy/20 px-4 py-3 text-[12px] leading-relaxed text-cream/75"
          >
            Sold out right now — message us on WhatsApp and we will tell you when it is back.
          </p>
        )}

        {selectable && (
          <div className="mt-6">
            <p className="label-caps" id="order-portion-label">
              {unit === 'plate' ? 'Plate size' : 'Weight'}
            </p>
            <div role="group" aria-labelledby="order-portion-label" className="mt-2 flex gap-2">
              {choices.map((choice) => {
                const isActive = choice === portion
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setPortion(choice)}
                    aria-pressed={isActive}
                    className={cn(
                      'flex-1 border px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all duration-300',
                      isActive
                        ? 'border-gold bg-gold text-ink'
                        : 'border-cream/15 text-cream/55 hover:border-gold/50 hover:text-cream',
                    )}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="label-caps" htmlFor="order-quantity">
            Quantity
          </label>
          <div className="mt-2 flex items-center gap-3">
            <div className="inline-flex items-center border border-cream/15">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="flex h-11 w-11 items-center justify-center text-cream/70 transition-colors duration-200 hover:bg-gold/10 hover:text-gold"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <input
                id="order-quantity"
                type="text"
                inputMode="numeric"
                value={quantity}
                onChange={(event) => {
                  const parsed = Number.parseInt(event.target.value.replace(/\D/g, ''), 10)
                  setQuantity(Number.isNaN(parsed) ? 1 : Math.min(99, Math.max(1, parsed)))
                }}
                className="h-11 w-12 border-x border-cream/15 bg-transparent text-center text-sm text-cream outline-none"
              />
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                className="flex h-11 w-11 items-center justify-center text-cream/70 transition-colors duration-200 hover:bg-gold/10 hover:text-gold"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <span className="text-[11px] uppercase tracking-[0.16em] text-cream/35">
              {quantityUnit === 'piece' || quantityUnit === 'pieces'
                ? 'Pieces'
                : quantityUnit === 'plate' || quantityUnit === 'plates'
                  ? 'Plates'
                  : 'Portions'}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <label className="label-caps" htmlFor="order-note">
            Any request? <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id="order-note"
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, 160))}
            rows={2}
            placeholder="Extra spicy, less oil, pickup time…"
            className="mt-2 w-full resize-none border border-cream/15 bg-ink/60 px-4 py-3 text-sm text-cream placeholder:text-cream/25 focus:border-gold/60 focus:outline-none"
          />
        </div>

        {lineTotal !== null && (
          <dl className="mt-6 flex items-baseline justify-between border-t border-cream/10 pt-4">
            <dt className="label-caps">Estimated total</dt>
            <dd className="font-display text-2xl leading-none text-cream">{formatINR(lineTotal)}</dd>
          </dl>
        )}

        <button type="button" onClick={addToBag} disabled={soldOut} className="btn-gold mt-5 w-full">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          {soldOut ? 'Sold out' : `Add to Bag — ${quantity} ${quantityUnit}`}
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeOrder}
          className="mt-4 flex items-center justify-center gap-2 text-[9.5px] uppercase tracking-[0.16em] text-cream/45 transition-colors duration-300 hover:text-gold"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Order this item on WhatsApp instead
        </a>

        <p className="mt-4 border-t border-cream/10 pt-3 text-center text-[11px] leading-relaxed text-cream/35">
          {isWhatsAppConfigured
            ? 'We confirm availability and the final total on WhatsApp.'
            : 'Your order is prepared for you. Choose ZEESHAN in WhatsApp to send it.'}
        </p>
      </div>
    </div>
  )
}
