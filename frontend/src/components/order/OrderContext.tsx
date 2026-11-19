import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { SiteImage } from '../../data/images'
import type { Portion } from '../../data/menu'
import { OrderModal } from './OrderModal'

export interface OrderRequest {
  item: string
  category?: string
  /** Weight pre-selected on the card that opened the panel (by-weight items). */
  portion?: Portion
  /** Optional photo shown in the order bag. */
  image?: SiteImage
}

interface OrderContextValue {
  request: OrderRequest | null
  openOrder: (request: OrderRequest) => void
  closeOrder: () => void
}

const OrderContext = createContext<OrderContextValue | null>(null)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<OrderRequest | null>(null)

  const openOrder = useCallback((next: OrderRequest) => setRequest(next), [])
  const closeOrder = useCallback(() => setRequest(null), [])

  const value = useMemo(
    () => ({ request, openOrder, closeOrder }),
    [request, openOrder, closeOrder],
  )

  return (
    <OrderContext.Provider value={value}>
      {children}
      <OrderModal />
    </OrderContext.Provider>
  )
}

export function useOrder(): OrderContextValue {
  const context = useContext(OrderContext)
  if (!context) throw new Error('useOrder must be used inside <OrderProvider>')
  return context
}
