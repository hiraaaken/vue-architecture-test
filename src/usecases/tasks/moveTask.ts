import type { TaskRepository } from '@/repositories/taskRepository'
import type { BoardStore } from '@/stores/boardStore'
import type { MoveTaskInput, Task } from '@/domain/types'

export type MoveTaskDeps = {
  repository: TaskRepository
  store: BoardStore
}

/**
 * Move task with optimistic update
 * Updates store immediately, then syncs with server
 * Reverts on failure
 */
export async function moveTask(
  input: MoveTaskInput,
  deps: MoveTaskDeps
): Promise<boolean> {
  const { repository, store } = deps
  const { taskId, toColumnId, newOrder } = input

  // Get current task state for rollback
  const originalTask = store.getTaskById(taskId)
  if (!originalTask) {
    store.setError('Task not found')
    return false
  }

  // Optimistic update
  const optimisticTask: Task = {
    ...originalTask,
    columnId: toColumnId,
    order: newOrder,
    updatedAt: new Date(),
  }
  store.updateTask(optimisticTask)

  try {
    const serverTask = await repository.move(input)
    // Update with server response (may have different timestamp, etc.)
    store.updateTask(serverTask)
    return true
  } catch (e) {
    // Rollback on failure
    store.updateTask(originalTask)
    store.setError(e instanceof Error ? e.message : 'Failed to move task')
    return false
  }
}
