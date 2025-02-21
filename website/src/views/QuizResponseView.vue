<template>
  <div class="min-h-screen bg-gray-100">
    <SubHeader
      :title="quiz?.name || 'Loading...'"
      super-title="Quiz Response"
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
      <div v-if="!response" class="flex items-center justify-center h-64">
        <div role="status">
          <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
      </div>

      <div v-else class="space-y-4">
        <StudentSection
          v-if="response"
          :student="student"
          :students="students"
          :isProcessingStudent="isProcessingStudent"
          @selectStudent="selectStudent"
        />

        <ResultSection
          v-if="response && quiz"
          :gradeResults="response.autoGradeResults || null"
          :isProcessingGrade="isProcessingGrade"
          :quiz="quiz"
          @regrade="handleRegrade"
        />

        <UploadSection
          v-if="response"
          :photoCapturePath="response.photoCapturePath || null"
          :photoCaptureError="response.photoCaptureError || null"
          :parsedInfo="response.photoCaptureParsedInfo || null"
          :isProcessingParse="isProcessingParse"
          :showParsedData="showParsedData"
          :quiz="quiz"
          @reprocess="handleReParse"
          @update:showParsedData="showParsedData = $event"
        />
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <Modal
      v-model="confirmDelete"
      title="Delete Response"
      :actions="[
        { label: 'Cancel', onClick: () => confirmDelete = false },
        { label: 'Delete', onClick: handleDelete, isDanger: true }
      ]"
    >
      <p class="text-gray-700">
        Are you sure you want to delete this response? This action cannot be undone.
      </p>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuiz } from '@/composables/useQuizzes'
import { useQuizResponse } from '@/composables/useQuizResponse'
import { useQuizResponses } from '@/composables/useQuizResponses'
import { useStudents } from '@/composables/useStudents'
import { usePageTitle } from '@/composables/usePageTitle'
import SubHeader from '@/components/SubHeader.vue'
import Modal from '@/components/Modal.vue'
import StudentSection from '@/components/quiz/StudentSection.vue'
import ResultSection from '@/components/quiz/ResultSection.vue'
import UploadSection from '@/components/quiz/UploadSection.vue'

const route = useRoute()
const { quiz } = useQuiz(route.params.quizId as string)
const { 
  response,
  student,
  students,
  isProcessingParse,
  isProcessingGrade,
  isProcessingStudent,
  studentsLoading,
  loadStudent,
  selectStudent,
  handleRegrade,
  handleReParse,
} = useQuizResponse()
const { deleteQuizResponse } = useQuizResponses({ quizId: route.params.quizId as string })
const { updateTitle } = usePageTitle()

const confirmDelete = ref(false)
const showParsedData = ref(false)

// Watch for changes in studentId
watch(() => response.value?.studentId, async (newId) => {
  if (newId) {
    await loadStudent(newId)
  }
}, { immediate: true })

// Update title when student is loaded
watch(student, (newStudent) => {
  if (newStudent) {
    updateTitle(`${newStudent.name}'s Response`)
  }
}, { immediate: true })

// Update page title when quiz loads
watch(quiz, (newQuiz) => {
  if (newQuiz) {
    updateTitle(newQuiz.name)
  }
}, { immediate: true })

const handleDelete = async () => {
  try {
    await deleteQuizResponse(route.params.quizId as string, route.params.responseId as string)
    confirmDelete.value = false
  } catch (error) {
    console.error('Error deleting response:', error)
  }
}
</script>
