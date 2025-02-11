<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuizResponses } from '@/composables/useQuizResponses'
import CameraModal from '@/components/CameraModal.vue'
import Modal from '@/components/Modal.vue' // Import the Modal component

const route = useRoute()
const quizId = route.params.quizId as string
const { responses, uploadingCount, error: responsesError, uploadResponse } = useQuizResponses({ 
  quizId
})

const showCameraModal = ref(false)
const showDeleteModal = ref(false) // Add a ref for the delete modal

const handlePhotoUpload = async (photo: Blob) => {
  try {
    await uploadResponse(photo)
  } catch (err) {
    console.error('Failed to upload photo:', err)
  }
}

const handleDelete = () => { // Add a function for the delete action
  // Implement the delete logic here
  console.log('Delete response')
  showDeleteModal.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Error message -->
    <div v-if="responsesError" class="text-red-600 mb-4">
      {{ responsesError }}
    </div>

    <!-- Upload button -->
    <button
      @click="showCameraModal = true"
      class="w-full inline-flex items-center justify-center px-4 py-2.5 bg-theme-500 text-white rounded-lg hover:bg-theme-600 transition-colors gap-2 mb-6 h-10"
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

    <!-- Uploading banner -->
    <div 
      v-if="uploadingCount > 0"
      class="flex items-center gap-3 bg-theme-50 text-theme-700 px-4 py-3 rounded-lg mb-6"
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

    <!-- No responses message -->
    <div v-if="!responses.length" class="text-gray-500 text-center py-8">
      No responses yet
    </div>

    <!-- Response list -->
    <div v-else class="space-y-4">
      <router-link
        v-for="response in responses"
        :key="response.id"
        :to="{ name: 'quiz-response', params: { quizId, responseId: response.id }}"
        class="block bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">
              {{ new Date(response.createdAt).toLocaleString() }}
            </div>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>
    </div>

    <!-- Delete Modal -->
    <Modal
      v-model="showDeleteModal"
      title="Delete Response"
      :actions="[
        { label: 'Cancel', onClick: () => showDeleteModal = false },
        { label: 'Delete', onClick: () => handleDelete(), variant: 'danger' }
      ]"
    >
      <p class="text-gray-700">
        Are you sure you want to delete this response? This action cannot be undone.
      </p>
    </Modal>

    <!-- Camera Modal -->
    <CameraModal
      v-model="showCameraModal"
      @upload="handlePhotoUpload"
    />
  </div>
</template>
