import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Check, MessageCircle } from 'lucide-react'
import { contactWhatsAppUrl, type ContactEnquiry } from '../../lib/whatsapp'
import { normalizeMobile } from '../../lib/phone'
import {
  validateEmail,
  validateMessage,
  validateName,
  validatePhone,
} from '../../lib/validation'
import { cn } from '../../lib/cn'

interface FormValues {
  name: string
  phone: string
  email: string
  description: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const EMPTY_FORM: FormValues = { name: '', phone: '', email: '', description: '' }

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  const name = validateName(values.name)
  if (name) errors.name = name

  const phone = validatePhone(values.phone, false)
  if (phone) errors.phone = phone

  const email = validateEmail(values.email)
  if (email) errors.email = email

  const message = validateMessage(values.description, 10, 600)
  if (message) errors.description = message

  // At least one way to reply must be provided.
  if (!values.phone.trim() && !values.email.trim()) {
    errors.phone = 'Add a phone number or email so we can reply'
  }

  return errors
}

const fieldClass = (invalid?: string) =>
  cn(
    'mt-2 w-full border bg-ink/60 px-4 py-3 text-sm text-cream placeholder:text-cream/25 transition-colors duration-300 focus:outline-none',
    invalid ? 'border-red-400/60 focus:border-red-400' : 'border-cream/15 focus:border-gold/60',
  )

/** Contact-page form — sends the enquiry through WhatsApp. */
export function ContactForm() {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [sent, setSent] = useState(false)

  const update =
    (field: keyof FormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let value = event.target.value
      if (field === 'phone') value = value.replace(/[^\d+\s()-]/g, '').slice(0, 15)

      setValues((current) => ({ ...current, [field]: value }))
      setErrors((current) => {
        const next = { ...current }
        delete next[field]
        if (field === 'phone' || field === 'email') {
          delete next.phone
          delete next.email
        }
        return next
      })
      setSent(false)
    }

  /** Validate on blur so problems show up before pressing send. */
  const handleBlur = (field: keyof FormValues) => () => {
    const nextErrors = validate(values)
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      document.getElementById(`contact-${Object.keys(nextErrors)[0]}`)?.focus()
      return
    }

    const enquiry: ContactEnquiry = {
      name: values.name,
      phone: values.phone ? normalizeMobile(values.phone) : undefined,
      email: values.email,
      description: values.description,
    }

    window.open(contactWhatsAppUrl(enquiry), '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby="contact-form-title"
      className="border border-gold/20 bg-night p-5 sm:p-6"
    >
      <p className="text-[9px] font-medium uppercase tracking-label text-gold/80">Message Us</p>
      <h2 id="contact-form-title" className="mt-2 font-display text-2xl leading-tight text-cream">
        Send a Message
      </h2>
      <p className="mt-2 text-[12px] leading-relaxed text-cream/40">
        Fill this in and press send — your message opens in WhatsApp.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="contact-name" className="label-caps">
            Name <span className="text-gold">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            aria-required="true"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            value={values.name}
            onChange={update('name')}
            onBlur={handleBlur('name')}
            placeholder="Enter your name"
            maxLength={60}
            className={fieldClass(errors.name)}
          />
          {errors.name && (
            <p id="contact-name-error" className="mt-1.5 text-[11px] text-red-300">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-phone" className="label-caps">
            Phone Number
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={15}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
            value={values.phone}
            onChange={update('phone')}
            onBlur={handleBlur('phone')}
            placeholder="Enter your phone number"
            className={fieldClass(errors.phone)}
          />
          {errors.phone && (
            <p id="contact-phone-error" className="mt-1.5 text-[11px] text-red-300">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className="label-caps">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            value={values.email}
            onChange={update('email')}
            onBlur={handleBlur('email')}
            placeholder="Enter your email"
            maxLength={100}
            className={fieldClass(errors.email)}
          />
          {errors.email && (
            <p id="contact-email-error" className="mt-1.5 text-[11px] text-red-300">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-description" className="label-caps">
            Description <span className="text-gold">*</span>
          </label>
          <textarea
            id="contact-description"
            name="description"
            rows={4}
            aria-required="true"
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? 'contact-description-error' : undefined}
            value={values.description}
            onChange={update('description')}
            onBlur={handleBlur('description')}
            placeholder="Tell us what you need"
            maxLength={600}
            className={cn(fieldClass(errors.description), 'resize-none')}
          />
          {errors.description && (
            <p id="contact-description-error" className="mt-1.5 text-[11px] text-red-300">
              {errors.description}
            </p>
          )}
        </div>
      </div>

      <button type="submit" className="btn-gold mt-5 w-full">
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Send via WhatsApp
      </button>

      {sent ? (
        <p
          role="status"
          className="mt-3 flex items-center justify-center gap-2 text-center text-[11.5px] leading-relaxed text-gold"
        >
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Message ready — press send in WhatsApp.
        </p>
      ) : (
        <p className="mt-3 text-center text-[11px] leading-relaxed text-cream/35">
          We reply as soon as the kitchen is free.
        </p>
      )}
    </form>
  )
}
