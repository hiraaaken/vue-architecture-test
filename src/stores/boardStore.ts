import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Column, Task, TaskId } from '@/domain/types'
import { sortColumnsByOrder } from '@/domain/column'
import { groupTasksByColumnId } from '@/domain/task'

export const useBoardStore = defineStore('board', () => {
  // State
  const columns = ref<Column[]>([])
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const sortedColumns = computed(() => sortColumnsByOrder(columns.value))

  const tasksByColumnId = computed(() => groupTasksByColumnId(tasks.value))

  const getTaskById = (id: TaskId): Task | undefined => {
    return tasks.value.find(task => task.id === id)
  }

  // Mutations
  const setColumns = (newColumns: Column[]) => {
    columns.value = newColumns
  }

  const setTasks = (newTasks: Task[]) => {
    tasks.value = newTasks
  }

  const addTask = (task: Task) => {
    tasks.value.push(task)
  }

  const updateTask = (updatedTask: Task) => {
    const index = tasks.value.findIndex(t => t.id === updatedTask.id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
  }

  const removeTask = (id: TaskId) => {
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (msg: string | null) => {
    error.value = msg
  }

  return {
    // State
    columns,
    tasks,
    isLoading,
    error,
    // Getters
    sortedColumns,
    tasksByColumnId,
    getTaskById,
    // Mutations
    setColumns,
    setTasks,
    addTask,
    updateTask,
    removeTask,
    setLoading,
    setError,
  }
})

export type BoardStore = ReturnType<typeof useBoardStore>
