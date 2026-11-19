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
import type { MenuCategory, MenuCategoryId, MenuItem, MenuPricing } from '../../data/menu'
import {
  CATEGORY_STORAGE_KEY,
  MENU_STORAGE_KEY,
  defaultCategories,
  defaultMenu,
  persistCategories,
  persistMenu,
  readStoredCategories,
  readStoredMenu,
  uniqueCategoryId,
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

/** Everything the admin panel can set on a category. */
export interface CategoryDraft {
  label: string
  description?: string
}

/** Why a delete was refused — the panel turns this into a message. */
export type CategoryRemoval = 'removed' | 'in-use' | 'last'

interface MenuContextValue {
  items: MenuItem[]
  soldOutCount: number
  categories: MenuCategory[]
  getById: (id: string) => MenuItem | undefined
  getByName: (name: string) => MenuItem | undefined
  addItem: (draft: MenuItemDraft) => MenuItem | null
  updateItem: (id: string, draft: MenuItemDraft) => boolean
  removeItem: (id: string) => void
  setAvailability: (id: string, available: boolean) => void
  addCategory: (draft: CategoryDraft) => MenuCategory | null
  updateCategory: (id: string, draft: CategoryDraft) => boolean
  removeCategory: (id: string) => CategoryRemoval
  moveCategory: (id: string, direction: -1 | 1) => void
  resetMenu: () => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

const nameKey = (value: string) => value.trim().toLowerCase()

/**
 * Keeps items filed under a category the panel still knows about — an id from
 * stale storage falls back to the first category instead of orphaning the item.
 */
function resolveCategory(id: string, categories: MenuCategory[]): MenuCategoryId {
  if (categories.some((category) => category.id === id)) return id
  return categories[0]?.id ?? id
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>(() => readStoredMenu())
  const itemsRef = useRef(items)
  itemsRef.current = items

  const [categories, setCategories] = useState<MenuCategory[]>(() => readStoredCategories())
  const categoriesRef = useRef(categories)
  categoriesRef.current = categories

  /** Single write path: state + storage stay in step. */
  const commit = useCallback((next: MenuItem[]) => {
    itemsRef.current = next
    setItems(next)
    persistMenu(next)
  }, [])

  const commitCategories = useCallback((next: MenuCategory[]) => {
    categoriesRef.current = next
    setCategories(next)
    persistCategories(next)
  }, [])

  /* Keep other tabs of the same browser in sync. */
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === MENU_STORAGE_KEY) {
        const next = readStoredMenu()
        itemsRef.current = next
        setItems(next)
        return
      }

      if (event.key === CATEGORY_STORAGE_KEY) {
        const next = readStoredCategories()
        categoriesRef.current = next
        setCategories(next)
      }
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
        category: resolveCategory(draft.category, categoriesRef.current),
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
                category: resolveCategory(draft.category, categoriesRef.current),
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

  const resetMenu = useCallback(() => {
    commit(defaultMenu())
    commitCategories(defaultCategories())
  }, [commit, commitCategories])

  const addCategory = useCallback(
    (draft: CategoryDraft) => {
      const label = draft.label.trim().slice(0, 28)
      if (label.length < 2) return null
      if (categoriesRef.current.some((category) => nameKey(category.label) === nameKey(label))) {
        return null
      }

      const description = draft.description?.trim().slice(0, 90)
      const category: MenuCategory = {
        id: uniqueCategoryId(label, categoriesRef.current),
        label,
        ...(description ? { description } : {}),
      }

      commitCategories([...categoriesRef.current, category])
      return category
    },
    [commitCategories],
  )

  const updateCategory = useCallback(
    (id: string, draft: CategoryDraft) => {
      if (!categoriesRef.current.some((category) => category.id === id)) return false

      const label = draft.label.trim().slice(0, 28)
      if (label.length < 2) return false

      const clash = categoriesRef.current.some(
        (category) => category.id !== id && nameKey(category.label) === nameKey(label),
      )
      if (clash) return false

      const description = draft.description?.trim().slice(0, 90)

      commitCategories(
        categoriesRef.current.map((category) =>
          category.id === id
            ? { id: category.id, label, ...(description ? { description } : {}) }
            : category,
        ),
      )
      return true
    },
    [commitCategories],
  )

  const removeCategory = useCallback(
    (id: string): CategoryRemoval => {
      if (categoriesRef.current.length <= 1) return 'last'
      if (itemsRef.current.some((item) => item.category === id)) return 'in-use'

      commitCategories(categoriesRef.current.filter((category) => category.id !== id))
      return 'removed'
    },
    [commitCategories],
  )

  const moveCategory = useCallback(
    (id: string, direction: -1 | 1) => {
      const list = [...categoriesRef.current]
      const index = list.findIndex((category) => category.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= list.length) return

      const [moved] = list.splice(index, 1)
      list.splice(target, 0, moved)
      commitCategories(list)
    },
    [commitCategories],
  )

  const soldOutCount = useMemo(
    () => items.reduce((total, item) => total + (item.available ? 0 : 1), 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      soldOutCount,
      categories,
      getById,
      getByName,
      addItem,
      updateItem,
      removeItem,
      setAvailability,
      addCategory,
      updateCategory,
      removeCategory,
      moveCategory,
      resetMenu,
    }),
    [
      items,
      soldOutCount,
      categories,
      getById,
      getByName,
      addItem,
      updateItem,
      removeItem,
      setAvailability,
      addCategory,
      updateCategory,
      removeCategory,
      moveCategory,
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
