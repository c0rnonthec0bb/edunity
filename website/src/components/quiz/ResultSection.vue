<template>
  <div class="p-4 bg-white border rounded-lg shadow-sm">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Result</h2>
      <button
        @click="$emit('regrade')"
        :disabled="isProcessingGrade"
        class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Regrade
      </button>
    </div>

    <div v-if="isProcessingGrade" class="flex items-center text-blue-700">
      <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p>Grading quiz...</p>
    </div>
    <div v-else-if="gradeResults" class="space-y-6">
      <!-- Total Score -->
      <div class="text-center p-4 border-4 border-theme-600 rounded-lg bg-theme-100">
        <div class="text-5xl font-bold text-theme-600">
          {{ gradeResults.totalPointsEarned }} / {{ gradeResults.totalPossiblePoints }}
        </div>
        <div class="text-theme-600 mt-1 font-medium">points</div>
      </div>
      
      <!-- Summary -->
      <div class="text-gray-700 whitespace-pre-line">
        {{ gradeResults.summary }}
      </div>

      <!-- Questions -->
      <div class="space-y-4">
        <h3 class="font-medium text-gray-900 text-lg">Questions</h3>
        <div 
          v-for="(grade, index) in sortedQuestionGrades" 
          :key="grade.questionId" 
          class="border-t pt-4"
        >
          <div class="flex gap-3">
            <div class="flex-none">
              <div class="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center">
                <span class="text-sm font-medium text-white">{{ index + 1 }}</span>
              </div>
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ getQuestionText(grade.questionId) }}</p>
              <p class="text-gray-700 mt-1">{{ grade.studentAnswer }}</p>
            </div>
            <div class="flex-none flex items-center space-x-2 mb-auto">
              <span class="text-sm font-medium text-theme-600">
                {{ grade.pointsEarned }}/{{ grade.maxPoints }}
              </span>
              <button
                @click="showExplanation(grade.questionId)"
                class="inline-flex items-center justify-center w-6 h-6 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="Show explanation"
              >
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M12 21a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-gray-500 italic">
      No grade formulated
    </div>
  </div>

  <!-- Explanation Modal -->
  <div v-if="showingExplanation" class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4" @click.self="showingExplanation = null">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
      <div class="flex justify-between items-start">
        <h3 class="text-lg font-medium text-gray-900">Explanation</h3>
        <button @click="showingExplanation = null" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="mt-4 text-gray-700">
        {{ currentExplanation }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QuizQuestion } from '@/types'

interface GradeResults {
  totalPointsEarned: number
  totalPossiblePoints: number
  summary: string
  questionGrades: Array<{
    questionId: string
    studentAnswer: string
    pointsEarned: number
    maxPoints: number
    explanation: string
  }>
}

const props = defineProps<{
  gradeResults: GradeResults | null
  isProcessingGrade: boolean
  quiz: {
    questions: QuizQuestion[]
  } | null
}>()

const showingExplanation = ref<string | null>(null)

const currentExplanation = computed(() => {
  if (!showingExplanation.value || !props.gradeResults) return ''
  const grade = props.gradeResults.questionGrades.find(g => g.questionId === showingExplanation.value)
  return grade?.explanation || ''
})

const sortedQuestionGrades = computed(() => {
  if (!props.gradeResults || !props.quiz?.questions) return []
  
  // Create a map of question IDs to their indices
  const questionIndices = new Map(
    props.quiz.questions.map((q, index) => [q.id, index])
  )
  
  // Sort question grades by their index in the quiz
  return [...props.gradeResults.questionGrades].sort((a, b) => {
    const indexA = questionIndices.get(a.questionId) ?? 0
    const indexB = questionIndices.get(b.questionId) ?? 0
    return indexA - indexB
  })
})

const showExplanation = (questionId: string) => {
  showingExplanation.value = questionId
}

const getQuestionText = (questionId: string) => {
  return props.quiz?.questions?.find(q => q.id === questionId)?.question || ''
}
</script>
