<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
      <div class="flex items-center justify-center mb-4">
        <img src="/images/logo.svg" alt="Homeroom Hero Logo" class="h-16 w-16" />
      </div>
      <h1 class="text-4xl font-bold text-theme-600 mb-8">
        Homeroom Hero
      </h1>
      <button
        @click="signInWithGoogle"
        class="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg shadow hover:shadow-md transition-shadow gap-3 font-medium"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"
          />
        </svg>
        Sign in with Google
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { signInWithGoogle } from '@/firebase'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
