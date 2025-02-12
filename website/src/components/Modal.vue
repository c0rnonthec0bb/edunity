<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" @close="$emit('update:modelValue', false)" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              :class="[
                'w-full transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all',
                maxWidth || 'max-w-lg'
              ]"
            >
              <div class="relative">
                <!-- Close button -->
                <button
                  @click="$emit('update:modelValue', false)"
                  class="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                >
                  <svg
                    class="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <!-- Title -->
                <DialogTitle
                  v-if="title"
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900 p-6 pb-0"
                >
                  {{ title }}
                </DialogTitle>

                <!-- Content -->
                <div class="p-6">
                  <slot />
                </div>

                <!-- Footer -->
                <div class="px-6 py-4 bg-gray-100 rounded-b-lg flex justify-end gap-3">
                  <slot name="footer">
                    <template v-if="actions">
                      <button
                        v-for="action in actions"
                        :key="action.label"
                        @click="action.onClick"
                        :class="[
                          'px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
                          action.variant === 'danger'
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 border-transparent text-white'
                            : action.variant === 'primary'
                              ? 'bg-theme-500 hover:bg-theme-600 focus:ring-theme-500 border-transparent text-white'
                              : 'bg-white hover:bg-gray-100 focus:ring-theme-500 border border-gray-300 text-gray-700'
                        ]"
                      >
                        {{ action.label }}
                      </button>
                    </template>
                  </slot>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

interface ModalAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'danger' | 'default'
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  maxWidth?: string
  actions?: ModalAction[]
}>(), {
  maxWidth: 'max-w-lg'
})

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>
