<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuizzes } from '@/composables/useQuizzes'
import { useDebounce } from '@/composables/useDebounce'

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
    <input
      v-model="quizName"
      type="text"
      placeholder="Quiz Name"
      class="w-full px-4 py-2 text-xl font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent"
    />
  </div>
</template>
