import type { TaskRepository } from '@/repositories/taskRepository'
import type { BoardStore } from '@/stores/boardStore'
import type { CreateTaskInput, Task } from '@/domain/types'

export type CreateTaskDeps = {
  repository: TaskRepository
  store: BoardStore
}

export async function createTask(
  input: CreateTaskInput,
  deps: CreateTaskDeps
): Promise<Task | null> {
  const { repository, store } = deps

  try {
    const newTask = await repository.create(input)
    store.addTask(newTask)
    return newTask
  } catch (e) {
    store.setError(e instanceof Error ? e.message : 'Failed to create task')
    return null
  }
}
