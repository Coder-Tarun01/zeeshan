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
import type { MenuCategoryId, MenuItem, MenuPricing } from '../../data/menu'
import {
  MENU_STORAGE_KEY,
  defaultMenu,
  persistMenu,
  readStoredMenu,
  uniqueId,
} from '../../lib/menuStore'

/** Everything the admin panel can set on an item. */
export interface MenuItemDraft {
  name: string
  category: MenuCategoryId
  description: string
  pricing: MenuPricing
  image: SiteImage
  tag?: string
  available: boolean
}

interface MenuContextValue {
  items: MenuItem[]
  soldOutCount: number
  getById: (id: string) => MenuItem | undefined
  getByName: (name: string) => MenuItem | undefined
  addItem: (draft: MenuItemDraft) => MenuItem | null
  updateItem: (id: string, draft: MenuItemDraft) => boolean
  removeItem: (id: string) => void
  setAvailability: (id: string, available: boolean) => void
  resetMenu: () => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

const nameKey = (value: string) => value.trim().toLowerCase()

export function MenuProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>(() => readStoredMenu())
  const itemsRef = useRef(items)
  itemsRef.current = items

  /** Single write path: state + storage stay in step. */
  const commit = useCallback((next: MenuItem[]) => {
    itemsRef.current = next
    setItems(next)
    persistMenu(next)
  }, [])

  /* Keep other tabs of the same browser in sync. */
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== MENU_STORAGE_KEY) return
      const next = readStoredMenu()
      itemsRef.current = next
      setItems(next)
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const getById = useCallback(
    (id: string) => itemsRef.current.find((item) => item.id === id),
    [],
  )

  const getByName = useCallback(
    (name: string) =>
      itemsRef.current.find((item) => nameKey(item.name) === nameKey(name)),
    [],
  )

  const addItem = useCallback(
    (draft: MenuItemDraft) => {
      const name = draft.name.trim()
      if (!name) return null
      if (itemsRef.current.some((item) => nameKey(item.name) === nameKey(name))) return null

      const item: MenuItem = {
        id: uniqueId(name, itemsRef.current),
        name,
        category: draft.category,
        description: draft.description.trim(),
        pricing: draft.pricing,
        image: draft.image,
        tag: draft.tag?.trim() || undefined,
        available: draft.available,
      }

      commit([...itemsRef.current, item])
      return item
    },
    [commit],
  )

  const updateItem = useCallback(
    (id: string, draft: MenuItemDraft) => {
      const name = draft.name.trim()
      if (!name) return false

      const clash = itemsRef.current.some(
        (item) => item.id !== id && nameKey(item.name) === nameKey(name),
      )
      if (clash) return false

      commit(
        itemsRef.current.map((item) =>
          item.id === id
            ? {
                ...item,
                name,
                category: draft.category,
                description: draft.description.trim(),
                pricing: draft.pricing,
                image: draft.image,
                tag: draft.tag?.trim() || undefined,
                available: draft.available,
              }
            : item,
        ),
      )
      return true
    },
    [commit],
  )

  const removeItem = useCallback(
    (id: string) => commit(itemsRef.current.filter((item) => item.id !== id)),
    [commit],
  )

  const setAvailability = useCallback(
    (id: string, available: boolean) =>
      commit(itemsRef.current.map((item) => (item.id === id ? { ...item, available } : item))),
    [commit],
  )

  const resetMenu = useCallback(() => commit(defaultMenu()), [commit])

  const soldOutCount = useMemo(
    () => items.reduce((total, item) => total + (item.available ? 0 : 1), 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      soldOutCount,
      getById,
      getByName,
      addItem,
      updateItem,
      removeItem,
      setAvailability,
      resetMenu,
    }),
    [
      items,
      soldOutCount,
      getById,
      getByName,
      addItem,
      updateItem,
      removeItem,
      setAvailability,
      resetMenu,
    ],
  )

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu(): MenuContextValue {
  const context = useContext(MenuContext)
  if (!context) throw new Error('useMenu must be used inside <MenuProvider>')
  return context
}
