/**
 * Small money helpers.
 * Every price on the site is in Indian Rupees, so formatting and totals live
 * here instead of being repeated in each component.
 */

/** `60` → `₹60`, `1150` → `₹1,150` (Indian digit grouping). */
export function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`
}

/** Price of one portion/piece × quantity, or `null` when the price is unknown. */
export function lineAmount(
  unitPrice: number | null | undefined,
  quantity: number,
): number | null {
  return typeof unitPrice === 'number' ? unitPrice * quantity : null
}

export interface PricedLine {
  unitPrice?: number | null
  quantity: number
}

export interface Subtotal {
  /** Sum of the lines whose price is known. */
  amount: number
  /** False when at least one line has no published price. */
  allPriced: boolean
}

/** Order-bag subtotal; `allPriced` tells the UI whether it can print a total. */
export function subtotalOf(lines: PricedLine[]): Subtotal {
  return lines.reduce<Subtotal>(
    (total, line) => ({
      amount: total.amount + (lineAmount(line.unitPrice, line.quantity) ?? 0),
      allPriced: total.allPriced && typeof line.unitPrice === 'number',
    }),
    { amount: 0, allPriced: lines.length > 0 },
  )
}
