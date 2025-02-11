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
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

import Toast from 'primevue/toast'
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button'

const router = useRouter()
const route = useRoute()
const { quizzes, loading, error: quizError, deleteQuiz, updateQuiz } = useQuizzes()
const { responses, uploadingCount, error: responsesError, uploadResponse } = useQuizResponses(route.params.quizId as string)

const toast = useToast();
const fileupload = ref();

const uploadedText = ref('');  // Store the extracted text from PDF
const generatedQuestions = ref([]); // Store AI-generated questions

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

// Modified upload function to handle PDF and extract text
const upload = async () => {
    if (!fileupload.value) {
        console.error("FileUpload component not found.");
        return;
    }

    const file = fileupload.value.files[0]; // Get uploaded file
    if (!file) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No file selected.', life: 3000 });
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        // Send file to backend for text extraction with pdfplumber
        const response = await axios.post("http://localhost:5000/upload", formData);
        uploadedText.value = response.data.text; // Store the extracted text

        // After extracting text, generate questions
        //generateQuestions();

        toast.add({ severity: 'success', summary: 'Success', detail: 'File uploaded and text extracted!', life: 3000 });
    } catch (error) {
        console.error("Upload failed:", error);
        toast.add({ severity: 'error', summary: 'Upload Failed', detail: 'Could not process file.', life: 3000 });
    }
};

/* // Function to generate questions using the extracted text
const generateQuestions = async () => {
    try {
        const response = await axios.post("http://localhost:5000/generate-questions", {
            text: uploadedText.value
        });
        generatedQuestions.value = response.data.questions;

        toast.add({ severity: 'success', summary: 'Success', detail: 'Questions Generated!', life: 3000 });
    } catch (error) {
        console.error("OpenAI request failed:", error);
        toast.add({ severity: 'error', summary: 'AI Error', detail: 'Could not generate questions.', life: 3000 });
    }
}; */

const onUpload = () => {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
};
</script>

<template>
  <div>
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
        <!-- Tabs for Navigation -->
        <div class="flex space-x-4 mb-6">
          <div 
            v-for="tab in tabs" 
            :key="tab.route" 
            :class="{'text-blue-600 font-semibold': route.name === tab.route, 'text-gray-500': route.name !== tab.route}" 
            @click="router.push({ name: tab.route })"
            class="cursor-pointer hover:text-blue-600"
          >
            {{ tab.label }}
          </div>
        </div>

        <div class="mt-6">
          <!-- Questions Tab -->
          <div v-if="route.name === 'quiz-questions'" class="space-y-6">
            <div class="card flex flex-col gap-6 items-center justify-center">
              <Toast />
              <FileUpload ref="fileupload" mode="basic" name="file" url="/api/upload" accept="application/pdf" 
                          :maxFileSize="5000000" @upload="upload" />
              <Button label="Upload and Generate" @click="upload" severity="secondary" />
            </div>

            <!-- Display Extracted Text -->
            <div v-if="uploadedText" class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Extracted Text</h3>
              <p class="text-gray-600 whitespace-pre-wrap">{{ uploadedText }}</p>
            </div>

            <!-- Display AI-Generated Questions -->
            <div v-if="generatedQuestions.length" class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Generated Questions</h3>
              <ul>
                <li v-for="(question, index) in generatedQuestions" :key="index" class="border p-2 mt-2">
                  {{ question }}
                </li>
              </ul>
            </div>

            <QuizSetup :quiz-id="quiz.id" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
