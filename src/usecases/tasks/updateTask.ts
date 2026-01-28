import type { TaskRepository } from '@/repositories/taskRepository'
import type { BoardStore } from '@/stores/boardStore'
import type { UpdateTaskInput, Task } from '@/domain/types'

export type UpdateTaskDeps = {
  repository: TaskRepository
  store: BoardStore
}

export async function updateTask(
  input: UpdateTaskInput,
  deps: UpdateTaskDeps
): Promise<Task | null> {
  const { repository, store } = deps

  try {
    const updatedTask = await repository.update(input)
    store.updateTask(updatedTask)
    return updatedTask
  } catch (e) {
    store.setError(e instanceof Error ? e.message : 'Failed to update task')
    return null
  }
}
