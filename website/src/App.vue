<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { usePageTitle } from './composables/usePageTitle'
import MainHeader from './components/MainHeader.vue'
import SignInView from './views/SignInView.vue'

const router = useRouter()
const route = useRoute()
const { user, loading, signInWithGoogle } = useAuth()
const { title } = usePageTitle()

// Update document title when it changes
import { watch } from 'vue'
watch(title, (newTitle) => {
  document.title = newTitle
}, { immediate: true })
</script>

<template>
  <!-- Loading state -->
  <div v-if="loading" class="min-h-screen flex items-center justify-center">
    <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-theme-500"></div>
  </div>

  <!-- Main app -->
  <div v-else class="min-h-screen bg-gray-100">
    <template v-if="user">
      <MainHeader />
      <div class="min-h-[calc(100vh-4rem)]">
        <div class="max-w-7xl mx-auto">
          <router-view v-slot="{ Component }">
            <transition
              name="page"
            >
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </template>
    <SignInView v-else />
  </div>
</template>

<style>
.page-enter-active {
  transition: all 200ms ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.page-leave-from {
  opacity: 1;
}
</style>
