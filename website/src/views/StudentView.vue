<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStudents } from '@/composables/useStudents'
import { useDebounce } from '@/composables/useDebounce'
import SubHeader from '@/components/SubHeader.vue'
import Modal from '@/components/Modal.vue'

const router = useRouter()
const route = useRoute()
const { students, loading, error, deleteStudent, updateStudent } = useStudents()

const showDeleteModal = ref(false)
const studentId = route.params.studentId as string
const student = computed(() => students.value.find(s => s.id === studentId))

const studentName = computed({
  get: () => student.value?.name || '',
  set: (newName) => {
    if (student.value) {
      updateStudent(studentId, { name: newName })
    }
  }
})

const studentNotes = ref(student.value?.notes || '')
const debouncedNotes = useDebounce(studentNotes, 500)

// Watch for student changes to update local values
watch(() => student.value?.notes, (newNotes) => {
  if (newNotes !== studentNotes.value) {
    studentNotes.value = newNotes || ''
  }
})

// Watch for debounced changes to update server
watch(debouncedNotes, async (newNotes) => {
  if (student.value && newNotes !== student.value.notes) {
    await updateStudent(student.value.id, {
      notes: newNotes
    })
  }
})

const handleDelete = async () => {
  if (!student.value) return
  await deleteStudent(student.value.id)
  router.push({ name: 'students' })
}
</script>

<template>
  <div>
    <SubHeader 
      :title="student?.name || ''"
      super-title="Student"
    >
      <template #action>
        <button
          @click="showDeleteModal = true"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
      <div v-if="loading" class="text-gray-600">Loading...</div>

      <!-- Student not found -->
      <div v-else-if="!student" class="text-gray-600">Student not found.</div>

      <!-- Student details -->
      <div v-else class="bg-white rounded-lg shadow">
        <div class="p-6 space-y-6">
          <!-- Name -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Name</h3>
            <input
              v-model="studentName"
              type="text"
              placeholder="Student Name"
              class="w-full px-4 py-2 text-xl font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent"
            />
          </div>
          
          <!-- Notes -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Notes</h3>
            <textarea
              v-model="studentNotes"
              placeholder="Add notes about this student..."
              class="w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent min-h-[100px] resize-y"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal
      v-model="showDeleteModal"
      title="Delete Student"
      :actions="[
        { label: 'Cancel', onClick: () => showDeleteModal = false },
        { label: 'Delete', onClick: handleDelete, variant: 'danger' }
      ]"
    >
      <p class="text-gray-700">
        Are you sure you want to delete this student? This action cannot be undone.
      </p>
    </Modal>
  </div>
</template>
