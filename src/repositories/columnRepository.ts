import type { Column } from '@/domain/types'

export interface ColumnRepository {
  getAll(): Promise<Column[]>
}
