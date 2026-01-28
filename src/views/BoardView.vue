<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useBoard } from '@/composables/useBoard'
import { useTaskEdit } from '@/composables/useTaskEdit'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import KanbanColumn from '@/components/KanbanColumn.vue'
import TaskEditModal from '@/components/TaskEditModal.vue'
import { LayoutDashboard, LogOut, Loader2 } from 'lucide-vue-next'
import type { Task, ColumnId, TaskId } from '@/domain/types'

const { user, logout } = useAuth()
const { columns, tasksByColumnId, isLoading, error, addTask, moveTask } = useBoard()
const taskEdit = useTaskEdit()

const getTasksForColumn = (columnId: ColumnId): Task[] => {
  return tasksByColumnId.value.get(columnId) || []
}

const handleAddTask = async (columnId: ColumnId, title: string) => {
  await addTask(columnId, title)
}

const handleEditTask = (task: Task) => {
  taskEdit.open(task)
}

const handleDropTask = async (taskId: string, toColumnId: ColumnId, newOrder: number) => {
  await moveTask({
    taskId: taskId as TaskId,
    toColumnId,
    newOrder,
  })
}

const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- Header -->
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div class="flex h-16 items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-primary text-white">
            <LayoutDashboard class="h-5 w-5" />
          </div>
          <h1 class="text-xl font-bold text-gray-900">Kanban Board</h1>
        </div>

        <div class="flex items-center gap-4">
          <div v-if="user" class="flex items-center gap-3">
            <Avatar class="h-9 w-9 border-2 border-gray-200">
              <AvatarFallback class="bg-primary text-white font-semibold text-sm">
                {{ getUserInitials(user.name) }}
              </AvatarFallback>
            </Avatar>
            <span class="text-sm font-medium text-gray-700 hidden sm:inline">
              {{ user.name }}
            </span>
          </div>
          <Button variant="outline" size="sm" @click="logout" class="font-medium">
            <LogOut class="h-4 w-4 mr-2" />
            <span class="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 overflow-hidden">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center gap-3">
          <Loader2 class="h-10 w-10 animate-spin text-primary" />
          <p class="text-base font-medium text-gray-600">Loading board...</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="flex items-center justify-center h-full">
        <div class="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <p class="text-red-700 font-medium">{{ error }}</p>
        </div>
      </div>

      <!-- Board -->
      <div v-else class="h-full overflow-x-auto">
        <div class="flex gap-5 p-6 h-full min-w-max">
          <KanbanColumn
            v-for="column in columns"
            :key="column.id"
            :column="column"
            :tasks="getTasksForColumn(column.id)"
            @add-task="handleAddTask"
            @edit-task="handleEditTask"
            @drop-task="handleDropTask"
          />
        </div>
      </div>
    </main>

    <!-- Task edit modal -->
    <TaskEditModal
      :is-open="taskEdit.isOpen.value"
      :title="taskEdit.title.value"
      :description="taskEdit.description.value"
      :is-saving="taskEdit.isSaving.value"
      :is-valid="taskEdit.isValid.value"
      :has-changes="taskEdit.hasChanges.value"
      @update:title="taskEdit.title.value = $event"
      @update:description="taskEdit.description.value = $event"
      @close="taskEdit.close"
      @save="taskEdit.save"
      @delete="taskEdit.deleteAndClose"
    />
  </div>
</template>
