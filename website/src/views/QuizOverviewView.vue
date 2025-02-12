<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuizzes } from '@/composables/useQuizzes'
import { useDebounce } from '@/composables/useDebounce'
import TextInput from '@/components/TextInput.vue'
import QuizSummarySection from '@/components/quiz/QuizSummarySection.vue'

const route = useRoute()
const quizId = route.params.quizId as string
const { quizzes, updateQuiz } = useQuizzes()

const quiz = computed(() => quizzes.value.find(q => q.id === quizId))
const quizName = ref(quiz.value?.name || '')
const debouncedName = useDebounce(quizName, 500)

watch(() => quiz.value?.name, (newName) => {
  if (newName && newName !== quizName.value) {
    quizName.value = newName
  }
})

watch(debouncedName, async (newName) => {
  if (quiz.value && newName !== quiz.value.name) {
    await updateQuiz(quizId, { name: newName })
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow">
      <div class="p-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Quiz Name</label>
          <TextInput
            v-model="quizName"
            placeholder="Enter quiz name"
          />
        </div>
      </div>
    </div>
    <QuizSummarySection
      v-if="quiz"
      :quiz="quiz"
    />
  </div>
</template>
