import { ref, onUnmounted } from 'vue'
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './useAuth'

export interface QuizQuestion {
  id: string
  question: string
  answer: string
  order: number
}

export interface Quiz {
  id: string
  name: string
  educatorUserId: string
  questions: QuizQuestion[]
  createdAt: Date
  updatedAt: Date
}

export function useQuizzes() {
  const { user } = useAuth()
  const quizzes = ref<Quiz[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Subscribe to quizzes collection
  const unsubscribe = onSnapshot(
    query(collection(db, 'quizzes')),
    (snapshot) => {
      quizzes.value = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        educatorUserId: doc.data().educatorUserId,
        questions: doc.data().questions || [],
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }))
      loading.value = false
    },
    (err) => {
      console.error('Error fetching quizzes:', err)
      error.value = 'Failed to load quizzes'
      loading.value = false
    }
  )

  // Add new quiz
  const addQuiz = async (name: string) => {
    if (!user.value) return

    try {
      await addDoc(collection(db, 'quizzes'), {
        name,
        educatorUserId: user.value.uid,
        questions: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Error adding quiz:', err)
      error.value = 'Failed to add quiz'
      throw err
    }
  }

  // Update quiz
  const updateQuiz = async (id: string, data: Partial<Quiz>) => {
    if (!user.value) return

    try {
      const docRef = doc(db, 'quizzes', id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Error updating quiz:', err)
      error.value = 'Failed to update quiz'
      throw err
    }
  }

  // Update quiz questions
  const updateQuizQuestions = async (id: string, questions: QuizQuestion[]) => {
    if (!user.value) return

    try {
      const docRef = doc(db, 'quizzes', id)
      await updateDoc(docRef, {
        questions,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Error updating quiz questions:', err)
      error.value = 'Failed to update quiz questions'
      throw err
    }
  }

  // Delete quiz
  const deleteQuiz = async (id: string) => {
    if (!user.value) return

    try {
      await deleteDoc(doc(db, 'quizzes', id))
    } catch (err) {
      console.error('Error deleting quiz:', err)
      error.value = 'Failed to delete quiz'
      throw err
    }
  }

  // Cleanup subscription on unmount
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    quizzes,
    loading,
    error,
    addQuiz,
    updateQuiz,
    updateQuizQuestions,
    deleteQuiz
  }
}
