import { ref, watch, computed, onUnmounted } from 'vue'
import type { DocumentData } from 'firebase/firestore'
import { firestore } from '@/firebase'
import { useAuth } from '@/composables/useAuth'
import { QUIZZES_COL_PATH, QUIZ_DOC_PATH } from '../../../shared/paths'

export interface Question {
  id: string
  question: string
  answer: string
  type: 'multiple_choice' | 'short_answer'
  choices?: string[]
}

export interface Quiz extends DocumentData {
  id: string
  name: string
  educatorUserId: string
  questions: Question[]
  createdAt: Date
  updatedAt: Date
}

export function useQuizzes() {
  const { user } = useAuth()
  const quizzes = ref<Quiz[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Store the unsubscribe function
  let unsubscribe: (() => void) | null = null

  // Setup Firestore listener whenever the user changes
  watch(() => user.value?.uid, (userId) => {
    // Clean up previous listener if it exists
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }

    if (!userId) {
      quizzes.value = []
      return
    }

    loading.value = true
    error.value = null

    // Set up real-time listener using Firepower
    unsubscribe = firestore.watchCol(
      QUIZZES_COL_PATH,
      [q => q.where('educatorUserId', '==', userId)],
      snapshot => {
        quizzes.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data
        })) as Quiz[]
        loading.value = false
      },
      err => {
        console.error('Error fetching quizzes:', err)
        error.value = 'Failed to load quizzes'
        loading.value = false
      }
    )
  }, { immediate: true })

  // Clean up listener when component is unmounted
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  const addQuiz = async (name: string, questions: Omit<Question, 'id'>[]) => {
    if (!user.value) return

    error.value = null

    try {
      // Add IDs to questions
      const questionsWithIds = questions.map(q => ({
        ...q,
        id: crypto.randomUUID()
      }))

      await firestore.addDoc(QUIZZES_COL_PATH, {
        name,
        educatorUserId: user.value.uid,
        questions: questionsWithIds,
        createdAt: firestore.serverTimestamp(),
        updatedAt: firestore.serverTimestamp()
      })
    } catch (e) {
      console.error('Error adding quiz:', e)
      error.value = 'Failed to add quiz'
    }
  }

  const getQuiz = async (quizId: string) => {
    loading.value = true
    error.value = null

    try {
      const doc = await firestore.getDoc(QUIZ_DOC_PATH(quizId))
      if (doc.exists) {
        const data = doc.data
        return {
          id: doc.id,
          ...data
        } as Quiz
      }
      return null
    } catch (e) {
      console.error('Error fetching quiz:', e)
      error.value = 'Failed to fetch quiz'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateQuiz = async (id: string, data: { name?: string; questions?: Question[] }) => {
    if (!user.value) return

    error.value = null

    try {
      await firestore.updateDoc(QUIZ_DOC_PATH(id), {
        ...data,
        updatedAt: firestore.serverTimestamp()
      })
    } catch (err) {
      console.error('Error updating quiz:', err)
      error.value = 'Failed to update quiz'
    }
  }

  const deleteQuiz = async (quizId: string) => {
    if (!user.value) return

    error.value = null

    try {
      await firestore.deleteDoc(QUIZ_DOC_PATH(quizId))
      return true
    } catch (e) {
      console.error('Error deleting quiz:', e)
      error.value = 'Failed to delete quiz'
      return false
    }
  }

  return {
    quizzes,
    loading,
    error,
    addQuiz,
    getQuiz,
    updateQuiz,
    deleteQuiz
  }
}
