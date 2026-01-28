import type { Column } from './types'

/**
 * Pure function to sort columns by order
 */
export function sortColumnsByOrder(columns: Column[]): Column[] {
  return [...columns].sort((a, b) => a.order - b.order)
}
