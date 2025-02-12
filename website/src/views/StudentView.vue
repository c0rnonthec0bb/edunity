<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStudents } from '@/composables/useStudents'
import { useDebounce } from '@/composables/useDebounce'
import { usePageTitle } from '@/composables/usePageTitle'
import SubHeader from '@/components/SubHeader.vue'
import Modal from '@/components/Modal.vue'
import TextInput from '@/components/TextInput.vue'
import StudentQuizGrades from '@/components/StudentQuizGrades.vue'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

const activeTabIndex = ref(0)

const router = useRouter()
const route = useRoute()
const { students, loading, error, deleteStudent, updateStudent } = useStudents()
const { updateTitle } = usePageTitle()

const showDeleteModal = ref(false)
const studentId = route.params.studentId as string
const student = computed(() => students.value.find(s => s.id === studentId))

const editedName = ref(student.value?.name || '')
const editedNotes = ref(student.value?.notes || '')

const debouncedNotes = useDebounce(editedNotes, 500)

// Watch for student changes to update local values and title
watch(() => student.value?.name, (newName) => {
  if (newName !== editedName.value) {
    editedName.value = newName || ''
    updateTitle(newName)
  }
})

watch(() => student.value?.notes, (newNotes) => {
  if (newNotes !== editedNotes.value) {
    editedNotes.value = newNotes || ''
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

watch(editedName, async (newName) => {
  if (student.value && newName !== student.value.name) {
    await updateStudent(student.value.id, {
      name: newName
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
  <div class="space-y-4">
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
      <div v-else-if="loading" class="text-gray-600">Loading...</div>

      <!-- Student not found -->
      <div v-else-if="!student" class="text-gray-600">Student not found.</div>

      <!-- Student details -->
      <div v-else class="bg-white rounded-lg shadow p-6">
        <TabView v-model:activeIndex="activeTabIndex">
          <TabPanel header="Details" :pt="{ root: { class: 'p-4' } }">
            <TextInput
              v-model="editedName"
              label="Name"
              class="mb-4"
            />
            <TextInput
              v-model="editedNotes"
              label="Notes"
              type="textarea"
              :rows="4"
            />
          </TabPanel>
          <TabPanel header="Quiz Grades" :pt="{ root: { class: 'p-4' } }">
            <StudentQuizGrades :student-id="studentId" />
          </TabPanel>
        </TabView>
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
  </div>
</template>
