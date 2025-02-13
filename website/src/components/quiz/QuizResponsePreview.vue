<template>
  <div class="flex items-center justify-between bg-white rounded-lg shadow hover:shadow-md transition-shadow px-4 py-3 hover:bg-gray-100">
    <div class="min-w-0 flex-1">
      <div v-if="student" class="text-m font-medium text-gray-900">
        {{ student.name }}
      </div>
      <div v-else class="text-m font-medium text-red-600">
        Unassigned
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
  createdAt: Date
  autoGradeResults: GradeResults | null
}

defineProps<{
  response: QuizResponse
  student: Student | null
}>()

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)
}
</script>
