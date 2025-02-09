import { ref, watch, onUnmounted } from 'vue'
import { collection, query, where, addDoc, onSnapshot, deleteDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './useAuth'

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

    // Set up real-time listener
    const q = query(
      collection(db, 'students'),
      where('educatorUserId', '==', userId)
    )
    
    unsubscribe = onSnapshot(q, 
      (snapshot) => {
        students.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Student[]
        loading.value = false
      },
      (err) => {
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
      await addDoc(collection(db, 'students'), {
        name,
        educatorUserId: user.value.uid,
        notes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
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
      const docRef = doc(db, 'students', studentId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
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
      const docRef = doc(db, 'students', id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
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
      const docRef = doc(db, 'students', studentId)
      await deleteDoc(docRef)
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
