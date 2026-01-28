<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const delegatedProps = computed(() => {
  const { class: _, ...rest } = props
  return rest
})
</script>

<template>
  <div
    :class="cn('rounded-lg border bg-card text-card-foreground shadow-sm', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </div>
</template>
