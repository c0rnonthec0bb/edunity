<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStudents } from '@/composables/useStudents'
import SubHeader from '@/components/SubHeader.vue'
import Modal from '@/components/Modal.vue'
import TextInput from '@/components/TextInput.vue'

const router = useRouter()
const { students, loading, error, addStudent } = useStudents()

const sortedStudents = computed(() => {
  return [...students.value].sort((a, b) => {
    const nameA = a.name?.trim() || 'Unnamed Student'
    const nameB = b.name?.trim() || 'Unnamed Student'
    return nameA.localeCompare(nameB)
  })
})

const showAddModal = ref(false)
const newStudentName = ref('')

const handleAddStudent = async () => {
  if (!newStudentName.value.trim()) return
  
  await addStudent(newStudentName.value.trim())
  newStudentName.value = '' // Clear the input after adding
  showAddModal.value = false // Close the modal
}

// Method to be called from App.vue via ref
const handleAction = () => {
  showAddModal.value = true
  // Focus the input after the modal is shown
  setTimeout(() => {
    const input = document.querySelector('input[type="text"]') as HTMLInputElement
    if (input) input.focus()
  }, 100)
}

defineExpose({
  handleAction
})
</script>

<template>
  <div>
    <SubHeader title="Students">
      <template #action>
        <button
          @click="showAddModal = true"
          class="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </template>
    </SubHeader>

    <div class="max-w-7xl mx-auto px-6 sm:px-8 py-6">
      <!-- Error message -->
      <div v-if="error" class="text-red-600 mb-4">
        {{ error }}
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-gray-600">
        Loading students...
      </div>

      <!-- Students list -->
      <div v-else-if="sortedStudents.length > 0" class="space-y-4">
        <div
          v-for="student in sortedStudents"
          :key="student.id"
          @click="router.push({ name: 'student', params: { studentId: student.id } })"
          class="bg-white p-4 rounded-lg shadow flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <span class="text-gray-900">{{ student.name?.trim() || 'Unnamed Student' }}</span>
          <span class="text-gray-500 text-sm">
            Added {{ student.createdAt.toLocaleDateString() }}
          </span>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-gray-600">
        No students added yet. Click the + button above to add your first student!
      </div>

      <!-- Add Student Modal -->
      <Modal
        v-model="showAddModal"
        title="Add New Student"
        :actions="[
          { label: 'Cancel', onClick: () => showAddModal = false },
          { label: 'Add Student', onClick: handleAddStudent }
        ]"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Student Name</label>
            <TextInput
              v-model="newStudentName"
              placeholder="Enter student name"
            />
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>
