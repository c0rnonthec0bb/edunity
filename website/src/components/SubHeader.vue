<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  title: string
  superTitle?: string
}>()

const route = useRoute()
const router = useRouter()

const displayTitle = computed(() => route.meta.title || '')
const displaySuperTitle = computed(() => route.meta.superTitle || '')

const backRoute = route.meta.backRoute || { name: 'home' }
</script>

<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center min-w-0">
          <router-link
            :to="backRoute"
            class="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>

          <div class="ml-3 mr-3 overflow-hidden">
            <div v-if="superTitle" class="text-sm font-medium text-gray-500 mb-0.5">
              {{ superTitle }}
            </div>
            <h1 
              class="font-bold text-gray-900 truncate"
              :class="[
                superTitle ? 'text-xl' : 'text-2xl'
              ]"
            >
              {{ title }}
            </h1>
          </div>
        </div>

        <div>
          <slot name="action" />
        </div>
      </div>
    </div>
  </header>
</template>
