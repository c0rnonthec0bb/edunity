<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, signOut } = useAuth()
const showMenu = ref(false)

const handleSignOut = async () => {
  await signOut()
  router.push({ name: 'home' })
  showMenu.value = false
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const menu = document.querySelector('#account-menu')
  const button = document.querySelector('#account-button')
  if (menu && button && !menu.contains(event.target as Node) && !button.contains(event.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="sticky top-0 z-50 bg-theme-500">
    <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link :to="{ name: 'home' }" class="text-xl font-bold text-white transition-colors">
          Edunity.ai
        </router-link>

        <!-- Account Menu -->
        <div class="relative">
          <button
            id="account-button"
            @click="showMenu = !showMenu"
            class="flex items-center justify-center w-8 h-8 bg-white rounded-full"
          >
            <svg class="w-5 h-5 text-theme-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showMenu"
            id="account-menu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1"
          >
            <div class="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
              Signed in as {{ user?.displayName || user?.email }}
            </div>
            <router-link
              :to="{ name: 'settings' }"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="showMenu = false"
            >
              Settings
            </router-link>
            <button
              @click="handleSignOut"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.animate-fade-in-down {
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
