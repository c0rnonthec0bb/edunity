<template>
  <div class="p-4 bg-white border rounded-lg shadow-sm space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold text-gray-900">Upload</h2>
      <button
        @click="$emit('reprocess')"
        :disabled="isProcessingParse"
        class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reprocess
      </button>
    </div>

    <div v-if="isProcessingParse" class="flex items-center text-blue-700">
      <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p>Processing image...</p>
    </div>

    <!-- Error Message -->
    <div v-if="photoCaptureError" class="p-4 border-2 border-red-200 rounded-lg bg-red-50 text-red-700">
      <div class="flex items-center">
        <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p>{{ photoCaptureError }}</p>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="parsedInfo" class="p-4 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-700">
      <div class="flex items-center">
        <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <p>Image processed successfully!</p>
      </div>
    </div>

    <!-- Image Display -->
    <div v-if="imageUrl" class="mb-4">
      <div class="relative w-full pb-[133.33%]"> <!-- 3:4 aspect ratio (75% width = 4:3, 133.33% = 3:4) -->
        <img 
          :src="imageUrl" 
          alt="Student's quiz response" 
          class="absolute inset-0 w-full h-full object-cover rounded-lg border border-gray-200"
        />
      </div>
    </div>

    <!-- Parsed Info Display -->
    <div v-if="parsedInfo" class="p-4 border border-gray-200 rounded-lg">
      <div class="flex justify-between items-center">
        <h3 class="font-medium text-gray-700">Processed Data</h3>
        <button
          @click="$emit('update:show-parsed-data', !showParsedData)"
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg 
            v-if="showParsedData"
            class="h-4 w-4 mr-1.5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          <svg 
            v-else
            class="h-4 w-4 mr-1.5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          {{ showParsedData ? 'Hide' : 'Show' }}
        </button>
      </div>

      <div v-if="showParsedData" class="space-y-4 text-sm mt-4">
        <!-- Student Name -->
        <div v-if="parsedInfo.studentName" class="space-y-1">
          <h3 class="font-medium text-gray-700">Student Name</h3>
          <p class="text-gray-900">{{ parsedInfo.studentName }}</p>
        </div>

        <!-- Description -->
        <div v-if="parsedInfo.description" class="space-y-1">
          <h3 class="font-medium text-gray-700">Description</h3>
          <p class="text-gray-900">{{ parsedInfo.description }}</p>
        </div>

        <!-- Answers -->
        <div v-if="parsedInfo.answers" class="space-y-2">
          <h3 class="font-medium text-gray-700">Answers</h3>
          <div 
            v-for="item in sortedAnswers" 
            :key="item.questionId" 
            class="pl-4 border-l-2 border-gray-200"
          >
            <p class="text-gray-500">Question {{ findQuestionNumber(item.questionId) }}</p>
            <p class="text-gray-900">{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { storage } from '@/firebase'
import { ref as storageRef, getDownloadURL } from 'firebase/storage'

interface QuizQuestion {
  id: string
  index: number
  // Add other properties as needed
}

interface ParsedInfo {
  studentName?: string
  description?: string
  answers?: Record<string, string>
}

const props = defineProps<{
  photoCapturePath: string | null
  photoCaptureError: string | null
  parsedInfo: ParsedInfo | null
  isProcessingParse: boolean
  showParsedData: boolean
  quiz: {
    questions: QuizQuestion[]
  }
}>()

defineEmits<{
  (e: 'reprocess'): void
  (e: 'update:show-parsed-data', value: boolean): void
}>()

const imageUrl = ref<string | null>(null)

const sortedAnswers = computed(() => {
  if (!props.parsedInfo?.answers) return []
  
  return Object.entries(props.parsedInfo.answers)
    .map(([questionId, answer]) => ({
      questionId,
      answer,
      index: props.quiz.questions.findIndex(q => q.id === questionId)
    }))
    .sort((a, b) => a.index - b.index)
})

const updateImageUrl = async (path: string | null) => {
  if (path) {
    try {
      const photoRef = storageRef(storage, path)
      imageUrl.value = await getDownloadURL(photoRef)
    } catch (error) {
      console.error('Error getting photo URL:', error)
      imageUrl.value = null
    }
  } else {
    imageUrl.value = null
  }
}

watch(() => props.photoCapturePath, (newPath) => {
  updateImageUrl(newPath)
}, { immediate: true })

const findQuestionNumber = (questionId: string) => {
  const index = props.quiz.questions.findIndex(q => q.id === questionId)
  return index > -1 ? index + 1 : questionId
}
</script>
