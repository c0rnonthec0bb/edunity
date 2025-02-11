import { ref, watch, onUnmounted, computed } from 'vue'
import type { DocumentData } from 'firebase/firestore'
import { firestore } from '@/firebase'
import { useAuth } from '@/composables/useAuth'
import { STUDENTS_COL_PATH, STUDENT_DOC_PATH } from '../../../shared/paths'

export interface Student extends DocumentData {
  id: string
  name: string
  educatorUserId: string
  notes: string
  createdAt: Date
  updatedAt: Date
}

export function useStudents() {
  const { user } = useAuth()
  const students = ref<Student[]>([])
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
      students.value = []
      return
    }

    loading.value = true
    error.value = null

    // Set up real-time listener using Firepower
    unsubscribe = firestore.watchCol(
      STUDENTS_COL_PATH,
      [q => q.where('educatorUserId', '==', userId)],
      snapshot => {
        students.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data
        })) as Student[]
        loading.value = false
      },
      err => {
        console.error('Error fetching students:', err)
        error.value = 'Failed to load students'
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

  const addStudent = async (name: string) => {
    if (!user.value) return

    error.value = null

    try {
      await firestore.addDoc(STUDENTS_COL_PATH, {
        name,
        educatorUserId: user.value.uid,
        notes: '',
        createdAt: firestore.serverTimestamp(),
        updatedAt: firestore.serverTimestamp()
      })
    } catch (e) {
      console.error('Error adding student:', e)
      error.value = 'Failed to add student'
    }
  }

  const getStudent = async (studentId: string) => {
    loading.value = true
    error.value = null

    try {
      const doc = await firestore.getDoc(STUDENT_DOC_PATH(studentId))
      if (doc.exists) {
        const data = doc.data
        return {
          id: doc.id,
          ...data
        } as Student
      }
      return null
    } catch (e) {
      console.error('Error fetching student:', e)
      error.value = 'Failed to fetch student'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateStudent = async (id: string, data: { name?: string; notes?: string }) => {
    if (!user.value) return

    error.value = null

    try {
      await firestore.updateDoc(STUDENT_DOC_PATH(id), {
        ...data,
        updatedAt: firestore.serverTimestamp()
      })
    } catch (err) {
      console.error('Error updating student:', err)
      error.value = 'Failed to update student'
    }
  }

  const deleteStudent = async (studentId: string) => {
    if (!user.value) return

    error.value = null

    try {
      await firestore.deleteDoc(STUDENT_DOC_PATH(studentId))
      return true
    } catch (e) {
      console.error('Error deleting student:', e)
      error.value = 'Failed to delete student'
      return false
    }
  }

  return {
    students,
    loading,
    error,
    addStudent,
    getStudent,
    updateStudent,
    deleteStudent
  }
}
