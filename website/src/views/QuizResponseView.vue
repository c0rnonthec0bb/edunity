<template>
  <div class="min-h-screen bg-gray-50">
    <SubHeader 
      title="Student Response"
      super-title="Quiz"
      :back-route="{ name: 'quiz-responses', params: { quizId: route.params.quizId }}"
    >
      <template #action>
        <button
          @click="confirmDelete = true"
          class="p-2 text-gray-400 hover:text-gray-500"
          title="Delete Response"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </template>
    </SubHeader>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-6">
          <div class="aspect-[3/4] bg-black rounded-lg overflow-hidden">
            <img 
              v-if="photoUrl"
              :src="photoUrl" 
              class="w-full h-full object-cover"
              alt="Response photo"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-white">
              Loading photo...
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <Modal
      v-model="confirmDelete"
      title="Delete Response"
      :actions="[
        { label: 'Cancel', onClick: () => confirmDelete = false },
        { label: 'Delete', onClick: handleDelete, variant: 'danger' }
      ]"
    >
      <p class="text-gray-700">
        Are you sure you want to delete this response? This action cannot be undone.
      </p>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizResponses } from '@/composables/useQuizResponses'
import Modal from '@/components/Modal.vue'
import SubHeader from '@/components/SubHeader.vue'
import { storage } from '@/firebase'
import { getDownloadURL, ref as storageRef } from 'firebase/storage'

const route = useRoute()
const router = useRouter()
const quizId = route.params.quizId as string
const responseId = route.params.responseId as string
const { getQuizResponse, deleteQuizResponse } = useQuizResponses()

const response = ref(null)
const photoUrl = ref('')
const confirmDelete = ref(false)

onMounted(async () => {
  response.value = await getQuizResponse(quizId, responseId)
  if (response.value?.photoCapturePath) {
    const photoRef = storageRef(storage, response.value.photoCapturePath)
    photoUrl.value = await getDownloadURL(photoRef)
  }
})

const handleDelete = async () => {
  try {
    await deleteQuizResponse(quizId, responseId)
    router.push({ name: 'quiz-responses', params: { quizId } })
  } catch (err) {
    console.error('Failed to delete response:', err)
  }
}
</script>
