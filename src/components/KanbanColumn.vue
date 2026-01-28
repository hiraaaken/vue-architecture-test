<script setup lang="ts">
import { ref } from 'vue'
import type { Column, Task, ColumnId } from '@/domain/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, X } from 'lucide-vue-next'
import TaskCard from './TaskCard.vue'

const props = defineProps<{
  column: Column
  tasks: Task[]
}>()

const emit = defineEmits<{
  addTask: [columnId: ColumnId, title: string]
  editTask: [task: Task]
  dropTask: [taskId: string, toColumnId: ColumnId, newOrder: number]
}>()

// Inline add form state
const isAdding = ref(false)
const newTaskTitle = ref('')

const startAdding = () => {
  isAdding.value = true
  newTaskTitle.value = ''
}

const cancelAdding = () => {
  isAdding.value = false
  newTaskTitle.value = ''
}

const submitTask = () => {
  const title = newTaskTitle.value.trim()
  if (title) {
    emit('addTask', props.column.id, title)
    newTaskTitle.value = ''
    isAdding.value = false
  }
}

// Drag and drop
const isDragOver = ref(false)

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  const relatedTarget = e.relatedTarget as HTMLElement | null
  const currentTarget = e.currentTarget as HTMLElement | null
  if (!relatedTarget || !currentTarget?.contains(relatedTarget)) {
    isDragOver.value = false
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  const taskId = e.dataTransfer?.getData('taskId')
  if (taskId) {
    const newOrder = props.tasks.length
    emit('dropTask', taskId, props.column.id, newOrder)
  }
}

// Column colors
const columnColors: Record<string, { header: string; badge: string }> = {
  'col-todo': { header: 'bg-gray-500', badge: 'bg-gray-100 text-gray-700 border border-gray-300' },
  'col-in-progress': { header: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 border border-blue-300' },
  'col-done': { header: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border border-emerald-300' },
}

const colors = columnColors[props.column.id] || columnColors['col-todo']
</script>

<template>
  <Card
    class="w-80 flex-shrink-0 flex flex-col bg-white shadow-md border-gray-200 transition-all duration-200 max-h-[calc(100vh-140px)]"
    :class="{ 'ring-2 ring-primary shadow-lg': isDragOver }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <CardHeader class="pb-3 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div :class="[colors.header, 'w-1 h-6 rounded-full']"></div>
          <CardTitle class="text-base font-bold text-gray-900">
            {{ column.title }}
          </CardTitle>
          <span :class="[colors.badge, 'text-xs font-semibold px-2 py-0.5 rounded-full']">
            {{ tasks.length }}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          @click="startAdding"
        >
          <Plus class="h-5 w-5" />
        </Button>
      </div>
    </CardHeader>

    <CardContent class="flex-1 flex flex-col pt-3 px-3 pb-3 min-h-0 overflow-hidden">
      <ScrollArea class="flex-1 -mx-1 px-1">
        <div class="space-y-2 pb-2">
          <TaskCard
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            @click="emit('editTask', task)"
          />

          <!-- Drop zone indicator when empty -->
          <div
            v-if="tasks.length === 0 && !isAdding"
            class="h-28 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50"
            :class="{ 'border-primary bg-blue-50': isDragOver }"
          >
            <p class="text-sm font-medium text-gray-400">
              {{ isDragOver ? 'Drop here' : 'No tasks yet' }}
            </p>
          </div>
        </div>
      </ScrollArea>

      <!-- Add task form -->
      <div v-if="isAdding" class="mt-3 space-y-2 pt-3 border-t border-gray-100">
        <Input
          v-model="newTaskTitle"
          placeholder="Enter task title..."
          class="text-sm border-gray-300"
          @keyup.enter="submitTask"
          @keyup.escape="cancelAdding"
          autofocus
        />
        <div class="flex gap-2">
          <Button size="sm" class="flex-1 font-medium" @click="submitTask">
            Add Task
          </Button>
          <Button size="sm" variant="outline" @click="cancelAdding">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
