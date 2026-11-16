import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { SiteImage } from '../../data/images'
import { DEFAULT_PORTION, PORTIONS, type Portion } from '../../data/menu'

export interface BagItem {
  /** Stable key: name + portion + note, so identical lines merge. */
  id: string
  name: string
  category?: string
  price?: string | null
  portion: Portion
  note?: string
  quantity: number
  image?: SiteImage
}

export interface AddToBagInput {
  name: string
  category?: string
  price?: string | null
  portion?: Portion
  note?: string
  quantity?: number
  image?: SiteImage
}

interface BagContextValue {
  items: BagItem[]
  count: number
  addItem: (input: AddToBagInput) => void
  updateQuantity: (id: string, quantity: number) => void
  changePortion: (id: string, portion: Portion) => void
  removeItem: (id: string) => void
  clearBag: () => void
}

const BagContext = createContext<BagContextValue | null>(null)

const STORAGE_KEY = 'zeeshan:order-bag:v1'
const MAX_QUANTITY = 99

const buildId = (name: string, note: string | undefined, portion: Portion) =>
  `${name.trim().toLowerCase()}::${portion}::${(note ?? '').trim().toLowerCase()}`

const clampQuantity = (value: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(value)))

const normalizePortion = (value: unknown): Portion =>
  PORTIONS.includes(value as Portion) ? (value as Portion) : DEFAULT_PORTION

/** localStorage can be blocked (private mode) — sessionStorage keeps the bag for the tab. */
function readRaw(): string | null {
  try {
    const fromLocal = window.localStorage.getItem(STORAGE_KEY)
    if (fromLocal) return fromLocal
  } catch {
    /* storage blocked — try the session fallback below */
  }

  try {
    return window.sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/** Reads the saved bag, discarding anything malformed. */
function readStoredBag(): BagItem[] {
  const raw = readRaw()
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((entry): entry is BagItem => {
        if (!entry || typeof entry !== 'object') return false
        const item = entry as Partial<BagItem>
        return typeof item.name === 'string' && item.name.trim().length > 0
      })
      .map((entry) => {
        const portion = normalizePortion((entry as Partial<BagItem>).portion)
        return {
          ...entry,
          portion,
          id: buildId(entry.name, entry.note, portion),
          quantity: clampQuantity(Number(entry.quantity) || 1),
        }
      })
  } catch {
    return []
  }
}

/**
 * Synchronous write on every change, so the order list survives an instant
 * refresh, a new tab or the browser being closed straight after ordering.
 */
function persistBag(items: BagItem[]) {
  const value = JSON.stringify(items)

  try {
    window.localStorage.setItem(STORAGE_KEY, value)
    return
  } catch {
    /* fall through to the session fallback */
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* storage unavailable — the bag still works for this page view */
  }
}

export function BagProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BagItem[]>(readStoredBag)

  /** Mirror of `items` so actions can read the latest list and persist in the same tick. */
  const itemsRef = useRef<BagItem[]>(items)
  itemsRef.current = items

  const commit = useCallback((next: BagItem[]) => {
    itemsRef.current = next
    setItems(next)
    persistBag(next)
  }, [])

  /* Keep multiple open tabs in sync. */
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      const next = readStoredBag()
      itemsRef.current = next
      setItems(next)
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addItem = useCallback(
    (input: AddToBagInput) => {
      const quantity = clampQuantity(input.quantity ?? 1)
      const note = input.note?.trim() || undefined
      const portion = normalizePortion(input.portion)
      const id = buildId(input.name, note, portion)
      const current = itemsRef.current
      const existing = current.find((item) => item.id === id)

      if (existing) {
        commit(
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: clampQuantity(item.quantity + quantity),
                  price: input.price ?? item.price,
                  category: input.category ?? item.category,
                  image: input.image ?? item.image,
                }
              : item,
          ),
        )
        return
      }

      commit([
        ...current,
        {
          id,
          name: input.name,
          category: input.category,
          price: input.price ?? null,
          portion,
          note,
          quantity,
          image: input.image,
        },
      ])
    },
    [commit],
  )

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      commit(
        itemsRef.current.map((item) =>
          item.id === id ? { ...item, quantity: clampQuantity(quantity) } : item,
        ),
      )
    },
    [commit],
  )

  /** Switching the weight keeps the line (or merges it if that weight already exists). */
  const changePortion = useCallback(
    (id: string, portion: Portion) => {
      const current = itemsRef.current
      const line = current.find((item) => item.id === id)
      if (!line || line.portion === portion) return

      const nextId = buildId(line.name, line.note, portion)
      const mergeTarget = current.find((item) => item.id === nextId)

      if (mergeTarget) {
        commit(
          current
            .filter((item) => item.id !== id)
            .map((item) =>
              item.id === nextId
                ? { ...item, quantity: clampQuantity(item.quantity + line.quantity) }
                : item,
            ),
        )
        return
      }

      commit(current.map((item) => (item.id === id ? { ...item, id: nextId, portion } : item)))
    },
    [commit],
  )

  const removeItem = useCallback(
    (id: string) => commit(itemsRef.current.filter((item) => item.id !== id)),
    [commit],
  )

  const clearBag = useCallback(() => commit([]), [commit])

  const count = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      count,
      addItem,
      updateQuantity,
      changePortion,
      removeItem,
      clearBag,
    }),
    [items, count, addItem, updateQuantity, changePortion, removeItem, clearBag],
  )

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>
}

export function useBag(): BagContextValue {
  const context = useContext(BagContext)
  if (!context) throw new Error('useBag must be used inside <BagProvider>')
  return context
}
