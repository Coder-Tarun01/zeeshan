import { useEffect, type MouseEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react'
import { useBag } from '../components/order/BagContext'
import { SiteLayout } from '../components/layout/SiteLayout'
import { SmartImage } from '../components/ui/SmartImage'
import { useMenu } from '../components/menu/MenuContext'
import { PORTIONS, type Portion } from '../data/menu'
import { business } from '../data/site'
import { formatINR, lineAmount, subtotalOf } from '../lib/price'
import { buildBagMessage } from '../lib/whatsapp'
import { CHECKOUT_PATH, HOME_PATH, MENU_PATH, navigate } from '../lib/router'

/** Line price, or the "Price on ask" fallback when the item is not priced. */
function LineAmount({ unitPrice, quantity }: { unitPrice: number | null; quantity: number }) {
  const amount = lineAmount(unitPrice, quantity)
  return <>{amount !== null ? formatINR(amount) : 'Price on ask'}</>
}

export function BagPage() {
  const { items, count, updateQuantity, changePortion, removeItem, clearBag } = useBag()
  const { getByName } = useMenu()
  const messagePreview = buildBagMessage(items)
  const totals = subtotalOf(items)
  const deliveryFree = totals.allPriced && totals.amount >= business.delivery.threshold

  /** A line whose item the kitchen has marked sold out. */
  const isSoldOut = (name: string) => {
    const menuItem = getByName(name)
    return Boolean(menuItem) && !menuItem?.available
  }
  const hasSoldOut = items.some((item) => isSoldOut(item.name))

  useEffect(() => {
    const previousTitle = document.title
    document.title = `Order Bag — ${business.name} ${business.signLine}`
    return () => {
      document.title = previousTitle
    }
  }, [])

  const continueShopping = () => {
    navigate(MENU_PATH)
  }

  const goHome = (event: MouseEvent) => {
    event.preventDefault()
    navigate(HOME_PATH)
  }

  return (
    <SiteLayout
      mainClassName="pb-20 pt-[136px] sm:pt-[152px]"
      withFloatingActions={false}
    >
      <div className="container-page">
          <nav
            aria-label="Breadcrumb"
            className="text-[9px] uppercase tracking-[0.2em] text-cream/35"
          >
            <a
              href="/"
              onClick={goHome}
              className="transition-colors duration-300 hover:text-gold"
            >
              Home
            </a>
            <span className="mx-2 text-gold/40" aria-hidden="true">
              /
            </span>
            <span className="text-cream/60">Order Bag</span>
          </nav>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-label text-gold">Your Order</p>
              <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.1rem)] leading-none text-cream">
                Order Bag
              </h1>
            </div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-cream/40" aria-live="polite">
              {count === 0 ? 'No items yet' : `${count} item${count === 1 ? '' : 's'} in your bag`}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center border border-cream/10 bg-night/60 px-6 py-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] text-gold">
                <ShoppingBag className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-6 font-display text-[28px] leading-tight text-cream">
                Your bag is empty
              </p>
              <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-cream/50">
                Add chicken specialities from the menu — Chicken Pakodi by weight, the rest by the
                piece — and send the whole order in one WhatsApp message.
              </p>
              <button type="button" onClick={continueShopping} className="btn-gold mt-7">
                Browse the Menu
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 lg:grid-cols-[1.55fr_1fr] lg:items-start lg:gap-6">
              <section
                aria-label="Items in your order bag"
                className="border border-cream/10 bg-night/60"
              >
                <div className="flex items-center justify-between gap-4 border-b border-cream/10 px-5 py-4 sm:px-6">
                  <h2 className="font-display text-xl text-cream">Your Items</h2>
                  <button
                    type="button"
                    onClick={clearBag}
                    className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-cream/35 transition-colors duration-300 hover:text-burgundy-light"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Clear bag
                  </button>
                </div>

                <ul className="divide-y divide-cream/[0.08]">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 p-5 sm:gap-5 sm:p-6">
                      {item.image ? (
                        <SmartImage
                          image={item.image}
                          className="h-20 w-20 shrink-0 border border-cream/10 sm:h-24 sm:w-24"
                        />
                      ) : (
                        <span className="flex h-20 w-20 shrink-0 items-center justify-center border border-cream/10 bg-ink text-gold/60 sm:h-24 sm:w-24">
                          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-display text-[21px] leading-tight text-cream">
                              {item.name}
                            </h3>
                            {isSoldOut(item.name) && (
                              <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-burgundy-light">
                                Sold out — remove to continue
                              </p>
                            )}
                            {item.category && (
                              <p className="mt-1 text-[8.5px] uppercase tracking-[0.16em] text-cream/35">
                                {item.category}
                              </p>
                            )}
                            {item.note && (
                              <p className="mt-1.5 text-[11.5px] italic leading-relaxed text-gold/70">
                                “{item.note}”
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <span className="text-[14px] font-semibold text-cream">
                              <LineAmount unitPrice={item.unitPrice} quantity={item.quantity} />
                            </span>
                            {typeof item.unitPrice === 'number' && (
                              <span className="text-[9.5px] uppercase tracking-[0.14em] text-cream/40">
                                {formatINR(item.unitPrice)}
                                {item.unit === 'piece' ? ' / piece' : ` / ${item.portion}`}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.name} from bag`}
                              className="text-cream/30 transition-colors duration-300 hover:text-burgundy-light"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center border border-cream/15">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="flex h-9 w-9 items-center justify-center text-cream/60 transition-colors duration-200 hover:bg-gold/10 hover:text-gold"
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <span className="w-10 border-x border-cream/15 text-center text-[13px] text-cream">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label={`Increase quantity of ${item.name}`}
                              className="flex h-9 w-9 items-center justify-center text-cream/60 transition-colors duration-200 hover:bg-gold/10 hover:text-gold"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>

                          {item.unit === 'weight' ? (
                            <>
                              <label className="sr-only" htmlFor={`portion-${item.id}`}>
                                Weight for {item.name}
                              </label>
                              <select
                                id={`portion-${item.id}`}
                                value={item.portion ?? ''}
                                onChange={(event) =>
                                  changePortion(item.id, event.target.value as Portion)
                                }
                                className="h-9 cursor-pointer border border-cream/15 bg-ink px-2.5 text-[9.5px] uppercase tracking-[0.12em] text-cream/70 outline-none transition-colors duration-300 hover:border-gold/40 focus:border-gold/60"
                              >
                                {PORTIONS.map((size) => (
                                  <option key={size} value={size} className="bg-night text-cream">
                                    {size}
                                  </option>
                                ))}
                              </select>
                            </>
                          ) : (
                            <span className="inline-flex h-9 items-center border border-cream/15 px-2.5 text-[9.5px] uppercase tracking-[0.12em] text-cream/45">
                              Per piece
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <aside aria-label="Order summary" className="lg:sticky lg:top-[136px]">
                <div className="border border-gold/25 bg-night">
                  <div className="border-b border-cream/10 px-5 py-4 sm:px-6">
                    <h2 className="font-display text-xl text-cream">Order Summary</h2>
                  </div>

                  <div className="px-5 py-5 sm:px-6">
                    <dl className="space-y-3 text-[13px]">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-cream/45">Items</dt>
                        <dd className="text-cream/80">{count}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-cream/45">Subtotal</dt>
                        <dd className="text-cream/80">
                          {totals.allPriced ? formatINR(totals.amount) : 'Confirmed on WhatsApp'}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-cream/45">Delivery</dt>
                        <dd className="text-gold/90">
                          {deliveryFree
                            ? 'Free'
                            : `Free above ${formatINR(business.delivery.threshold)}`}
                        </dd>
                      </div>
                    </dl>

                    <div className="my-4 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

                    <div className="flex items-baseline justify-between gap-4">
                      <span className="label-caps">Total Amount</span>
                      <span className="font-display text-[24px] leading-none text-cream">
                        {totals.allPriced ? formatINR(totals.amount) : 'Confirmed on WhatsApp'}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-cream/35">
                      {deliveryFree
                        ? 'Delivery is free on this order. We confirm the final amount on WhatsApp before any payment.'
                        : `Delivery is free above ${formatINR(business.delivery.threshold)}. We confirm the delivery charge and final amount on WhatsApp before any payment.`}
                    </p>

                    <div className="mt-5 flex items-start gap-3 border border-gold/30 bg-gold/[0.06] p-4">
                      <Truck className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                      <div>
                        <p className="font-display text-[19px] leading-tight text-cream">
                          {business.delivery.title}
                        </p>
                        <p className="mt-1 text-[11px] tracking-[0.04em] text-gold/90">
                          {business.delivery.note}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(CHECKOUT_PATH)}
                      disabled={hasSoldOut}
                      className="btn-gold mt-5 w-full"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      Proceed to Checkout
                    </button>
                    {hasSoldOut && (
                      <p className="mt-2 text-center text-[11px] leading-relaxed text-burgundy-light">
                        One of your items is sold out — remove it and we can take the rest of your
                        order.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={continueShopping}
                      className="btn-outline mt-3 w-full"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      Continue Shopping
                    </button>

                    <p className="mt-3 flex items-start justify-center gap-2 text-center text-[11px] leading-relaxed text-cream/35">
                      <ShieldCheck
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70"
                        aria-hidden="true"
                      />
                      <span>
                        Next step: add your delivery details, then the order opens in WhatsApp for
                        confirmation.
                      </span>
                    </p>

                    <details className="mt-4 border-t border-cream/10 pt-4">
                      <summary className="cursor-pointer text-[9.5px] uppercase tracking-[0.16em] text-cream/40 transition-colors duration-300 hover:text-gold">
                        What will be sent
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap text-[11.5px] leading-relaxed text-cream/45">
                        {messagePreview}
                      </p>
                    </details>
                  </div>
                </div>
              </aside>
            </div>
          )}
      </div>
    </SiteLayout>
  )
}
