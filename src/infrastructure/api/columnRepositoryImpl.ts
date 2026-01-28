import type { ColumnRepository } from '@/repositories/columnRepository'
import type { Column, ColumnId } from '@/domain/types'
import { delay } from './delay'

// Fixed columns as per spec
const columns: Column[] = [
  { id: 'col-todo' as ColumnId, title: 'To Do', order: 0 },
  { id: 'col-in-progress' as ColumnId, title: 'In Progress', order: 1 },
  { id: 'col-done' as ColumnId, title: 'Done', order: 2 },
]

export const columnRepositoryImpl: ColumnRepository = {
  async getAll(): Promise<Column[]> {
    await delay(200)
    return [...columns]
  },
}
