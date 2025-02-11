<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button'
import QuizSetup from '@/components/QuizSetup.vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const toast = useToast()
const fileupload = ref()
const uploadedText = ref('')
const generatedQuestions = ref([])

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
  } catch (error) {
    console.error("Upload failed:", error)
    toast.add({ severity: 'error', summary: 'Upload Failed', detail: 'Could not process file.', life: 3000 })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="card flex flex-col gap-6 items-center justify-center">
      <Toast />
      <FileUpload 
        ref="fileupload" 
        mode="basic" 
        name="file" 
        url="/api/upload" 
        accept="application/pdf" 
        :maxFileSize="5000000" 
        @upload="upload" 
      />
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

    <QuizSetup :quiz-id="route.params.quizId" />
  </div>
</template>
