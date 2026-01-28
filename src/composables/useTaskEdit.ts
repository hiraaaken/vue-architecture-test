import { ref, computed } from 'vue'
import { useBoardStore } from '@/stores/boardStore'
import { taskRepositoryImpl } from '@/infrastructure/api/taskRepositoryImpl'
import { updateTask as updateTaskUseCase } from '@/usecases/tasks/updateTask'
import { deleteTask as deleteTaskUseCase } from '@/usecases/tasks/deleteTask'
import type { Task, TaskId } from '@/domain/types'

export function useTaskEdit() {
  const store = useBoardStore()

  // UI State
  const isOpen = ref(false)
  const currentTaskId = ref<TaskId | null>(null)
  const title = ref('')
  const description = ref('')
  const isSaving = ref(false)

  // Original values for change detection
  const originalTitle = ref('')
  const originalDescription = ref('')

  // Derived
  const hasChanges = computed(() => {
    return title.value !== originalTitle.value ||
           description.value !== originalDescription.value
  })

  const isValid = computed(() => {
    return title.value.trim().length > 0
  })

  // Actions
  const open = (task: Task) => {
    currentTaskId.value = task.id
    title.value = task.title
    description.value = task.description
    originalTitle.value = task.title
    originalDescription.value = task.description
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    currentTaskId.value = null
    title.value = ''
    description.value = ''
    originalTitle.value = ''
    originalDescription.value = ''
  }

  const save = async () => {
    if (!isValid.value || !currentTaskId.value || !hasChanges.value) return

    isSaving.value = true
    try {
      await updateTaskUseCase(
        {
          id: currentTaskId.value,
          title: title.value,
          description: description.value,
        },
        { repository: taskRepositoryImpl, store }
      )
      close()
    } finally {
      isSaving.value = false
    }
  }

  const deleteAndClose = async () => {
    if (!currentTaskId.value) return

    isSaving.value = true
    try {
      await deleteTaskUseCase(currentTaskId.value, {
        repository: taskRepositoryImpl,
        store,
      })
      close()
    } finally {
      isSaving.value = false
    }
  }

  return {
    // UI State
    isOpen,
    title,
    description,
    isSaving,
    // Derived
    hasChanges,
    isValid,
    // Actions
    open,
    close,
    save,
    deleteAndClose,
  }
}
