# /Users/adam/Git/Personal/edunity/website/src/components/quiz/QuizSummarySection.vue
<template>
  <div class="p-4 bg-white border rounded-lg shadow-sm">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Results Summary</h2>
      <div class="flex items-center gap-2">
        <button
          @click="handleResummarize"
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          Resummarize
        </button>
      </div>
    </div>

    <div v-if="averageScore !== null" class="flex items-center gap-2 mb-4">
      <div class="text-lg font-medium text-gray-900">
        Average Score: {{ averageScore.toFixed(1) }}
      </div>
      <div class="text-sm text-gray-500">
        / {{ quiz.totalPossiblePoints || 0 }} points
      </div>
    </div>

    <div v-if="isLoading" class="flex items-center text-blue-700">
      <LoadingSpinner class="mr-2" />
      <p>Generating summary...</p>
    </div>
    <div v-else-if="quiz.quizResponsesSummary" class="prose text-gray-700 prose-sm max-w-none whitespace-pre-line">
      {{ quiz.quizResponsesSummary }}
    </div>
    <div v-else-if="!isLoading" class="text-gray-500 italic">
      No summary available yet
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { firestore } from '@/firebase'
import { useQuizzes } from '@/composables/useQuizzes'
import LoadingSpinner from '../LoadingSpinner.vue'

const props = defineProps<{
  quiz: {
    id: string
    totalPossiblePoints?: number
    quizResponsesAverageFractionalScore?: number
    quizResponsesSummary?: string
    quizResponsesSummaryShouldRunDate?: number
    quizResponsesSummaryStartDate?: number
    quizResponsesSummaryEndDate?: number
  }
}>()

const { updateQuiz } = useQuizzes()

const averageScore = computed(() => {
  if (props.quiz.quizResponsesAverageFractionalScore === undefined || !props.quiz.totalPossiblePoints) {
    return null
  }
  return props.quiz.quizResponsesAverageFractionalScore * props.quiz.totalPossiblePoints
})

const isLoading = computed(() => {
  const shouldRunDate = props.quiz.quizResponsesSummaryShouldRunDate
  const startDate = props.quiz.quizResponsesSummaryStartDate
  const endDate = props.quiz.quizResponsesSummaryEndDate
  const thirtySecondsAgo = Date.now() - 30000

  return (shouldRunDate && shouldRunDate > thirtySecondsAgo && (!endDate || shouldRunDate > endDate)) ||
         (startDate && startDate > thirtySecondsAgo && (!endDate || startDate > endDate))
})

const handleResummarize = async () => {
  await updateQuiz(props.quiz.id, {
    quizResponsesSummaryShouldRunDate: firestore.serverTimestamp()
  })
}
</script>
