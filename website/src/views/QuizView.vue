<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuizzes } from '../composables/useQuizzes'
import { useDebounce } from '../composables/useDebounce'
import { useQuizResponses } from '../composables/useQuizResponses'
import SubHeader from '../components/SubHeader.vue'
import QuizSetup from '../components/QuizSetup.vue'
import Modal from '../components/Modal.vue'
import CameraModal from '../components/CameraModal.vue'
import { useToast } from "primevue/usetoast";

const router = useRouter()
const route = useRoute()
const { quizzes, loading, error: quizError, deleteQuiz, updateQuiz } = useQuizzes()
const { responses, uploadingCount, error: responsesError, uploadResponse } = useQuizResponses(route.params.quizId as string)
const toast = useToast();
const fileupload = ref();

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

const showDeleteModal = ref(false)
const showCameraModal = ref(false)

const handleDelete = async () => {
  if (!quiz.value) return
  await deleteQuiz(quiz.value.id)
  router.push({ name: 'home' })
}

const handlePhotoUpload = async (photo: Blob) => {
  try {
    await uploadResponse(photo)
  } catch (err) {
    console.error('Failed to upload photo:', err)
  }
}

const tabs = [
  { label: 'Overview', route: 'quiz-overview' },
  { label: 'Questions', route: 'quiz-questions' },
  { label: 'Student Responses', route: 'quiz-responses' }
]

const upload = () => {
    fileupload.value.upload();
};

const onUpload = () => {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
};
</script>

<template>
  <div>
    <div class="card flex flex-col gap-6 items-center justify-center">
        <Toast />
        <FileUpload ref="fileupload" mode="basic" name="demo[]" url="/api/upload" accept="image/*" :maxFileSize="1000000" @upload="onUpload" />
        <Button label="Upload" @click="upload" severity="secondary" />
    </div>
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
    </SubHeader>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="quizError" class="text-red-600 mb-4">
        {{ quizError }}
      </div>

      <div v-else-if="!quiz" class="text-gray-500">
        Loading...
      </div>

      <div v-else>
        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex gap-6" aria-label="Tabs">
            <router-link
              v-for="tab in tabs"
              :key="tab.route"
              :to="{ name: tab.route, params: { quizId: quiz.id }}"
              class="py-4 px-1 border-b-2"
              :class="[
                route.name === tab.route
                  ? 'border-theme-500 text-theme-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.label }}
            </router-link>
          </nav>
        </div>

        <div class="mt-6">
          <!-- Overview Tab -->
          <div v-if="route.name === 'quiz-overview'" class="space-y-6">
            <div class="bg-white rounded-lg shadow">
              <div class="p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-2">Name</h3>
                <input
                  v-model="quizName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-theme-500 focus:border-theme-500"
                  placeholder="Unnamed Quiz"
                  @change="updateQuiz(quiz.id, { name: quizName })"
                />
              </div>
            </div>
          </div>

          <!-- Questions Tab -->
          <div v-else-if="route.name === 'quiz-questions'" class="space-y-6">
            <QuizSetup :quiz-id="quiz.id" />
          </div>

          <!-- Responses Tab -->
          <div v-else-if="route.name === 'quiz-responses'">
            <!-- Error message -->
            <div v-if="responsesError" class="text-red-600 mb-4">
              {{ responsesError }}
            </div>

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

            <div class="space-y-4">
              <router-link
                v-for="response in responses"
                :key="response.id"
                :to="{ name: 'quiz-response', params: { quizId: route.params.quizId, responseId: response.id }}"
                class="block bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-gray-500">
                      {{ new Date(response.createdAt.toDate()).toLocaleString() }}
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <Modal
      v-model="showDeleteModal"
      title="Delete Quiz"
      confirm-text="Delete Quiz"
      cancel-text="Cancel"
      :danger="true"
      max-width="max-w-md"
      @confirm="handleDelete"
    >
      <p class="text-gray-600">
        Are you sure you want to delete this quiz? This action cannot be undone.
      </p>
    </Modal>

    <!-- Camera Modal -->
    <CameraModal
      v-model="showCameraModal"
      @upload="handlePhotoUpload"
    />
  </div>
</template>