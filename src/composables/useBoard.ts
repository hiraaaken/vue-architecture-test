import { computed, onMounted } from 'vue'
import { useBoardStore } from '@/stores/boardStore'
import { columnRepositoryImpl } from '@/infrastructure/api/columnRepositoryImpl'
import { taskRepositoryImpl } from '@/infrastructure/api/taskRepositoryImpl'
import { fetchBoard as fetchBoardUseCase } from '@/usecases/board/fetchBoard'
import { createTask as createTaskUseCase } from '@/usecases/tasks/createTask'
import { moveTask as moveTaskUseCase } from '@/usecases/tasks/moveTask'
import { deleteTask as deleteTaskUseCase } from '@/usecases/tasks/deleteTask'
import type { ColumnId, TaskId, MoveTaskInput } from '@/domain/types'

export function useBoard() {
  const store = useBoardStore()

  // Lifecycle: fetch board on mount
  onMounted(() => {
    fetchBoardUseCase({
      columnRepository: columnRepositoryImpl,
      taskRepository: taskRepositoryImpl,
      store,
    })
  })

  // Derived from Store
  const columns = computed(() => store.sortedColumns)
  const tasksByColumnId = computed(() => store.tasksByColumnId)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)

  // Actions (call UseCases with injected dependencies)
  const addTask = async (columnId: ColumnId, title: string) => {
    return createTaskUseCase(
      { columnId, title },
      { repository: taskRepositoryImpl, store }
    )
  }

  const moveTask = async (input: MoveTaskInput) => {
    return moveTaskUseCase(input, { repository: taskRepositoryImpl, store })
  }

  const removeTask = async (id: TaskId) => {
    return deleteTaskUseCase(id, { repository: taskRepositoryImpl, store })
  }

  return {
    // Derived
    columns,
    tasksByColumnId,
    isLoading,
    error,
    // Actions
    addTask,
    moveTask,
    deleteTask: removeTask,
  }
}
