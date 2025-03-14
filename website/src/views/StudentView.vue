<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStudents } from '@/composables/useStudents'
import { usePageTitle } from '@/composables/usePageTitle'
import SubHeader from '@/components/SubHeader.vue'
import Modal from '@/components/Modal.vue'
import TabList from '@/components/TabList.vue'

const router = useRouter()
const route = useRoute()
const { students, loading, error, deleteStudent } = useStudents()
const { updateTitle } = usePageTitle()

const showDeleteModal = ref(false)
const studentId = route.params.studentId as string
const student = computed(() => {
  const s = students.value.find(s => s.id === studentId)
  if (s?.name) updateTitle(s.name)
  return s
})

const tabs = [
  { label: 'Details', value: 'student-details' },
  { label: 'Quiz Grades', value: 'student-grades' }
]

const currentTab = computed({
  get() {
    return route.name as string
  },
  set(value: string) {
    router.push({
      name: value,
      params: { studentId }
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
      <template #tabs>
        <TabList
          v-model="currentTab"
          :tabs="tabs"
        />
      </template>
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

    <div class="max-w-7xl mx-auto">
      <!-- Error message -->
      <div v-if="error" class="text-red-600 mb-4">
        {{ error }}
      </div>

      <!-- Loading state -->
      <div v-else-if="loading" class="text-gray-600">Loading...</div>

      <!-- Student not found -->
      <div v-else-if="!student" class="text-gray-600">Student not found.</div>

      <!-- Student content -->
      <div v-else>
        <router-view />
      </div>

      <!-- Delete Confirmation Modal -->
      <Modal
        v-model="showDeleteModal"
        title="Delete Student"
        :actions="[
          { label: 'Cancel', onClick: () => showDeleteModal = false },
          { label: 'Delete', onClick: handleDelete, isDanger: true }
        ]"
      >
        <p class="text-gray-700">
          Are you sure you want to delete this student? This action cannot be undone.
        </p>
      </Modal>
    </div>
  </div>
</template>
