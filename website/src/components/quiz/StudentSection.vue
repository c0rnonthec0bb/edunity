<template>
  <div class="p-4 bg-white border rounded-lg shadow-sm">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Student</h2>
      <button
        @click="showStudentModal = true"
        :disabled="isProcessingStudent"
        class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Edit
      </button>
    </div>

    <div v-if="isProcessingStudent" class="flex items-center text-blue-700">
      <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p>Identifying student...</p>
    </div>
    <div v-else-if="student" class="space-y-4">
      <div class="flex justify-between items-center p-4 pr-1 border-2 border-gray-200 rounded-lg bg-gray-100">
        <h3 class="font-medium text-gray-900">{{ student.name }}</h3>
        <router-link
          :to="{ name: 'student', params: { studentId: student.id } }"
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View profile
          <svg class="ml-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </router-link>
      </div>
      <div v-if="student.photoUrl" class="flex-shrink-0">
        <img class="h-24 w-24 rounded-full" :src="student.photoUrl" :alt="student.name">
      </div>
    </div>
    <div v-else class="text-gray-500 italic">
      No student assigned
    </div>
  </div>

  <!-- Student Selection Modal -->
  <div v-if="showStudentModal" class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4" @click.self="showStudentModal = false">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-lg font-medium text-gray-900">Select Student</h3>
        <button @click="showStudentModal = false" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mb-4">
        <TextInput
          v-model="searchQuery"
          placeholder="Search students..."
          type="text"
        />
      </div>

      <div class="space-y-2 max-h-96 overflow-y-auto">
        <button
          v-for="s in filteredStudents"
          :key="s.id"
          @click="selectStudent(s.id)"
          class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :class="{
            'bg-indigo-50': student?.id === s.id
          }"
        >
          <div class="flex items-center">
            <div v-if="s.photoUrl" class="flex-shrink-0 mr-3">
              <img class="h-10 w-10 rounded-full" :src="s.photoUrl" :alt="s.name">
            </div>
            <div class="flex-1">
              <div class="font-medium text-gray-900">{{ s.name }}</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TextInput from '@/components/TextInput.vue'

interface Student {
  id: string
  name: string
  photoUrl?: string
}

const props = defineProps<{
  student: Student | null
  students: Student[]
  isProcessingStudent: boolean
}>()

const emit = defineEmits<{
  (e: 'select-student', studentId: string): void
}>()

const showStudentModal = ref(false)
const searchQuery = ref('')

const filteredStudents = computed(() => {
  return props.students
    .filter(s => s.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const selectStudent = (studentId: string) => {
  emit('selectStudent', studentId)
  showStudentModal.value = false
}
</script>
