import { useId, useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Inline form shared by "New category" and "Rename category". */

export const CATEGORY_LABEL_MAX = 28
export const CATEGORY_DESCRIPTION_MAX = 90

const inputClass =
  'mt-1.5 w-full border border-cream/15 bg-ink/60 px-3 py-2 text-[12.5px] text-cream placeholder:text-cream/25 focus:border-gold/60 focus:outline-none'

const labelClass = 'text-[9px] font-medium uppercase tracking-[0.18em] text-cream/45'

export interface CategoryFormValues {
  label: string
  description: string
}

interface CategoryFormProps {
  title: string
  submitLabel: string
  initialLabel?: string
  initialDescription?: string
  onSubmit: (values: CategoryFormValues) => void
  onCancel: () => void
}

export function CategoryForm({
  title,
  submitLabel,
  initialLabel = '',
  initialDescription = '',
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const fieldId = useId()
  const [label, setLabel] = useState(initialLabel)
  const [description, setDescription] = useState(initialDescription)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({ label, description })
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={title}
      className="border border-gold/30 bg-ink/40 px-4 py-4"
    >
      <p className="text-[9px] uppercase tracking-label text-gold">{title}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`${fieldId}-label`}>
            Name <span className="text-gold">*</span>
          </label>
          <input
            id={`${fieldId}-label`}
            value={label}
            onChange={(event) => setLabel(event.target.value.slice(0, CATEGORY_LABEL_MAX))}
            placeholder="e.g. Sea Food"
            autoFocus
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor={`${fieldId}-description`}>
            Note <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id={`${fieldId}-description`}
            value={description}
            onChange={(event) =>
              setDescription(event.target.value.slice(0, CATEGORY_DESCRIPTION_MAX))
            }
            placeholder="Shown to staff only"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="submit" className={cn('btn-gold !px-4 !py-2.5 !text-[9px]')}>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline !px-4 !py-2.5 !text-[9px]">
          Cancel
        </button>
      </div>
    </form>
  )
}
