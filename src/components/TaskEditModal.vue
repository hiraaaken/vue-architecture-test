<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  title: string
  description: string
  isSaving: boolean
  isValid: boolean
  hasChanges: boolean
}>()

const emit = defineEmits<{
  'update:title': [value: string]
  'update:description': [value: string]
  'update:isOpen': [value: boolean]
  close: []
  save: []
  delete: []
}>()

const handleOpenChange = (open: boolean) => {
  emit('update:isOpen', open)
  if (!open) {
    emit('close')
  }
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogDescription>
          Make changes to your task. Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="edit-title">Title</Label>
          <Input
            id="edit-title"
            :model-value="title"
            @update:model-value="emit('update:title', $event)"
            placeholder="Task title"
          />
        </div>

        <div class="space-y-2">
          <Label for="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            :model-value="description"
            @update:model-value="emit('update:description', $event)"
            placeholder="Add a description..."
            class="min-h-[120px] resize-none"
          />
        </div>
      </div>

      <DialogFooter class="flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
        <Button
          variant="destructive"
          @click="emit('delete')"
          :disabled="isSaving"
          class="w-full sm:w-auto"
        >
          <Trash2 class="mr-2 h-4 w-4" />
          Delete
        </Button>
        <div class="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            @click="emit('close')"
            :disabled="isSaving"
            class="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            @click="emit('save')"
            :disabled="isSaving || !isValid || !hasChanges"
            class="w-full sm:w-auto"
          >
            <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
            {{ isSaving ? 'Saving...' : 'Save changes' }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
