<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuizResponses } from '@/composables/useQuizResponses'
import { useStudents } from '@/composables/useStudents'
import CameraModal from '@/components/CameraModal.vue'
import Modal from '@/components/Modal.vue'
import QuizResponsePreview from '@/components/quiz/QuizResponsePreview.vue'

const route = useRoute()
const quizId = route.params.quizId as string

const { responses, responsesError, uploadingCount, uploadResponse } = useQuizResponses({
  quizId,
})

const { students, loading: studentsLoading } = useStudents()

const showCameraModal = ref(false)
const showDeleteModal = ref(false)

const handlePhotoUpload = async (photo: Blob) => {
  try {
    await uploadResponse(photo)
  } catch (error) {
    console.error('Error uploading photo:', error)
  }
}

const handleDelete = () => {
  console.log('Delete response')
  showDeleteModal.value = false
}

const getStudentForResponse = (response: {
  studentId: string | null
  manualStudentId: string | null
}) => {
  const studentId = response.manualStudentId || response.studentId
  if (!studentId) return null
  return students.value.find(s => s.id === studentId) || null
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Error message -->
    <div v-if="responsesError" class="text-red-600 mb-4">
      {{ responsesError }}
    </div>

    <!-- Upload button -->
    <button
      @click="showCameraModal = true"
      class="w-full inline-flex items-center justify-center px-4 py-2.5 bg-theme-500 text-white rounded-lg hover:bg-theme-600 transition-colors gap-2 mb-3 h-10"
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
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      {{ responses.length === 0 ? 'Upload Responses' : 'Upload More Responses' }}
    </button>

    <!-- Camera Modal -->
    <CameraModal
      v-model="showCameraModal"
      @upload="handlePhotoUpload"
    />

    <!-- Delete Modal -->
    <Modal
      v-if="showDeleteModal"
      title="Delete Response"
      @close="showDeleteModal = false"
    >
      <p class="text-gray-700 mb-4">
        Are you sure you want to delete this response?
      </p>
      <div class="flex justify-end space-x-2">
        <button
          @click="showDeleteModal = false"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          @click="handleDelete"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete
        </button>
      </div>
    </Modal>

    <!-- Uploading banner -->
    <div 
      v-if="uploadingCount > 0"
      class="flex items-center gap-3 bg-theme-50 text-theme-700 px-4 py-3 rounded-lg mb-3"
    >
      <svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {{ uploadingCount === 1 ? 'Response uploading...' : `${uploadingCount} responses uploading...` }}
    </div>

    <!-- Content -->
    <div class="space-y-4">
      <div v-if="!responses.length" class="p-4 text-center text-gray-500">
        No responses yet
      </div>
      <RouterLink
        v-else
        v-for="response in responses"
        :key="response.id"
        :to="{ name: 'quiz-response', params: { quizId, responseId: response.id } }"
      >
        <QuizResponsePreview
          :response="response"
          :student="getStudentForResponse(response)"
        />
      </RouterLink>
    </div>
  </div>
</template>
