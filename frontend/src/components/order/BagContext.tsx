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
import { useMenu } from '../menu/MenuContext'
import {
  defaultVariant,
  normalizeUnit,
  normalizeVariant,
  priceFor,
  type MenuItem,
  type Variant,
  type PriceUnit,
} from '../../data/menu'

export interface BagItem {
  /** Stable key: name + portion + note, so identical lines merge. */
  id: string
  name: string
  category?: string
  /** 'piece' → quantity is a piece count; weight/plate → quantity is portions or plates. */
  unit: PriceUnit
  /** Selected weight (100g/250g/500g) or plate size (full/half) — by-size items only. */
  portion?: Variant
  /** Price of one portion (weight) or one piece. */
  unitPrice: number | null
  note?: string
  quantity: number
  image?: SiteImage
}

export interface AddToBagInput {
  name: string
  category?: string
  unit?: PriceUnit
  portion?: Variant
  unitPrice?: number | null
  note?: string
  quantity?: number
  image?: SiteImage
}

interface BagContextValue {
  items: BagItem[]
  count: number
  addItem: (input: AddToBagInput) => void
  updateQuantity: (id: string, quantity: number) => void
  changePortion: (id: string, portion: Variant) => void
  removeItem: (id: string) => void
  clearBag: () => void
}

const BagContext = createContext<BagContextValue | null>(null)

const STORAGE_KEY = 'zeeshan:order-bag:v1'
const MAX_QUANTITY = 99

const buildId = (name: string, note: string | undefined, portion: Variant | undefined) =>
  `${name.trim().toLowerCase()}::${portion ?? 'piece'}::${(note ?? '').trim().toLowerCase()}`

const clampQuantity = (value: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(value)))

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

/**
 * Reads the saved bag, discarding anything malformed. Older saved lines only
 * had a weight, so `unit` and `unitPrice` are rebuilt from the current menu.
 */
function readStoredBag(resolve: (name: string) => MenuItem | undefined): BagItem[] {
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
        const stored = entry as Partial<BagItem>
        const portion = normalizeVariant(stored.portion)
        const menuItem = resolve(entry.name)
        const unit: PriceUnit =
          menuItem?.pricing.unit ??
          normalizeUnit(stored.unit) ??
          (portion && (portion === 'full' || portion === 'half') ? 'plate' : portion ? 'weight' : 'piece')
        const resolvedPortion = unit === 'piece' ? undefined : (portion ?? defaultVariant(unit))
        const unitPrice =
          typeof stored.unitPrice === 'number'
            ? stored.unitPrice
            : menuItem
              ? priceFor(menuItem, resolvedPortion)
              : null

        return {
          id: buildId(entry.name, stored.note, resolvedPortion),
          name: entry.name,
          category: stored.category,
          unit,
          portion: resolvedPortion,
          unitPrice,
          note: stored.note,
          quantity: clampQuantity(Number(stored.quantity) || 1),
          image: stored.image,
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
  const { getByName } = useMenu()
  const [items, setItems] = useState<BagItem[]>(() => readStoredBag(getByName))

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
      const next = readStoredBag(getByName)
      itemsRef.current = next
      setItems(next)
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [getByName])

  const addItem = useCallback(
    (input: AddToBagInput) => {
      const quantity = clampQuantity(input.quantity ?? 1)
      const note = input.note?.trim() || undefined
      const menuItem = getByName(input.name)
      const unit: PriceUnit =
        normalizeUnit(input.unit) ??
        menuItem?.pricing.unit ??
        (input.portion ? 'weight' : 'piece')
      const portion = unit === 'piece' ? undefined : (normalizeVariant(input.portion) ?? defaultVariant(unit))
      const unitPrice =
        typeof input.unitPrice === 'number'
          ? input.unitPrice
          : menuItem
            ? priceFor(menuItem, portion)
            : null
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
                  unitPrice: unitPrice ?? item.unitPrice,
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
          unit,
          portion,
          unitPrice,
          note,
          quantity,
          image: input.image,
        },
      ])
    },
    [commit, getByName],
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

  /**
   * Switching the weight or plate size keeps the line (or merges it if that
   * choice already exists) and re-prices it from the menu.
   */
  const changePortion = useCallback(
    (id: string, portion: Variant) => {
      const current = itemsRef.current
      const line = current.find((item) => item.id === id)
      if (!line || line.unit === 'piece' || line.portion === portion) return

      const menuItem = getByName(line.name)
      const unitPrice = menuItem ? priceFor(menuItem, portion) : line.unitPrice
      const nextId = buildId(line.name, line.note, portion)
      const mergeTarget = current.find((item) => item.id === nextId)

      if (mergeTarget) {
        commit(
          current
            .filter((item) => item.id !== id)
            .map((item) =>
              item.id === nextId
                ? {
                    ...item,
                    quantity: clampQuantity(item.quantity + line.quantity),
                    unitPrice: unitPrice ?? item.unitPrice,
                  }
                : item,
            ),
        )
        return
      }

      commit(
        current.map((item) =>
          item.id === id ? { ...item, id: nextId, portion, unitPrice } : item,
        ),
      )
    },
    [commit, getByName],
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
