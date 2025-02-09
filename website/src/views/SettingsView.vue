<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const { user } = useAuth()
</script>

<template>
  <div class="p-8">
    <div class="max-w-2xl mx-auto">
      <h2 class="text-lg font-medium text-gray-900 mb-6">Account Settings</h2>
      
      <div class="bg-white shadow rounded-lg p-6">
        <div class="space-y-6">
          <!-- Account Info -->
          <div>
            <h3 class="text-sm font-medium text-gray-500">Account Information</h3>
            <div class="mt-2 space-y-2">
              <p class="text-gray-900">{{ user?.displayName }}</p>
              <p class="text-gray-600">{{ user?.email }}</p>
            </div>
          </div>
          
          <div class="border-t border-gray-200 pt-6">
            <p class="text-sm text-gray-500">
              More settings coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
