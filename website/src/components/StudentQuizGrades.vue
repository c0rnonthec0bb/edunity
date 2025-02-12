<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuizResponses } from '@/composables/useQuizResponses'
import { useQuizzes } from '@/composables/useQuizzes'
import { formatDate } from '@/utils/date'

const props = defineProps<{
  studentId: string
}>()

const { responses, loading: loadingResponses } = useQuizResponses({ studentId: props.studentId })
const { quizzes, loading: loadingQuizzes } = useQuizzes()

const loading = computed(() => loadingResponses.value || loadingQuizzes.value)

const quizGrades = computed(() => {
  console.log('Raw responses:', responses.value)
  console.log('Raw quizzes:', quizzes.value)
  
  console.log('Processing responses:', responses.value)
  
  const mappedGrades = responses.value.map(response => {
    const quiz = quizzes.value.find(q => q.id === response.quizId)
    console.log('Found quiz:', quiz, 'for quizId:', response.quizId)
    
    const date = response.createdAt?.toDate ? response.createdAt.toDate() : 
                response.createdAt instanceof Date ? response.createdAt : 
                new Date(response.createdAt)
    
    const score = Number(response.score)
    const maxScore = Number(response.maxScore)
    
    const grade = {
      id: response.id,
      quizName: quiz?.name || `Quiz ${formatDate(date, 'M/D')}`,
      score: score,
      maxScore: maxScore,
      percentage: (score / maxScore) * 100,
      submittedAt: date,
      formattedDate: formatDate(date)
    }
    
    console.log('Processed grade:', grade)
    return grade
  })
  
  console.log('Final mapped grades:', mappedGrades)
  
  return mappedGrades.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
})
</script>

<template>
  <div class="space-y-4">
    <!-- Loading state -->
    <div v-if="loading" class="text-gray-600">
      Loading quiz grades...
    </div>

    <!-- No grades -->
    <div v-else-if="quizGrades.length === 0" class="text-gray-600">
      No quiz grades available.
    </div>

    <!-- Grades list -->
    <div v-else class="space-y-4">
      <div v-for="grade in quizGrades" :key="grade.id" class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ grade.quizName }}</h3>
            <p class="text-sm text-gray-500">Submitted {{ grade.formattedDate }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-semibold text-gray-900">
              {{ grade.score }} / {{ grade.maxScore }}
            </p>
            <p class="text-sm text-gray-500">
              {{ Math.round(grade.percentage) }}%
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
        quizName: quiz?.name || 'Unknown Quiz',
        date: response.createdAt ? formatDate(response.createdAt) : 'Unknown Date',
        score: response.score || 0
      }
    })
    .sort((a, b) => b.createdAt - a.createdAt)
})
&lt;/script>

&lt;template>
  &lt;div class="space-y-4">
    &lt;div v-if="loading" class="flex justify-center">
      &lt;span class="loading loading-spinner loading-md">&lt;/span>
    &lt;/div>
    
    &lt;div v-else-if="quizGrades.length === 0" class="text-center text-gray-500">
      No quiz attempts yet
    &lt;/div>
    
    &lt;div v-else class="overflow-x-auto">
      &lt;table class="table w-full">
        &lt;thead>
          &lt;tr>
            &lt;th>Quiz Name&lt;/th>
            &lt;th>Date&lt;/th>
            &lt;th>Score&lt;/th>
          &lt;/tr>
        &lt;/thead>
        &lt;tbody>
          &lt;tr v-for="grade in quizGrades" :key="grade.id">
            &lt;td>{{ grade.quizName }}&lt;/td>
            &lt;td>{{ grade.date }}&lt;/td>
            &lt;td>{{ grade.score }}&lt;/td>
          &lt;/tr>
        &lt;/tbody>
      &lt;/table>
    &lt;/div>
  &lt;/div>
&lt;/template>
