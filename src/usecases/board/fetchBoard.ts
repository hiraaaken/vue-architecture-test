import type { ColumnRepository } from '@/repositories/columnRepository'
import type { TaskRepository } from '@/repositories/taskRepository'
import type { BoardStore } from '@/stores/boardStore'

export type FetchBoardDeps = {
  columnRepository: ColumnRepository
  taskRepository: TaskRepository
  store: BoardStore
}

export async function fetchBoard(deps: FetchBoardDeps): Promise<void> {
  const { columnRepository, taskRepository, store } = deps

  store.setLoading(true)
  store.setError(null)

  try {
    const [columns, tasks] = await Promise.all([
      columnRepository.getAll(),
      taskRepository.getAll(),
    ])
    store.setColumns(columns)
    store.setTasks(tasks)
  } catch (e) {
    store.setError(e instanceof Error ? e.message : 'Failed to fetch board')
  } finally {
    store.setLoading(false)
  }
}
