<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuizzes, type Question } from '@/composables/useQuizzes'
import { nanoid } from 'nanoid'
import draggable from 'vuedraggable'
import Modal from './Modal.vue'
import TextInput from './TextInput.vue'
import Button from 'primevue/button'

const props = defineProps<{
  quizId: string
}>()

const { quizzes, updateQuiz } = useQuizzes()
const quiz = computed(() => quizzes.value.find(q => q.id === props.quizId))
const questions = computed({
  get: () => [...(quiz.value?.questions || [])],
  set: async (newQuestions) => {
    if (!quiz.value) return
    await updateQuiz(quiz.value.id, { questions: newQuestions })
  }
})

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const defaultPoints = 5

const newQuestion = ref({
  question: '',
  answer: '',
  points: defaultPoints.toString()
})

const editingQuestion = ref<Question | null>(null)
const deletingQuestion = ref<Question | null>(null)
const editedQuestion = ref({
  question: '',
  answer: '',
  points: defaultPoints.toString()
})

const addQuestion = async () => {
  if (!quiz.value) return
  
  const updatedQuestions = [
    ...questions.value,
    {
      id: nanoid(),
      question: newQuestion.value.question,
      answer: newQuestion.value.answer,
      points: parseInt(newQuestion.value.points) || defaultPoints
    }
  ]
  
  await updateQuiz(quiz.value.id, { questions: updatedQuestions })
  newQuestion.value = {
    question: '',
    answer: '',
    points: defaultPoints.toString()
  }
  showAddModal.value = false
}

const confirmDelete = (question: Question) => {
  deletingQuestion.value = question
  showDeleteModal.value = true
}

const removeQuestion = async () => {
  if (!quiz.value || !deletingQuestion.value) return
  
  const updatedQuestions = questions.value.filter(q => q.id !== deletingQuestion.value?.id)
  
  await updateQuiz(quiz.value.id, { questions: updatedQuestions })
  deletingQuestion.value = null
  showDeleteModal.value = false
}

const startEditing = (question: Question) => {
  editingQuestion.value = question
  editedQuestion.value = {
    question: question.question,
    answer: question.answer,
    points: (question.points ?? defaultPoints).toString()
  }
  showEditModal.value = true
}

const saveEdit = async () => {
  if (!quiz.value || !editingQuestion.value) return
  
  const updatedQuestions = questions.value.map(q => 
    q.id === editingQuestion.value?.id ? { 
      ...q, 
      question: editedQuestion.value.question,
      answer: editedQuestion.value.answer,
      points: parseInt(editedQuestion.value.points) || defaultPoints
    } : q
  )
  
  await updateQuiz(quiz.value.id, { questions: updatedQuestions })
  editingQuestion.value = null
  editedQuestion.value = {
    question: '',
    answer: '',
    points: defaultPoints.toString()
  }
  showEditModal.value = false
}
</script>

<template>
  <div>
    <button
      @click="showAddModal = true"
      class="w-full inline-flex items-center justify-center px-4 py-2.5 bg-theme-500 text-white rounded-lg hover:bg-theme-600 transition-colors gap-2 mb-6 h-10"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Add Question
    </button>

    <!-- Question list -->
    <div class="space-y-4">
      <draggable
        v-model="questions"
        item-key="id"
        handle=".drag-handle"
        class="space-y-4"
      >
        <template #item="{ element: question }">
          <div class="bg-white rounded-lg shadow">
            <div class="p-4">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <button class="drag-handle p-2 text-gray-400 hover:text-gray-500 cursor-move">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                    </svg>
                  </button>
                  <button @click="startEditing(question)" class="p-2 text-gray-400 hover:text-gray-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="confirmDelete(question)" class="p-2 text-gray-400 hover:text-gray-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div class="text-gray-600">
                  {{ question.points }} points
                </div>
              </div>
              <p class="text-gray-900 font-medium mb-1 line-clamp-5">{{ question.question }}</p>
              <p class="text-gray-600 line-clamp-5">{{ question.answer }}</p>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Add Question Modal -->
    <Modal
      v-model="showAddModal"
      title="Add Question"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Question</label>
          <TextInput
            v-model="newQuestion.question"
            placeholder="Enter your question"
            multiline
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Answer</label>
          <TextInput
            v-model="newQuestion.answer"
            placeholder="Enter the answer"
            multiline
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Points</label>
          <TextInput
            v-model="newQuestion.points"
            type="number"
            placeholder="Enter points (default: 5)"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Cancel"
            severity="secondary"
            text
            @click="showAddModal = false"
          />
          <Button
            label="Add Question"
            class="bg-theme-500 hover:bg-theme-600 border-theme-500 hover:border-theme-600"
            @click="addQuestion"
          />
        </div>
      </template>
    </Modal>

    <!-- Edit Question Modal -->
    <Modal
      v-model="showEditModal"
      title="Edit Question"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Question</label>
          <TextInput
            v-model="editedQuestion.question"
            placeholder="Enter your question"
            multiline
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Answer</label>
          <TextInput
            v-model="editedQuestion.answer"
            placeholder="Enter the answer"
            multiline
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Points</label>
          <TextInput
            v-model="editedQuestion.points"
            type="number"
            placeholder="Enter points (default: 5)"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Cancel"
            severity="secondary"
            text
            @click="showEditModal = false"
          />
          <Button
            label="Save Changes"
            class="bg-theme-500 hover:bg-theme-600 border-theme-500 hover:border-theme-600"
            @click="saveEdit"
          />
        </div>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal
      v-model="showDeleteModal"
      title="Delete Question"
    >
      <p class="text-gray-700">Are you sure you want to delete this question? This action cannot be undone.</p>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Cancel"
            severity="secondary"
            text
            @click="showDeleteModal = false"
          />
          <Button
            label="Delete"
            severity="danger"
            @click="removeQuestion"
          />
        </div>
      </template>
    </Modal>
  </div>
</template>
