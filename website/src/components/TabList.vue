<script setup lang="ts">
interface Tab {
  label: string
  value: string
}

const props = defineProps<{
  modelValue: string
  tabs: Tab[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="flex space-x-4 whitespace-nowrap">
    <div 
      v-for="tab in tabs" 
      :key="tab.value" 
      :class="{
        'bg-theme-100 text-theme-900 border-theme-200': modelValue === tab.value,
        'bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200': modelValue !== tab.value
      }" 
      @click="emit('update:modelValue', tab.value)"
      class="px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors duration-200 flex-shrink-0 border-2"
    >
      {{ tab.label }}
    </div>
  </div>
</template>
