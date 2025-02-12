<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button'
import QuizSetup from '@/components/QuizSetup.vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { useQuizzes } from '@/composables/useQuizzes'

const route = useRoute()
const toast = useToast()
const fileupload = ref()
const uploadedText = ref('')
const generatedQuestions = ref([])
const isGenerating = ref(false)
const { updateQuiz } = useQuizzes()

interface GeneratedQuestion {
  question: string
  answer: string
  points: number
}

const generateQuestions = async () => {
  if (!uploadedText.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No text to generate questions from.', life: 3000 })
    return
  }

  isGenerating.value = true
  try {
    const response = await axios.post('http://localhost:5000/generate-questions', {
      text: uploadedText.value
    })

    generatedQuestions.value = response.data.questions
    toast.add({ severity: 'success', summary: 'Success', detail: 'Questions generated!', life: 3000 })

    // If we have a quiz ID, automatically add the questions to the quiz
    if (route.params.quizId) {
      await addQuestionsToQuiz(response.data.questions)
    }
  } catch (error) {
    console.error('Failed to generate questions:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to generate questions.', life: 3000 })
  } finally {
    isGenerating.value = false
  }
}

const addQuestionsToQuiz = async (questions: GeneratedQuestion[]) => {
  if (!route.params.quizId) return

  try {
    await updateQuiz(route.params.quizId as string, {
      questions: questions.map(q => ({
        id: Math.random().toString(36).substr(2, 9),
        question: q.question,
        answer: q.answer,
        points: q.points || 5
      }))
    })
    toast.add({ severity: 'success', summary: 'Success', detail: 'Questions added to quiz!', life: 3000 })
  } catch (error) {
    console.error('Failed to add questions to quiz:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add questions to quiz.', life: 3000 })
  }
}

const upload = async () => {
  if (!fileupload.value) {
    console.error("FileUpload component not found.")
    return
  }

  const file = fileupload.value.files[0]
  if (!file) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No file selected.', life: 3000 })
    return
  }

  const formData = new FormData()
  formData.append("file", file)

  try {
    const response = await axios.post("http://localhost:5000/upload", formData)
    uploadedText.value = response.data.text
    toast.add({ severity: 'success', summary: 'Success', detail: 'File uploaded and text extracted!', life: 3000 })
    
    // Automatically generate questions after text extraction
    await generateQuestions()
  } catch (error) {
    console.error("Upload failed:", error)
    toast.add({ severity: 'error', summary: 'Upload Failed', detail: 'Could not process file.', life: 3000 })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="card">
      <Toast />
      <div class="flex gap-2 justify-center">
        <div class="flex-1">
          <FileUpload 
            ref="fileupload" 
            mode="basic" 
            name="file" 
            url="/api/upload" 
            accept="application/pdf" 
            :maxFileSize="5000000" 
            @upload="upload"
            class="w-full"
          />
        </div>
        <Button label="Upload" @click="upload" severity="secondary" class="flex-1" />
      </div>
    </div>

    <!-- Display Extracted Text -->
    <div v-if="uploadedText" class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-2">Extracted Text</h3>
      <p class="text-gray-600 whitespace-pre-wrap">{{ uploadedText }}</p>
      
      <div class="mt-4">
        <Button 
          label="Generate Questions" 
          @click="generateQuestions" 
          :loading="isGenerating"
          :disabled="isGenerating"
          severity="primary" 
          class="w-full"
        />
      </div>
    </div>

    <!-- Display AI-Generated Questions -->
    <div v-if="generatedQuestions.length" class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-2">Generated Questions</h3>
      <ul class="space-y-4">
        <li 
          v-for="(question, index) in generatedQuestions" 
          :key="index" 
          class="border rounded-lg p-4 bg-gray-50"
        >
          <div class="font-medium">Question {{ index + 1 }}:</div>
          <div class="mt-1">{{ question.question }}</div>
          <div class="mt-2 text-sm text-gray-600">
            <span class="font-medium">Answer:</span> {{ question.answer }}
          </div>
          <div class="mt-1 text-sm text-gray-500">
            <span class="font-medium">Points:</span> {{ question.points }}
          </div>
        </li>
      </ul>
    </div>

    <QuizSetup :quiz-id="route.params.quizId" />
  </div>
</template>
