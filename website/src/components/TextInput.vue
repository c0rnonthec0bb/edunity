<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  multiline?: boolean
  rows?: number
  type?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputClasses = computed(() => [
  'w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg',
  'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent',
  props.multiline ? 'resize-none' : ''
])
</script>

<template>
  <textarea
    v-if="multiline"
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    :placeholder="placeholder"
    :rows="rows || 3"
    :class="inputClasses"
  />
  <input
    v-else
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :type="type || 'text'"
    :placeholder="placeholder"
    :class="inputClasses"
  />
</template>
