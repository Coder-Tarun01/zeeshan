import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, LogOut, Pencil, Plus, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react'
import { SiteLayout } from '../components/layout/SiteLayout'
import { ItemForm } from '../components/admin/ItemForm'
import { AdminLogin } from '../components/admin/AdminLogin'
import { useMenu } from '../components/menu/MenuContext'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { API_BASE_URL } from '../lib/api'
import { PORTIONS, type MenuItem } from '../data/menu'
import { business } from '../data/site'
import { formatINR } from '../lib/price'
import { MENU_STORAGE_KEY, menuToJson, menuToTypeScript } from '../lib/menuStore'
import { HOME_PATH, MENU_PATH, navigate, usePageTitle } from '../lib/router'
import { cn } from '../lib/cn'

type EditorState = { mode: 'create' } | { mode: 'edit'; id: string } | null

/** "100g ₹60 · 250g ₹150 · 500g ₹300" or "₹60 per piece". */
function priceLine(item: MenuItem): string {
  const pricing = item.pricing
  if (pricing.unit === 'piece') return `${formatINR(pricing.price)} per piece`

  return PORTIONS.map((portion) => `${portion} ${formatINR(pricing.prices[portion])}`).join(' · ')
}

export function AdminPage() {
  const auth = useAdminAuth()
  const { items, soldOutCount, addItem, updateItem, removeItem, setAvailability, resetMenu } =
    useMenu()

  const [editor, setEditor] = useState<EditorState>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const signedIn = auth.status === 'signed-in'

  usePageTitle(
    signedIn
      ? `Menu Manager — ${business.name} ${business.signLine}`
      : `Staff sign in — ${business.name} ${business.signLine}`,
  )

  /* Keep the panel out of search engines. */
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const editingItem =
    editor?.mode === 'edit' ? items.find((item) => item.id === editor.id) : undefined
  const takenNames = useMemo(
    () => items.filter((item) => item.id !== editingItem?.id).map((item) => item.name),
    [items, editingItem?.id],
  )
  const tsSnippet = useMemo(() => menuToTypeScript(items), [items])

  const downloadJson = () => {
    const blob = new Blob([menuToJson(items)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'zeeshan-menu.json'
    link.click()
    URL.revokeObjectURL(url)
    setStatus('Menu exported as zeeshan-menu.json')
  }

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(tsSnippet)
      setStatus('menu.ts snippet copied — paste it into src/data/menu.ts')
    } catch {
      setStatus('Copy was blocked by the browser — select the code below and copy it manually.')
    }
  }

  const handleReset = () => {
    resetMenu()
    setConfirmingReset(false)
    setEditor(null)
    setStatus('Menu restored to the version shipped with the site.')
  }

  if (auth.status === 'checking') {
    return (
      <SiteLayout mainClassName="pb-24 pt-[136px] sm:pt-[152px]" withFloatingActions={false}>
        <div className="container-page">
          <div className="mx-auto max-w-md border border-cream/10 bg-night/50 px-6 py-16 text-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-gold">Menu Manager</p>
            <p className="mt-3 font-display text-2xl text-cream">Checking your session…</p>
            <p className="mt-2 text-[12px] text-cream/40">
              Verifying your staff sign-in with the admin API.
            </p>
          </div>
        </div>
      </SiteLayout>
    )
  }

  if (!signedIn) {
    return (
      <SiteLayout mainClassName="pb-24 pt-[136px] sm:pt-[152px]" withFloatingActions={false}>
        <div className="container-page">
          <AdminLogin
            initialError={
              auth.status === 'offline'
                ? `Cannot reach the admin API at ${API_BASE_URL}.`
                : null
            }
            initialOffline={auth.status === 'offline'}
            onSubmit={auth.signIn}
            onRetryConnection={auth.refresh}
          />
        </div>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout mainClassName="pb-24 pt-[136px] sm:pt-[152px]" withFloatingActions={false}>
      <div className="container-page">
        <nav aria-label="Breadcrumb" className="text-[9px] uppercase tracking-[0.2em] text-cream/35">
          <a
            href={HOME_PATH}
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
          <span className="text-cream/60">Menu Manager</span>
        </nav>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-label text-gold">Staff</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.1rem)] leading-none text-cream">
              Menu Manager
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-cream/45">
              Add dishes, edit prices and mark items sold out. Changes apply straight away on this
              device — the menu cards, the order panel and the bag all read from here.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span className="inline-flex items-center gap-2 border border-gold/35 bg-gold/[0.06] px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-gold">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {auth.user?.displayName || auth.user?.username}
              <span className="text-gold/50">· {auth.user?.role}</span>
            </span>

            <div className="flex items-center gap-2">
              <a
                href={MENU_PATH}
                onClick={(event) => {
                  event.preventDefault()
                  navigate(MENU_PATH)
                }}
                className="btn-outline !px-4 !py-3 !text-[9px]"
              >
                View menu
              </a>
              <button
                type="button"
                onClick={() => {
                  void auth.signOut()
                }}
                className="inline-flex items-center gap-2 border border-cream/15 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-cream/60 transition-colors duration-300 hover:border-burgundy-light/60 hover:text-burgundy-light"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        </div>

        <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="border border-cream/10 bg-night/60 px-5 py-4">
            <dt className="text-[9px] uppercase tracking-[0.16em] text-cream/35">Items</dt>
            <dd className="mt-1 font-display text-[26px] leading-none text-cream">{items.length}</dd>
          </div>
          <div className="border border-cream/10 bg-night/60 px-5 py-4">
            <dt className="text-[9px] uppercase tracking-[0.16em] text-cream/35">Sold out</dt>
            <dd
              className={cn(
                'mt-1 font-display text-[26px] leading-none',
                soldOutCount > 0 ? 'text-burgundy-light' : 'text-cream',
              )}
            >
              {soldOutCount}
            </dd>
          </div>
          <div className="col-span-2 border border-cream/10 bg-night/60 px-5 py-4 sm:col-span-1">
            <dt className="text-[9px] uppercase tracking-[0.16em] text-cream/35">Saved in</dt>
            <dd className="mt-1.5 text-[11.5px] leading-relaxed text-cream/50">
              This browser · <code className="text-cream/70">{MENU_STORAGE_KEY}</code>
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setEditor({ mode: 'create' })
              setStatus(null)
            }}
            className="btn-gold !px-5 !py-3.5 !text-[9.5px]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add new item
          </button>

          <button
            type="button"
            onClick={downloadJson}
            className="btn-outline !px-5 !py-3.5 !text-[9.5px]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export JSON
          </button>

          {confirmingReset ? (
            <span className="inline-flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="border border-burgundy-light/50 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-burgundy-light transition-colors duration-300 hover:bg-burgundy-light/10"
              >
                Confirm reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="text-[9px] uppercase tracking-[0.16em] text-cream/40 transition-colors duration-300 hover:text-cream"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-cream/40 transition-colors duration-300 hover:text-gold"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset to shipped menu
            </button>
          )}
        </div>

        {status && (
          <p
            role="status"
            className="mt-4 border border-gold/30 bg-gold/[0.06] px-4 py-3 text-[11.5px] text-cream/70"
          >
            {status}
          </p>
        )}

        {editor && (
          <div className="mt-7">
            <ItemForm
              key={editor.mode === 'edit' ? editor.id : 'new'}
              initial={editingItem}
              takenNames={takenNames}
              onCancel={() => {
                setEditor(null)
                setStatus(null)
              }}
              onSubmit={(draft) => {
                if (editor.mode === 'edit') {
                  const saved = updateItem(editor.id, draft)
                  if (saved) {
                    setEditor(null)
                    setStatus(`Saved “${draft.name}”.`)
                  }
                  return saved
                }

                const created = addItem(draft)
                if (created) {
                  setEditor(null)
                  setStatus(`Added “${created.name}” to the menu.`)
                  return true
                }
                return false
              }}
            />
          </div>
        )}

        <ul className="mt-7 divide-y divide-cream/[0.08] border border-cream/10 bg-night/60">
          {items.length === 0 && (
            <li className="px-6 py-14 text-center">
              <p className="font-display text-2xl text-cream">The menu is empty</p>
              <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-cream/45">
                Add your first dish, or reset to the menu that ships with the site.
              </p>
            </li>
          )}

          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
            >
              <img
                src={item.image.src}
                alt=""
                loading="lazy"
                className={cn(
                  'h-16 w-16 shrink-0 border border-cream/10 object-cover',
                  !item.available && 'opacity-45 grayscale',
                )}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="font-display text-[21px] leading-tight text-cream">{item.name}</h2>
                  <span className="text-[8.5px] uppercase tracking-[0.18em] text-cream/30">
                    {item.category}
                  </span>
                  {item.tag && (
                    <span className="border border-gold/30 px-2 py-0.5 text-[8px] uppercase tracking-[0.16em] text-gold/80">
                      {item.tag}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[12px] text-cream/55">{priceLine(item)}</p>
                {item.description && (
                  <p className="mt-1 truncate text-[11.5px] text-cream/30">{item.description}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.available}
                  onClick={() => setAvailability(item.id, !item.available)}
                  aria-label={`${item.name} is ${item.available ? 'available' : 'sold out'} — click to change`}
                  className={cn(
                    'inline-flex items-center gap-2 border px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300',
                    item.available
                      ? 'border-gold/45 bg-gold/10 text-gold hover:border-gold'
                      : 'border-burgundy-light/45 bg-burgundy/20 text-burgundy-light hover:border-burgundy-light',
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      item.available ? 'bg-gold' : 'bg-burgundy-light',
                    )}
                    aria-hidden="true"
                  />
                  {item.available ? 'Available' : 'Sold out'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditor({ mode: 'edit', id: item.id })
                    setStatus(null)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  aria-label={`Edit ${item.name}`}
                  className="inline-flex items-center gap-2 border border-cream/15 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-cream/60 transition-colors duration-300 hover:border-gold/60 hover:text-gold"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </button>

                {confirmingId === item.id ? (
                  <span className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.id)
                        setConfirmingId(null)
                        setEditor((current) =>
                          current?.mode === 'edit' && current.id === item.id ? null : current,
                        )
                        setStatus(`Deleted “${item.name}”.`)
                      }}
                      className="border border-burgundy-light/60 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-burgundy-light transition-colors duration-300 hover:bg-burgundy-light/10"
                    >
                      Delete
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
                    onClick={() => setConfirmingId(item.id)}
                    aria-label={`Delete ${item.name}`}
                    className="inline-flex items-center gap-2 border border-cream/15 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-cream/50 transition-colors duration-300 hover:border-burgundy-light/60 hover:text-burgundy-light"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        <details className="mt-8 border border-cream/10 bg-night/40">
          <summary className="cursor-pointer px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-cream/60 transition-colors duration-300 hover:text-gold">
            Make these changes live for every visitor
          </summary>

          <div className="border-t border-cream/10 px-5 py-5">
            <p className="max-w-2xl text-[12.5px] leading-relaxed text-cream/45">
              The panel saves to this browser only. To publish the menu for everyone, copy the
              snippet below over the <code className="text-cream/70">menuItems</code> array in{' '}
              <code className="text-cream/70">src/data/menu.ts</code>, then redeploy. Prices,
              availability and new dishes all travel with it.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copySnippet}
                className="btn-outline !px-5 !py-3 !text-[9px]"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Copy menu.ts snippet
              </button>
              <button
                type="button"
                onClick={downloadJson}
                className="btn-outline !px-5 !py-3 !text-[9px]"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Download JSON
              </button>
            </div>

            <pre className="mt-4 max-h-72 overflow-auto border border-cream/10 bg-ink/70 p-4 text-[11px] leading-relaxed text-cream/60">
              {tsSnippet}
            </pre>
          </div>
        </details>
      </div>
    </SiteLayout>
  )
}
