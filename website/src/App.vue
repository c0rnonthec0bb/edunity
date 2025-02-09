<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from './composables/useAuth'
import MainHeader from './components/MainHeader.vue'
import SignInView from './views/SignInView.vue'

const router = useRouter()
const route = useRoute()
const { user, loading, signInWithGoogle } = useAuth()
</script>

<template>
  <!-- Loading state -->
  <div v-if="loading" class="min-h-screen flex items-center justify-center">
    <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-theme-500"></div>
  </div>

  <!-- Main app -->
  <div v-else class="min-h-screen bg-gray-50">
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
.page-leave-active {
  transition: all 100ms ease-in;
  position: absolute;
  width: 100%;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.page-leave-from,
.page-enter-to {
  opacity: 1;
}
</style>
