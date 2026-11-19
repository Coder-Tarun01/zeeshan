import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowLeft, MessageCircle, ShoppingBag, Truck } from 'lucide-react'
import { useBag } from '../components/order/BagContext'
import { SiteLayout } from '../components/layout/SiteLayout'
import { useMenu } from '../components/menu/MenuContext'
import { business } from '../data/site'
import { formatINR, lineAmount, subtotalOf } from '../lib/price'
import { checkoutWhatsAppUrl, type CustomerDetails } from '../lib/whatsapp'
import { normalizeMobile } from '../lib/phone'
import {
  validateAddressLine,
  validateEmail,
  validateLandmark,
  validateName,
  validatePhone,
  validatePincode,
  validatePlace,
} from '../lib/validation'
import { BAG_PATH, HOME_PATH, TERMS_PATH, navigate } from '../lib/router'
import { cn } from '../lib/cn'

interface FormValues {
  name: string
  email: string
  houseNumber: string
  city: string
  state: string
  pincode: string
  landmark: string
  mobile: string
  agree: boolean
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const EMPTY_FORM: FormValues = {
  name: '',
  email: '',
  houseNumber: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
  mobile: '',
  agree: false,
}

/** One validator per field — used for submit and for on-blur feedback. */
const FIELD_VALIDATORS: Record<keyof FormValues, (values: FormValues) => string | undefined> = {
  name: (values) => validateName(values.name),
  email: (values) => validateEmail(values.email),
  houseNumber: (values) => validateAddressLine(values.houseNumber),
  city: (values) => validatePlace(values.city, 'city'),
  state: (values) => validatePlace(values.state, 'state'),
  pincode: (values) => validatePincode(values.pincode),
  landmark: (values) => validateLandmark(values.landmark),
  mobile: (values) => validatePhone(values.mobile, true),
  agree: (values) => (values.agree ? undefined : 'Please accept the refund policy to continue'),
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  ;(Object.keys(FIELD_VALIDATORS) as (keyof FormValues)[]).forEach((field) => {
    const message = FIELD_VALIDATORS[field](values)
    if (message) errors[field] = message
  })

  return errors
}

interface TextFieldProps {
  id: keyof FormValues
  label: string
  placeholder: string
  value: string
  required?: boolean
  optional?: boolean
  error?: string
  type?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  autoComplete?: string
  maxLength?: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
}

function TextField({
  id,
  label,
  placeholder,
  value,
  required = false,
  optional = false,
  error,
  type = 'text',
  inputMode = 'text',
  autoComplete,
  maxLength,
  onChange,
  onBlur,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="label-caps">
        {label}
        {required && <span className="text-gold"> *</span>}
        {optional && <span className="normal-case tracking-normal"> (Optional)</span>}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'mt-2 w-full border bg-ink/60 px-4 py-3 text-sm text-cream placeholder:text-cream/25 transition-colors duration-300 focus:outline-none',
          error ? 'border-red-400/60 focus:border-red-400' : 'border-cream/15 focus:border-gold/60',
        )}
      />

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[11px] text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}

export function CheckoutPage() {
  const { items, count } = useBag()
  const { getByName } = useMenu()
  const [values, setValues] = useState<FormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [sentUrl, setSentUrl] = useState<string | null>(null)
  const totals = subtotalOf(items)
  const deliveryFree = totals.allPriced && totals.amount >= business.delivery.threshold

  /** Lines the kitchen has marked sold out since they were added. */
  const soldOutItems = items.filter((item) => {
    const menuItem = getByName(item.name)
    return Boolean(menuItem) && !menuItem?.available
  })
  const hasSoldOut = soldOutItems.length > 0

  useEffect(() => {
    const previousTitle = document.title
    document.title = `Checkout — ${business.name} ${business.signLine}`
    return () => {
      document.title = previousTitle
    }
  }, [])

  const updateField = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    if (field === 'agree') {
      setValues((current) => ({ ...current, agree: event.target.checked }))
      setErrors((current) => (current.agree ? { ...current, agree: undefined } : current))
      return
    }

    let value = event.target.value
    if (field === 'pincode') value = value.replace(/\D/g, '').slice(0, 6)
    if (field === 'mobile') value = value.replace(/[^\d+\s()-]/g, '').slice(0, 15)

    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
  }

  /** Feedback as soon as the customer leaves a field. */
  const handleBlur = (field: keyof FormValues) => () => {
    const message = FIELD_VALIDATORS[field](values)
    setErrors((current) => ({ ...current, [field]: message }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (hasSoldOut) return

    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      document.getElementById(Object.keys(nextErrors)[0])?.focus()
      return
    }

    const customer: CustomerDetails = {
      name: values.name,
      email: values.email,
      houseNumber: values.houseNumber,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
      landmark: values.landmark,
      mobile: normalizeMobile(values.mobile),
    }

    const url = checkoutWhatsAppUrl(items, customer)
    window.open(url, '_blank', 'noopener,noreferrer')
    setSentUrl(url)
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
              onClick={(event) => {
                event.preventDefault()
                navigate(HOME_PATH)
              }}
              className="transition-colors duration-300 hover:text-gold"
            >
              Home
            </a>
            <span className="mx-2 text-gold/40" aria-hidden="true">
              /
            </span>
            <a
              href="/bag"
              onClick={(event) => {
                event.preventDefault()
                navigate(BAG_PATH)
              }}
              className="transition-colors duration-300 hover:text-gold"
            >
              Order Bag
            </a>
            <span className="mx-2 text-gold/40" aria-hidden="true">
              /
            </span>
            <span className="text-cream/60">Checkout</span>
          </nav>

          <div className="mt-4">
            <p className="text-[9px] font-medium uppercase tracking-label text-gold">Almost There</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.1rem)] leading-none text-cream">
              Checkout
            </h1>
            <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-cream/45">
              Fill in your delivery details and press{' '}
              <span className="text-cream/70">Place Order</span> — your order opens in WhatsApp so
              we can confirm everything with you.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="mt-9 flex flex-col items-center justify-center border border-cream/10 bg-night/60 px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] text-gold">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-5 font-display text-[26px] leading-tight text-cream">
                Your bag is empty
              </p>
              <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-cream/50">
                Add a few items before checking out.
              </p>
              <button type="button" onClick={() => navigate(HOME_PATH)} className="btn-gold mt-6">
                Browse the Menu
              </button>
            </div>
          ) : (
            <div className="mt-9 grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:gap-6">
              <form
                noValidate
                onSubmit={handleSubmit}
                aria-labelledby="checkout-form-heading"
                className="border border-cream/10 bg-night/60 p-5 sm:p-7"
              >
                <h2 id="checkout-form-heading" className="font-display text-xl text-cream">
                  Delivery Details
                </h2>
                <p className="mt-1.5 text-[11.5px] text-cream/35">
                  Fields marked <span className="text-gold">*</span> are required.
                </p>

                {sentUrl && (
                  <div role="status" className="mt-5 border border-gold/40 bg-gold/[0.07] p-4">
                    <p className="text-[9.5px] uppercase tracking-[0.18em] text-gold">Order ready</p>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-cream/70">
                      WhatsApp opened with your order and delivery details. Press send there and we
                      will confirm availability, the total and delivery.
                    </p>
                    <a
                      href={sentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-gold transition-colors duration-300 hover:text-gold-light"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Open WhatsApp again
                    </a>
                  </div>
                )}

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <TextField
                      id="name"
                      label="Name"
                      placeholder="Enter your name"
                      required
                      autoComplete="name"
                      maxLength={60}
                      value={values.name}
                      error={errors.name}
                      onChange={updateField('name')}
                      onBlur={handleBlur('name')}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <TextField
                      id="email"
                      label="Email"
                      placeholder="Enter your email"
                      optional
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      maxLength={100}
                      value={values.email}
                      error={errors.email}
                      onChange={updateField('email')}
                      onBlur={handleBlur('email')}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <TextField
                      id="houseNumber"
                      label="H.No"
                      placeholder="Enter house number"
                      required
                      autoComplete="address-line1"
                      maxLength={80}
                      value={values.houseNumber}
                      error={errors.houseNumber}
                      onChange={updateField('houseNumber')}
                      onBlur={handleBlur('houseNumber')}
                    />
                  </div>

                  <TextField
                    id="city"
                    label="City"
                    placeholder="Enter city"
                    required
                    autoComplete="address-level2"
                    maxLength={40}
                    value={values.city}
                    error={errors.city}
                    onChange={updateField('city')}
                    onBlur={handleBlur('city')}
                  />

                  <TextField
                    id="state"
                    label="State"
                    placeholder="Enter state"
                    required
                    autoComplete="address-level1"
                    maxLength={40}
                    value={values.state}
                    error={errors.state}
                    onChange={updateField('state')}
                    onBlur={handleBlur('state')}
                  />

                  <TextField
                    id="pincode"
                    label="Pincode"
                    placeholder="Enter pincode"
                    required
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    value={values.pincode}
                    error={errors.pincode}
                    onChange={updateField('pincode')}
                    onBlur={handleBlur('pincode')}
                  />

                  <TextField
                    id="landmark"
                    label="Landmark"
                    placeholder="Enter landmark"
                    optional
                    autoComplete="address-line2"
                    maxLength={80}
                    value={values.landmark}
                    error={errors.landmark}
                    onChange={updateField('landmark')}
                    onBlur={handleBlur('landmark')}
                  />

                  <div className="sm:col-span-2">
                    <TextField
                      id="mobile"
                      label="Mob Number"
                      placeholder="Enter your mobile number"
                      required
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={15}
                      value={values.mobile}
                      error={errors.mobile}
                      onChange={updateField('mobile')}
                      onBlur={handleBlur('mobile')}
                    />
                  </div>
                </div>

                <div className="mt-6 border-t border-cream/10 pt-5">
                  <label
                    htmlFor="agree"
                    className="flex cursor-pointer items-start gap-3 text-[12.5px] leading-relaxed text-cream/60"
                  >
                    <input
                      id="agree"
                      name="agree"
                      type="checkbox"
                      checked={values.agree}
                      onChange={updateField('agree')}
                      aria-invalid={errors.agree ? true : undefined}
                      aria-describedby={errors.agree ? 'agree-error' : undefined}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-gold"
                    />
                    <span>
                      I agree to the{' '}
                      <a
                        href={`${TERMS_PATH}#cancellation`}
                        className="text-gold underline decoration-gold/40 underline-offset-2 transition-colors duration-300 hover:decoration-gold"
                      >
                        Refund Policy
                      </a>{' '}
                      and the shop&apos;s terms
                    </span>
                  </label>

                  {errors.agree && (
                    <p id="agree-error" className="mt-1.5 text-[11px] text-red-300">
                      {errors.agree}
                    </p>
                  )}

                  <button type="submit" disabled={hasSoldOut} className="btn-gold mt-5 w-full">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Place Order
                  </button>

                  {hasSoldOut && (
                    <p className="mt-3 border border-burgundy-light/40 bg-burgundy/20 px-4 py-3 text-[11.5px] leading-relaxed text-cream/75">
                      {soldOutItems.map((item) => item.name).join(', ')}{' '}
                      {soldOutItems.length === 1 ? 'is' : 'are'} sold out right now. Remove{' '}
                      {soldOutItems.length === 1 ? 'it' : 'them'} from your{' '}
                      <a
                        href={BAG_PATH}
                        className="text-gold underline decoration-gold/40 underline-offset-2"
                      >
                        order bag
                      </a>{' '}
                      to place the rest of your order.
                    </p>
                  )}

                  <p className="mt-3 text-center text-[11px] leading-relaxed text-cream/35">
                    Your order and delivery details open in WhatsApp — press send there and we
                    confirm availability, the total and delivery.
                  </p>
                </div>

              </form>

              <aside aria-label="Order summary" className="lg:sticky lg:top-[136px]">
                <div className="border border-gold/25 bg-night">
                  <div className="flex items-center justify-between gap-3 border-b border-cream/10 px-5 py-4">
                    <h2 className="font-display text-xl text-cream">Order Summary</h2>
                    <button
                      type="button"
                      onClick={() => navigate(BAG_PATH)}
                      className="text-[9px] uppercase tracking-[0.16em] text-gold/80 transition-colors duration-300 hover:text-gold"
                    >
                      Edit bag
                    </button>
                  </div>

                  <ul className="divide-y divide-cream/[0.08] px-5">
                    {items.map((item) => {
                      const amount = lineAmount(item.unitPrice, item.quantity)

                      return (
                        <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                          <div className="min-w-0">
                            <p className="text-[13px] leading-snug text-cream/85">{item.name}</p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-cream/35">
                              {item.unit === 'piece'
                                ? `${item.quantity} ${item.quantity === 1 ? 'piece' : 'pieces'}`
                                : `${item.quantity} × ${item.portion}`}
                            </p>
                          </div>
                          <span className="shrink-0 text-[13px] font-semibold text-cream/80">
                            {amount !== null ? formatINR(amount) : 'On ask'}
                          </span>
                        </li>
                      )
                    })}
                  </ul>

                  <div className="border-t border-cream/10 px-5 py-4">
                    <dl className="space-y-2.5 text-[12.5px]">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-cream/45">Items</dt>
                        <dd className="text-cream/80">{count}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-cream/45">Subtotal</dt>
                        <dd className="text-cream/80">
                          {totals.allPriced ? formatINR(totals.amount) : 'Confirmed on WhatsApp'}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-cream/45">Delivery</dt>
                        <dd className="text-gold/90">
                          {deliveryFree
                            ? 'Free'
                            : `Free above ${formatINR(business.delivery.threshold)}`}
                        </dd>
                      </div>
                    </dl>

                    <div className="my-4 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

                    <div className="flex items-baseline justify-between gap-3">
                      <span className="label-caps">Total Amount</span>
                      <span className="font-display text-[22px] leading-none text-cream">
                        {totals.allPriced ? formatINR(totals.amount) : 'Confirmed on WhatsApp'}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-cream/35">
                      {deliveryFree
                        ? 'Delivery is free on this order. We confirm the final amount on WhatsApp before any payment.'
                        : `Delivery is free above ${formatINR(business.delivery.threshold)}. We confirm the delivery charge and final amount on WhatsApp before any payment.`}
                    </p>

                    <div className="mt-4 flex items-start gap-3 border border-gold/30 bg-gold/[0.06] p-4">
                      <Truck className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                      <div>
                        <p className="font-display text-[18px] leading-tight text-cream">
                          {business.delivery.title}
                        </p>
                        <p className="mt-1 text-[11px] tracking-[0.04em] text-gold/90">
                          {business.delivery.note}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(BAG_PATH)}
                      className="btn-outline mt-4 w-full !px-5 !py-3.5 !text-[9.5px]"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      Back to Bag
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          )}
      </div>
    </SiteLayout>
  )
}
