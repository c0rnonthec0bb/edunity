<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, onBeforeMount } from 'vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user } = useAuth()

onBeforeMount(() => {
  console.log('HomeView before mount')
})

onMounted(() => {
  console.log('HomeView mounted')
})

const menuItems = [
  {
    title: 'Students',
    description: 'Manage your student roster and view individual student details.',
    to: { name: 'students' }
  },
  {
    title: 'Quizzes',
    description: 'Create and manage quizzes for your students.',
    to: { name: 'quizzes' }
  }
]
</script>

<template>
  <div class="px-6 sm:px-8 py-6">
    <h1 class="text-2xl font-bold text-gray-600 mb-6">Welcome, {{ user?.displayName || 'Teacher' }}</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in menuItems"
        :key="item.to"
        @click="router.push(item.to)"
        class="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ item.title }}</h2>
        <p class="text-gray-600">{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>
