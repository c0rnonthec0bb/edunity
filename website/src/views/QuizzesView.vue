<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizzes } from '../composables/useQuizzes'
import SubHeader from '../components/SubHeader.vue'
import Modal from '../components/Modal.vue'

const router = useRouter()
const { quizzes, loading, error, addQuiz } = useQuizzes()

const showAddModal = ref(false)
const newQuizName = ref('')

const handleAddQuiz = async () => {
  await addQuiz(newQuizName.value)
  newQuizName.value = ''
  showAddModal.value = false
}
</script>

<template>
  <div>
    <SubHeader title="Quizzes">
      <template #action>
        <button
          @click="showAddModal = true"
          class="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </template>
    </SubHeader>

    <div class="max-w-7xl mx-auto px-6 sm:px-8 py-6">
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
      <div v-else class="space-y-4">
        <div
          v-for="quiz in quizzes"
          :key="quiz.id"
          @click="router.push({ name: 'quiz', params: { quizId: quiz.id } })"
          class="bg-white p-4 rounded-lg shadow flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <span class="text-gray-900">{{ quiz.name }}</span>
          <svg
            class="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      <!-- Add Quiz Modal -->
      <Modal
        v-model="showAddModal"
        title="Add New Quiz"
        confirm-text="Add Quiz"
        cancel-text="Cancel"
        max-width="max-w-md"
        @confirm="handleAddQuiz"
      >
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              v-model="newQuizName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-theme-500 focus:border-theme-500"
              placeholder="Enter quiz name"
              @keyup.enter="handleAddQuiz"
            />
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>
