<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuizResponses } from '@/composables/useQuizResponses'
import { useQuizzes } from '@/composables/useQuizzes'

const route = useRoute()
const studentId = route.params.studentId as string

const { quizzes } = useQuizzes()
const { responses, loading: responsesLoading } = useQuizResponses({
  studentId // Pass studentId to get responses for this student
})

// Get quiz info for each response
const responsesWithQuiz = computed(() => {
  return responses.value
    .filter(r => r.autoGradeResults) // Only show graded responses
    .map(response => {
      const quiz = quizzes.value.find(q => q.id === response.quizId)
      return {
        ...response,
        quiz
      }
    })
    .filter(r => r.quiz) // Only include responses where we found the quiz
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()) // Sort by date, newest first
})

const getScoreClass = (response: any) => {
  if (!response.autoGradeResults) return ''
  const { totalPointsEarned, totalPossiblePoints } = response.autoGradeResults
  if (totalPointsEarned === totalPossiblePoints) return 'text-green-600'
  if (totalPointsEarned > 0) return 'text-yellow-600'
  return 'text-red-600'
}

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

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="space-y-4">
      <div v-if="responsesLoading" class="p-4 text-center text-gray-500">
        Loading quiz responses...
      </div>
      <div v-else-if="!responsesWithQuiz.length" class="p-4 text-center text-gray-500">
        No quiz responses yet
      </div>
      <RouterLink
        v-else
        v-for="response in responsesWithQuiz"
        :key="response.id"
        :to="{ name: 'quiz-response', params: { quizId: response.quizId, responseId: response.id } }"
        class="block no-underline hover:no-underline hover:bg-transparent"
        >
        <div class="flex items-center justify-between bg-white rounded-lg shadow hover:shadow-md transition-shadow px-4 py-3 hover:bg-gray-100 gap-3">
          <div class="min-w-0 flex-1">
            <div class="text-m font-medium text-gray-900">
              {{ response.quiz?.name }}
            </div>
            <div class="text-sm text-gray-500">
              {{ formatDate(response.createdAt) }}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div v-if="response.autoGradeResults" class="text-sm font-medium" :class="getScoreClass(response)">
              {{ response.autoGradeResults.totalPointsEarned }} / {{ response.autoGradeResults.totalPossiblePoints }}
            </div>
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
