import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowLeft, MessageCircle, ShoppingBag, Truck } from 'lucide-react'
import { useBag } from '../components/order/BagContext'
import { Footer } from '../components/layout/Footer'
import { PageHeader } from '../components/layout/PageHeader'
import { business } from '../data/site'
import { checkoutWhatsAppUrl, type CustomerDetails } from '../lib/whatsapp'
import { BAG_PATH, HOME_PATH, navigate } from '../lib/router'
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const digitsOnly = (value: string) => value.replace(/\D/g, '')

/** Accepts "+91 70363 69022", "07036369022" or a plain 10-digit number. */
const normalizeMobile = (value: string) => {
  const digits = digitsOnly(value)
  if (digits.length > 10 && digits.startsWith('91')) return digits.slice(-10)
  return digits.length > 10 ? digits.slice(-10) : digits
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.name.trim()) errors.name = 'Enter your name'
  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address'
  }
  if (!values.city.trim()) errors.city = 'Enter your city'
  if (!values.state.trim()) errors.state = 'Enter your state'
  if (!/^\d{6}$/.test(values.pincode.trim())) errors.pincode = 'Enter a 6-digit pincode'
  if (!/^[6-9]\d{9}$/.test(normalizeMobile(values.mobile))) {
    errors.mobile = 'Enter a valid 10-digit mobile number'
  }
  if (!values.agree) errors.agree = 'Please accept the refund policy to continue'

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
  const [values, setValues] = useState<FormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [sentUrl, setSentUrl] = useState<string | null>(null)

  useEffect(() => {
    const previousTitle = document.title
    document.title = `Checkout — ${business.name} ${business.signLine}`
    return () => {
      document.title = previousTitle
    }
  }, [])

  const updateField = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'agree' ? event.target.checked : event.target.value
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

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
    <div className="min-h-screen bg-ink">
      <PageHeader backLabel="Back to Bag" onBack={() => navigate(BAG_PATH)} />

      <main id="main" className="pb-20 pt-[104px] sm:pt-[120px]">
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
                      value={values.name}
                      error={errors.name}
                      onChange={updateField('name')}
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
                      value={values.email}
                      error={errors.email}
                      onChange={updateField('email')}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <TextField
                      id="houseNumber"
                      label="H.No"
                      placeholder="Enter house number"
                      autoComplete="address-line1"
                      value={values.houseNumber}
                      error={errors.houseNumber}
                      onChange={updateField('houseNumber')}
                    />
                  </div>

                  <TextField
                    id="city"
                    label="City"
                    placeholder="Enter city"
                    required
                    autoComplete="address-level2"
                    value={values.city}
                    error={errors.city}
                    onChange={updateField('city')}
                  />

                  <TextField
                    id="state"
                    label="State"
                    placeholder="Enter state"
                    required
                    autoComplete="address-level1"
                    value={values.state}
                    error={errors.state}
                    onChange={updateField('state')}
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
                  />

                  <TextField
                    id="landmark"
                    label="Landmark"
                    placeholder="Enter landmark"
                    autoComplete="address-line2"
                    value={values.landmark}
                    error={errors.landmark}
                    onChange={updateField('landmark')}
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
                      I agree to the <span className="text-gold">Refund Policy</span>
                    </span>
                  </label>

                  {errors.agree && (
                    <p id="agree-error" className="mt-1.5 text-[11px] text-red-300">
                      {errors.agree}
                    </p>
                  )}

                  <button type="submit" className="btn-gold mt-5 w-full">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Place Order
                  </button>

                  <p className="mt-3 text-center text-[11px] leading-relaxed text-cream/35">
                    Your order and delivery details open in WhatsApp — press send there and we
                    confirm availability, the total and delivery.
                  </p>
                </div>

              </form>

              <aside aria-label="Order summary" className="lg:sticky lg:top-[104px]">
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
                    {items.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="text-[13px] leading-snug text-cream/85">{item.name}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-cream/35">
                            {item.quantity} &times; {item.portion}
                          </p>
                        </div>
                        <span className="shrink-0 text-[9.5px] uppercase tracking-[0.14em] text-cream/45">
                          {item.price ?? 'Price on ask'}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-cream/10 px-5 py-4">
                    <dl className="space-y-2.5 text-[12.5px]">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-cream/45">Items</dt>
                        <dd className="text-cream/80">{count}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-cream/45">Delivery</dt>
                        <dd className="text-gold/90">Free above &#8377;1000</dd>
                      </div>
                    </dl>

                    <div className="my-4 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

                    <div className="flex items-baseline justify-between gap-3">
                      <span className="label-caps">Total Amount</span>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-cream/75">
                        Confirmed on WhatsApp
                      </span>
                    </div>

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
      </main>

      <Footer />
    </div>
  )
}
