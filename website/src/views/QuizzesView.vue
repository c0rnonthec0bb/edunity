<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizzes } from '@/composables/useQuizzes'
import SubHeader from '@/components/SubHeader.vue'
import Modal from '@/components/Modal.vue'
import { nanoid } from 'nanoid'

const router = useRouter()
const { quizzes, loading, error, addQuiz } = useQuizzes()

const showCreateModal = ref(false)
const newQuizName = ref('')

const handleCreateQuiz = async () => {
  if (!newQuizName.value) return

  await addQuiz({
    id: nanoid(),
    name: newQuizName.value,
    questions: []
  })

  newQuizName.value = ''
  showCreateModal.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <SubHeader title="Quizzes">
      <template #action>
        <button
          @click="showCreateModal = true"
          class="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </template>
    </SubHeader>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Error message -->
      <div v-if="error" class="text-red-600 mb-4">
        {{ error }}
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-gray-600">
        Loading quizzes...
      </div>

      <!-- Empty state -->
      <div
        v-else-if="quizzes.length === 0"
        class="text-center py-12"
      >
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No quizzes yet
        </h3>
        <p class="text-gray-600">
          Get started by adding your first quiz.
        </p>
      </div>

      <!-- Quiz list -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="quiz in quizzes"
          :key="quiz.id"
          @click="router.push({ name: 'quiz', params: { quizId: quiz.id } })"
          class="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 space-y-2 cursor-pointer"
        >
          <h3 class="text-lg font-medium text-gray-900">{{ quiz.name }}</h3>
          <p class="text-sm text-gray-500">{{ quiz.questions?.length || 0 }} questions</p>
        </div>
      </div>
    </main>

    <Modal
      v-model="showCreateModal"
      title="Create New Quiz"
      :actions="[
        { label: 'Cancel', onClick: () => showCreateModal = false },
        { label: 'Create Quiz', onClick: handleCreateQuiz }
      ]"
    >
      <div class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">
            Quiz Name
          </label>
          <input
            id="name"
            v-model="newQuizName"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-sm"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>
