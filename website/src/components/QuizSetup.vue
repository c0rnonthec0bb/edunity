<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuizzes, type QuizQuestion } from '@/composables/useQuizzes'
import { nanoid } from 'nanoid'
import draggable from 'vuedraggable'
import Modal from './Modal.vue'

const props = defineProps<{
  quizId: string
}>()

const { quizzes, updateQuizQuestions } = useQuizzes()
const quiz = computed(() => quizzes.value.find(q => q.id === props.quizId))
const questions = computed({
  get: () => [...(quiz.value?.questions || [])].sort((a, b) => a.order - b.order),
  set: async (newQuestions) => {
    if (!quiz.value) return
    const reorderedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order: index
    }))
    await updateQuizQuestions(quiz.value.id, reorderedQuestions)
  }
})

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const newQuestion = ref('')
const newAnswer = ref('')
const editingQuestion = ref<QuizQuestion | null>(null)
const deletingQuestion = ref<QuizQuestion | null>(null)
const editedQuestion = ref('')
const editedAnswer = ref('')

const addQuestion = async () => {
  if (!quiz.value) return
  
  const updatedQuestions = [
    ...questions.value,
    {
      id: nanoid(),
      question: newQuestion.value,
      answer: newAnswer.value,
      order: questions.value.length
    }
  ]
  
  await updateQuizQuestions(quiz.value.id, updatedQuestions)
  newQuestion.value = ''
  newAnswer.value = ''
  showAddModal.value = false
}

const confirmDelete = (question: QuizQuestion) => {
  deletingQuestion.value = question
  showDeleteModal.value = true
}

const removeQuestion = async () => {
  if (!quiz.value || !deletingQuestion.value) return
  
  const updatedQuestions = questions.value
    .filter(q => q.id !== deletingQuestion.value?.id)
    .map((q, index) => ({ ...q, order: index }))
  
  await updateQuizQuestions(quiz.value.id, updatedQuestions)
  showDeleteModal.value = false
  deletingQuestion.value = null
}

const startEditing = (question: QuizQuestion) => {
  editingQuestion.value = { ...question }
  editedQuestion.value = question.question
  editedAnswer.value = question.answer
  showEditModal.value = true
}

const saveEdit = async () => {
  if (!quiz.value || !editingQuestion.value) return
  
  const updatedQuestions = questions.value.map(q => 
    q.id === editingQuestion.value?.id ? { ...q, question: editedQuestion.value, answer: editedAnswer.value } : q
  )
  
  await updateQuizQuestions(quiz.value.id, updatedQuestions)
  showEditModal.value = false
  editingQuestion.value = null
  editedQuestion.value = ''
  editedAnswer.value = ''
}

const handleDeleteQuestion = async () => {
  await removeQuestion()
}

const handleAddQuestion = async () => {
  await addQuestion()
}

const handleEditQuestion = async () => {
  await saveEdit()
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
      Add Quiz Question
    </button>

    <div v-if="questions.length === 0" class="text-center text-gray-500 py-8">
      No questions yet
    </div>

    <!-- Question List -->
    <div v-if="questions.length > 0">
      <draggable
        v-model="questions"
        :animation="150"
        item-key="id"
        class="space-y-3"
        handle=".drag-handle"
        ghost-class="opacity-50"
      >
        <template #item="{ element: question, index }">
          <div
            class="bg-white rounded-lg shadow p-4 group hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-medium text-gray-500">Question {{ index + 1 }}</span>
                  <button
                    @click="startEditing(question)"
                    class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 active:text-gray-800 cursor-pointer rounded-full hover:bg-gray-100 active:bg-gray-200"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
                <p class="text-gray-900 font-medium mb-1 line-clamp-5">{{ question.question }}</p>
                <p class="text-gray-600 line-clamp-5">{{ question.answer }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="confirmDelete(question)"
                  class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 active:text-red-700 cursor-pointer rounded-full hover:bg-gray-100 active:bg-gray-200"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                <button
                  class="drag-handle w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 active:text-gray-800 cursor-move rounded-full hover:bg-gray-100 active:bg-gray-200"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Add Question Modal -->
    <Modal
      v-model="showAddModal"
      title="Add Question"
      confirm-text="Add Question"
      cancel-text="Cancel"
      max-width="max-w-lg"
      @confirm="handleAddQuestion"
    >
      <div class="space-y-4">
        <div>
          <label for="question" class="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <input
            id="question"
            v-model="newQuestion"
            type="text"
            placeholder="Enter question"
            class="w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent"
          />
        </div>

        <div>
          <label for="answer" class="block text-sm font-medium text-gray-700 mb-1">
            Answer
          </label>
          <input
            id="answer"
            v-model="newAnswer"
            type="text"
            placeholder="Enter answer"
            class="w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent"
          />
        </div>
      </div>
    </Modal>

    <!-- Edit Question Modal -->
    <Modal
      v-model="showEditModal"
      title="Edit Question"
      confirm-text="Save Changes"
      cancel-text="Cancel"
      max-width="max-w-lg"
      @confirm="handleEditQuestion"
    >
      <div class="space-y-4">
        <div>
          <label for="edit-question" class="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <input
            id="edit-question"
            v-model="editedQuestion"
            type="text"
            placeholder="Enter question"
            class="w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent"
          />
        </div>

        <div>
          <label for="edit-answer" class="block text-sm font-medium text-gray-700 mb-1">
            Answer
          </label>
          <input
            id="edit-answer"
            v-model="editedAnswer"
            type="text"
            placeholder="Enter answer"
            class="w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent"
          />
        </div>
      </div>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal
      v-model="showDeleteModal"
      title="Delete Question"
      :actions="[
        { label: 'Cancel', onClick: () => showDeleteModal = false },
        { label: 'Delete', onClick: handleDeleteQuestion, variant: 'danger' }
      ]"
    >
      <p class="text-gray-700">
        Are you sure you want to delete this question? This action cannot be undone.
      </p>
    </Modal>
  </div>
</template>
