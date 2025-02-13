<template>
  <div class="flex items-center justify-between bg-white rounded-lg shadow hover:shadow-md transition-shadow px-4 py-3 hover:bg-gray-100">
    <div class="min-w-0 flex-1">
      <div v-if="student" class="text-m font-medium text-gray-900">
        {{ student.name }}
      </div>
      <div v-else-if="isProcessing" class="text-m font-medium text-blue-600 flex items-center gap-2">
        <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Processing...
      </div>
      <div v-else class="text-m font-medium" :class="{ 'text-gray-600': response.studentId, 'text-red-600': !response.studentId }">
        {{ response.studentId ? '...' : 'Unassigned' }}
      </div>
      <div class="text-sm text-gray-500">
        {{ formatDate(response.createdAt) }}
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div v-if="response.autoGradeResults" class="text-sm font-medium text-theme-600">
        {{ response.autoGradeResults.totalPointsEarned }} / {{ response.autoGradeResults.totalPossiblePoints }}
      </div>
      <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Student {
  id: string
  name: string
}

interface GradeResults {
  totalPointsEarned: number
  totalPossiblePoints: number
}

interface QuizResponse {
  id: string
  createdAt: any
  studentId?: string
  autoGradeResults: GradeResults | null
}

const props = defineProps<{
  response: QuizResponse
  student: Student | null
}>()

const isProcessing = computed(() => {
  if (props.student) return false

  // Check if response was created in last 30 seconds
  const now = new Date()
  const createdAt = props.response.createdAt
  if (!createdAt) return false
  
  const diffInSeconds = (now.getTime() - createdAt.getTime()) / 1000
  return diffInSeconds <= 30
})

const formatDate = (date: any) => {
  if (!date) return ''
  const d = typeof date.toDate === 'function' ? date.toDate() : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(d)
}
</script>
