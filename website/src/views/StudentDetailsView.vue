<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStudents } from '@/composables/useStudents'
import { useDebounce } from '@/composables/useDebounce'
import TextInput from '@/components/TextInput.vue'

const route = useRoute()
const { students, updateStudent } = useStudents()

const studentId = route.params.studentId as string
const student = computed(() => students.value.find(s => s.id === studentId))

const editedName = ref(student.value?.name || '')
const editedNotes = ref(student.value?.notes || '')

const debouncedNotes = useDebounce(editedNotes, 500)

// Watch for student changes to update local values
watch(() => student.value?.name, (newName) => {
  if (newName !== editedName.value) {
    editedName.value = newName || ''
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
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 space-y-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Student Name</label>
            <TextInput
              v-model="editedName"
              placeholder="Enter student name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Notes</label>
            <TextInput
              v-model="editedNotes"
              placeholder="Enter notes"
              multiline
              rows="4"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
