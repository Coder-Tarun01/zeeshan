import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import type { MenuCategory } from '../../data/menu'
import { useMenu } from '../menu/MenuContext'
import { CategoryForm, type CategoryFormValues } from './CategoryForm'
import { cn } from '../../lib/cn'

/**
 * Category manager — create, rename, reorder and delete the categories that
 * drive the menu filter chips and every item's `category`.
 *
 * Saved in this browser (`zeeshan:categories:v1`) exactly like the menu.
 * Deleting is blocked while items are filed under a category, and the last
 * remaining category can never be removed.
 */

const iconButton =
  'flex h-8 items-center justify-center border border-cream/15 text-cream/50 transition-colors duration-300 hover:border-gold/60 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-cream/15 disabled:hover:text-cream/50'

export function CategoryManager() {
  const { items, categories, addCategory, updateCategory, removeCategory, moveCategory } = useMenu()

  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  /** How many items each category holds — drives the "in use" guard. */
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    items.forEach((item) => map.set(item.category, (map.get(item.category) ?? 0) + 1))
    return map
  }, [items])

  const reset = () => {
    setCreating(false)
    setEditingId(null)
    setConfirmingId(null)
    setError(null)
  }

  const handleCreate = ({ label, description }: CategoryFormValues) => {
    if (label.trim().length < 2) {
      setError('Give the category a name (at least 2 characters).')
      return
    }

    const created = addCategory({ label, description })
    if (!created) {
      setError('That name is already used by another category.')
      return
    }

    reset()
    setStatus(`Added “${created.label}” — it is now a filter chip and an item option.`)
  }

  const handleUpdate = (category: MenuCategory, { label, description }: CategoryFormValues) => {
    if (label.trim().length < 2) {
      setError('Give the category a name (at least 2 characters).')
      return
    }

    if (!updateCategory(category.id, { label, description })) {
      setError('That name is already used by another category.')
      return
    }

    reset()
    setStatus(`Renamed to “${label.trim()}” — the items filed under it keep their place.`)
  }

  const handleDelete = (category: MenuCategory) => {
    const result = removeCategory(category.id)
    setConfirmingId(null)

    if (result === 'last') {
      setError('Keep at least one category — the item form needs somewhere to file new dishes.')
      return
    }

    if (result === 'in-use') {
      const used = counts.get(category.id) ?? 0
      setError(
        `“${category.label}” still holds ${used} item${used === 1 ? '' : 's'} — move ${
          used === 1 ? 'it' : 'them'
        } to another category first.`,
      )
      return
    }

    setEditingId((current) => (current === category.id ? null : current))
    setStatus(`Deleted “${category.label}”.`)
  }

  return (
    <section aria-label="Menu categories" className="border border-cream/10 bg-night/40">
      <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
        <div>
          <h2 className="font-display text-[21px] leading-tight text-cream">Categories</h2>
          <p className="mt-1.5 max-w-xl text-[11.5px] leading-relaxed text-cream/40">
            {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} · these become the
            filter chips on the menu page and the <span className="text-cream/60">Category</span>{' '}
            options in the item form. Use the arrows to set their order.
          </p>
        </div>

        {!creating && (
          <button
            type="button"
            onClick={() => {
              reset()
              setStatus(null)
              setCreating(true)
            }}
            className="btn-gold !px-4 !py-2.5 !text-[9px]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New category
          </button>
        )}
      </div>

      {creating && (
        <div className="px-5 pb-4">
          <CategoryForm
            title="New category"
            submitLabel="Add category"
            onSubmit={handleCreate}
            onCancel={() => {
              setCreating(false)
              setError(null)
            }}
          />
        </div>
      )}

      <ul className="divide-y divide-cream/10 border-t border-cream/10">
        {categories.map((category, index) => {
          const used = counts.get(category.id) ?? 0
          const deleteBlocked = used > 0 || categories.length <= 1

          if (editingId === category.id) {
            return (
              <li key={category.id} className="px-5 py-4">
                <CategoryForm
                  title={`Rename “${category.label}”`}
                  initialLabel={category.label}
                  initialDescription={category.description ?? ''}
                  submitLabel="Save category"
                  onSubmit={(values) => handleUpdate(category, values)}
                  onCancel={reset}
                />
              </li>
            )
          }

          return (
            <li key={category.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3.5">
              <span
                className="font-display text-[15px] leading-none text-cream/25"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-display text-[18px] leading-tight text-cream">{category.label}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-cream/35">
                  <code className="border border-cream/10 bg-ink/60 px-1.5 py-0.5 text-[10px] text-cream/50">
                    {category.id}
                  </code>
                  <span aria-hidden="true">·</span>
                  <span className={used > 0 ? 'text-cream/50' : 'text-cream/30'}>
                    {used === 0 ? 'No items yet' : `${used} item${used === 1 ? '' : 's'}`}
                  </span>
                  {category.description && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{category.description}</span>
                    </>
                  )}
                </p>
              </div>


              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveCategory(category.id, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${category.label} up`}
                    className={cn(iconButton, 'w-8')}
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCategory(category.id, 1)}
                    disabled={index === categories.length - 1}
                    aria-label={`Move ${category.label} down`}
                    className={cn(iconButton, 'w-8')}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    reset()
                    setEditingId(category.id)
                  }}
                  aria-label={`Rename ${category.label}`}
                  className={cn(iconButton, 'w-auto gap-2 px-3')}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">Edit</span>
                </button>

                {confirmingId === category.id ? (
                  <span className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      className="border border-burgundy-light/60 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-burgundy-light transition-colors duration-300 hover:bg-burgundy-light/10"
                    >
                      Confirm delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="text-[9px] uppercase tracking-[0.14em] text-cream/40 transition-colors duration-300 hover:text-cream"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null)
                      setConfirmingId(category.id)
                    }}
                    disabled={deleteBlocked}
                    aria-label={`Delete ${category.label}`}
                    title={
                      used > 0
                        ? 'Move its items to another category first'
                        : categories.length <= 1
                          ? 'Keep at least one category'
                          : undefined
                    }
                    className={cn(
                      iconButton,
                      'w-auto gap-2 px-3 hover:border-burgundy-light/60 hover:text-burgundy-light',
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">
                      Delete
                    </span>
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>


      {error && (
        <p
          role="alert"
          className="border-t border-red-400/30 bg-red-400/10 px-5 py-3 text-[11.5px] text-red-200"
        >
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-3 text-[9px] uppercase tracking-[0.14em] text-red-200/70 underline underline-offset-4 hover:text-red-100"
          >
            Dismiss
          </button>
        </p>
      )}

      {status && !error && (
        <p
          role="status"
          className="border-t border-gold/25 bg-gold/[0.05] px-5 py-3 text-[11.5px] text-cream/70"
        >
          {status}
        </p>
      )}
    </section>
  )
}

