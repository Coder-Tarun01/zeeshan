import { useId, useState, type FormEvent } from 'react'
import { Check, X } from 'lucide-react'
import type { SiteImage } from '../../data/images'
import type {
  MenuCategory,
  MenuItem,
  MenuPricing,
  PlateSize,
  Portion,
  PriceUnit,
} from '../../data/menu'
import { PLATE_SIZES, SOLD_BY_OPTIONS, unitSuffix } from '../../data/menu'
import type { MenuItemDraft } from '../menu/MenuContext'
import { ImageUploadField } from './ImageUploadField'
import { menuImageOptions } from '../../lib/menuStore'
import { formatINR } from '../../lib/price'
import { cn } from '../../lib/cn'

interface ItemFormProps {
  /** Item being edited; omitted when adding a new one. */
  initial?: MenuItem
  /** Categories created in the panel — the only valid values for the field. */
  categories: MenuCategory[]
  /** Names already on the menu (excluding this item) — used for the duplicate check. */
  takenNames: string[]
  onSubmit: (draft: MenuItemDraft) => boolean
  onCancel: () => void
}

const inputClass =
  'mt-1.5 w-full border border-cream/15 bg-ink/60 px-3.5 py-2.5 text-[13px] text-cream placeholder:text-cream/25 focus:border-gold/60 focus:outline-none'

const labelClass = 'text-[9px] font-medium uppercase tracking-[0.18em] text-cream/45'

const defaultWeightPrices: Record<Portion, string> = { '100g': '', '250g': '', '500g': '' }
const defaultPlatePrices: Record<PlateSize, string> = { full: '', half: '' }

/** Prices arrive as strings from the inputs and are parsed on submit. */
function parsePrice(value: string): number | null {
  const price = Math.round(Number(value.replace(/[^\d]/g, '')))
  return Number.isFinite(price) && price > 0 ? price : null
}

export function ItemForm({ initial, categories, takenNames, onSubmit, onCancel }: ItemFormProps) {
  const fieldId = useId()

  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? categories[0]?.id ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [unit, setUnit] = useState<PriceUnit>(initial?.pricing.unit ?? 'piece')
  const [unitPrice, setUnitPrice] = useState(
    initial?.pricing.unit === 'piece' ? String(initial.pricing.price) : '',
  )
  const [weightPrices, setWeightPrices] = useState<Record<Portion, string>>(
    initial?.pricing.unit === 'weight'
      ? {
          '100g': String(initial.pricing.prices['100g']),
          '250g': String(initial.pricing.prices['250g']),
          '500g': String(initial.pricing.prices['500g']),
        }
      : defaultWeightPrices,
  )
  const [platePrices, setPlatePrices] = useState<Record<PlateSize, string>>(
    initial?.pricing.unit === 'plate'
      ? {
          full: String(initial.pricing.prices.full),
          half: String(initial.pricing.prices.half),
        }
      : defaultPlatePrices,
  )
  const [image, setImage] = useState<SiteImage>(initial?.image ?? menuImageOptions[0].image)
  const [tag, setTag] = useState(initial?.tag ?? '')
  const [available, setAvailable] = useState(initial?.available ?? true)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = name.trim()

    if (trimmed.length < 2) {
      setError('Give the item a name (at least 2 characters).')
      return
    }

    const duplicate = takenNames.some(
      (taken) => taken.trim().toLowerCase() === trimmed.toLowerCase(),
    )
    if (duplicate) {
      setError('That name is already on the menu — pick a different one.')
      return
    }

    let pricing: MenuPricing
    if (unit === 'weight') {
      const prices = {} as Record<Portion, number>
      for (const portion of ['100g', '250g', '500g'] as Portion[]) {
        const price = parsePrice(weightPrices[portion])
        if (price === null) {
          setError(`Enter a price for ${portion}.`)
          return
        }
        prices[portion] = price
      }
      pricing = { unit: 'weight', prices }
    } else if (unit === 'plate') {
      const prices = {} as Record<PlateSize, number>
      for (const size of PLATE_SIZES) {
        const price = parsePrice(platePrices[size])
        if (price === null) {
          setError(`Enter the ${size} plate price.`)
          return
        }
        prices[size] = price
      }
      pricing = { unit: 'plate', prices }
    } else {
      const price = parsePrice(unitPrice)
      if (price === null) {
        setError('Enter the price per piece.')
        return
      }
      pricing = { unit: 'piece', price }
    }

    const saved = onSubmit({
      name: trimmed,
      category,
      description,
      pricing,
      image,
      tag,
      available,
    })

    if (!saved) {
      setError('Could not save this item — the name may already be used.')
      return
    }

    setError(null)
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border border-gold/30 bg-night p-5 sm:p-7"
      aria-label={initial ? `Edit ${initial.name}` : 'Add a menu item'}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-label text-gold">
            {initial ? 'Editing' : 'New item'}
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight text-cream">
            {initial ? initial.name : 'Add a dish'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close the editor"
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-cream/15 text-cream/60 transition-colors duration-300 hover:border-gold/60 hover:text-gold"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`${fieldId}-name`}>
            Item name <span className="text-gold">*</span>
          </label>
          <input
            id={`${fieldId}-name`}
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, 48))}
            placeholder="e.g. Chicken 65"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${fieldId}-category`}>
            Category
          </label>
          <select
            id={`${fieldId}-category`}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={cn(inputClass, 'cursor-pointer')}
          >
            {categories.map((option) => (
              <option key={option.id} value={option.id} className="bg-night text-cream">
                {option.label}
              </option>
            ))}
            {category !== '' && !categories.some((option) => option.id === category) && (
              <option value={category} className="bg-night text-cream">
                {category} (not in the list)
              </option>
            )}
            {categories.length === 0 && (
              <option value="" className="bg-night text-cream">
                Add a category first
              </option>
            )}
          </select>
          <p className="mt-1.5 text-[10.5px] text-cream/30">
            Create or rename categories in the panel above.
          </p>
        </div>

        <div className="sm:col-span-2">
          <span className={labelClass}>Sold by</span>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {SOLD_BY_OPTIONS.map((option) => {
              const isActive = unit === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setUnit(option.id)}
                  aria-pressed={isActive}
                  title={option.description}
                  className={cn(
                    'border px-2 py-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] transition-all duration-300',
                    isActive
                      ? 'border-gold bg-gold text-ink'
                      : 'border-cream/15 text-cream/60 hover:border-gold/50 hover:text-cream',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          <p className="mt-1.5 text-[10.5px] text-cream/30">
            {(SOLD_BY_OPTIONS.find((option) => option.id === unit) ?? SOLD_BY_OPTIONS[0]).description}
          </p>
        </div>

        {unit === 'weight' ? (
          <div className="sm:col-span-2">
            <span className={labelClass}>Price per weight (₹) *</span>
            <div className="mt-1.5 grid gap-3 sm:grid-cols-3">
              {(['100g', '250g', '500g'] as Portion[]).map((portion) => (
                <div key={portion}>
                  <label
                    className="text-[9px] uppercase tracking-[0.16em] text-cream/35"
                    htmlFor={`${fieldId}-${portion}`}
                  >
                    {portion}
                  </label>
                  <input
                    id={`${fieldId}-${portion}`}
                    value={weightPrices[portion]}
                    onChange={(event) =>
                      setWeightPrices((current) => ({
                        ...current,
                        [portion]: event.target.value.replace(/[^\d]/g, '').slice(0, 6),
                      }))
                    }
                    inputMode="numeric"
                    placeholder="0"
                    className={cn(inputClass, 'mt-1')}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : unit === 'plate' ? (
          <div className="sm:col-span-2">
            <span className={labelClass}>Full / half prices (₹) *</span>
            <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
              {PLATE_SIZES.map((size) => (
                <div key={size}>
                  <label
                    className="text-[9px] uppercase tracking-[0.16em] text-cream/35"
                    htmlFor={`${fieldId}-${size}`}
                  >
                    {size}
                  </label>
                  <input
                    id={`${fieldId}-${size}`}
                    value={platePrices[size]}
                    onChange={(event) =>
                      setPlatePrices((current) => ({
                        ...current,
                        [size]: event.target.value.replace(/[^\d]/g, '').slice(0, 6),
                      }))
                    }
                    inputMode="numeric"
                    placeholder="0"
                    className={cn(inputClass, 'mt-1')}
                  />
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-cream/30">
              Customers pick <span className="text-cream/50">Full</span> or{' '}
              <span className="text-cream/50">Half</span> on the card, exactly like the weight
              options.
            </p>
          </div>
        ) : (
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor={`${fieldId}-unit-price`}>
              Price per piece (₹) <span className="text-gold">*</span>
            </label>
            <input
              id={`${fieldId}-unit-price`}
              value={unitPrice}
              onChange={(event) =>
                setUnitPrice(event.target.value.replace(/[^\d]/g, '').slice(0, 6))
              }
              inputMode="numeric"
              placeholder="0"
              className={inputClass}
            />
            {parsePrice(unitPrice) !== null && (
              <p className="mt-1.5 text-[11px] text-cream/30">
                Shows as {formatINR(parsePrice(unitPrice) as number)} /{' '}
                {unitSuffix(unit)}
              </p>
            )}
          </div>
        )}

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor={`${fieldId}-description`}>
            Description <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id={`${fieldId}-description`}
            value={description}
            onChange={(event) => setDescription(event.target.value.slice(0, 200))}
            rows={2}
            placeholder="One short line shown on the menu card."
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        <div>
          <ImageUploadField image={image} onChange={setImage} />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${fieldId}-tag`}>
            Badge <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id={`${fieldId}-tag`}
            value={tag}
            onChange={(event) => setTag(event.target.value.slice(0, 24))}
            placeholder="e.g. Signature"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={() => setAvailable((value) => !value)}
            role="switch"
            aria-checked={available}
            className={cn(
              'inline-flex items-center gap-3 border px-4 py-3 text-[9.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300',
              available
                ? 'border-gold/50 bg-gold/10 text-gold'
                : 'border-burgundy-light/50 bg-burgundy/20 text-burgundy-light',
            )}
          >
            <span
              className={cn('h-2 w-2 rounded-full', available ? 'bg-gold' : 'bg-burgundy-light')}
              aria-hidden="true"
            />
            {available ? 'Available — customers can order it' : 'Sold out — ordering is blocked'}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-5 border border-red-400/40 bg-red-400/10 px-4 py-3 text-[12px] text-red-200">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-gold !px-6 !py-3.5 !text-[9.5px]">
          <Check className="h-4 w-4" aria-hidden="true" />
          {initial ? 'Save changes' : 'Add item'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline !px-6 !py-3.5 !text-[9.5px]">
          Cancel
        </button>
      </div>
    </form>
  )
}
