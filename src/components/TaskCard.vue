<script setup lang="ts">
import type { Task } from '@/domain/types'
import { Card } from '@/components/ui/card'
import { GripVertical } from 'lucide-vue-next'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  click: [task: Task]
}>()

const handleDragStart = (e: DragEvent) => {
  e.dataTransfer?.setData('taskId', props.task.id)
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <Card
    class="group cursor-pointer bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
    draggable="true"
    @click="emit('click', task)"
    @dragstart="handleDragStart"
  >
    <div class="p-3 flex items-start gap-2">
      <div class="opacity-0 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing mt-0.5">
        <GripVertical class="h-4 w-4 text-gray-400" />
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-semibold text-gray-900 leading-tight">
          {{ task.title }}
        </h4>
        <p v-if="task.description" class="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {{ task.description }}
        </p>
      </div>
    </div>
  </Card>
</template>
