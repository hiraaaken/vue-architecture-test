import type { TaskRepository } from '@/repositories/taskRepository'
import type { BoardStore } from '@/stores/boardStore'
import type { TaskId } from '@/domain/types'

export type DeleteTaskDeps = {
  repository: TaskRepository
  store: BoardStore
}

export async function deleteTask(
  id: TaskId,
  deps: DeleteTaskDeps
): Promise<boolean> {
  const { repository, store } = deps

  try {
    await repository.delete(id)
    store.removeTask(id)
    return true
  } catch (e) {
    store.setError(e instanceof Error ? e.message : 'Failed to delete task')
    return false
  }
}
