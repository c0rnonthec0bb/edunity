<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuizzes } from '@/composables/useQuizzes'
import { useDebounce } from '@/composables/useDebounce'
import { useQuizResponses } from '@/composables/useQuizResponses'
import SubHeader from '@/components/SubHeader.vue'
import QuizSetup from '@/components/QuizSetup.vue'
import Modal from '@/components/Modal.vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import Button from 'primevue/button'

const router = useRouter()
const route = useRoute()
const { quizzes, loading, error: quizError, deleteQuiz, updateQuiz } = useQuizzes()
const { responses, error: responsesError } = useQuizResponses({ 
  quizId: route.params.quizId as string 
})

const toast = useToast()
const showDeleteModal = ref(false)
const showUploadModal = ref(false)

const quiz = computed(() => 
  quizzes.value.find(q => q.id === route.params.quizId)
)

const quizName = ref(quiz.value?.name || '')
const debouncedName = useDebounce(quizName, 500)

watch(() => quiz.value?.name, (newName) => {
  if (newName && newName !== quizName.value) {
    quizName.value = newName
  }
})

watch(debouncedName, async (newName) => {
  if (quiz.value && newName !== quiz.value.name) {
    await updateQuiz(quiz.value.id, {
      name: newName
    })
  }
})

const handleDelete = async () => {
  await deleteQuiz(route.params.quizId as string)
  router.push({ name: 'quizzes' })
}

const tabs = [
  { label: 'Overview', route: 'quiz-overview' },
  { label: 'Questions', route: 'quiz-questions' },
  { label: 'Student Responses', route: 'quiz-responses' }
]
</script>

<template>
  <div>
    <Toast />
    <SubHeader 
      :title="quiz?.name || ''"
      super-title="Quiz"
    >
      <template #action>
        <button
          @click="showDeleteModal = true"
          class="p-2 text-gray-400 hover:text-gray-500"
          title="Delete Quiz"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </template>

      <template #tabs>
        <div class="flex space-x-4 whitespace-nowrap">
          <div 
            v-for="tab in tabs" 
            :key="tab.route" 
            :class="{
              'bg-theme-100 text-theme-900 border-theme-200': route.name === tab.route,
              'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200': route.name !== tab.route
            }" 
            @click="router.push({ name: tab.route, params: { quizId: route.params.quizId }})"
            class="px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors duration-200 flex-shrink-0 border"
          >
            {{ tab.label }}
          </div>
        </div>
      </template>
    </SubHeader>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view></router-view>
    </main>

    <Modal
      v-model="showDeleteModal"
      title="Delete Quiz"
      :actions="[
        { label: 'Cancel', onClick: () => showDeleteModal = false },
        { label: 'Delete', onClick: handleDelete, variant: 'danger' }
      ]"
    >
      <p class="text-gray-700">
        Are you sure you want to delete this quiz? This action cannot be undone.
      </p>
    </Modal>
  </div>
</template>
