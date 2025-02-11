import { ref, computed, watch, onUnmounted } from 'vue'
import type { DocumentData } from 'firebase/firestore'
import { firestore, storage } from '@/firebase'
import { ref as storageRef, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage'
import { useAuth } from '@/composables/useAuth'
import { nanoid } from 'nanoid'
import { QUIZ_RESPONSES_COL_PATH, QUIZ_RESPONSE_DOC_PATH } from '../../../shared/paths'

export interface QuestionResponse {
  questionId: string
  response: string
}

export interface QuizResponse {
  id: string
  quizId: string
  studentId: string
  educatorUserId: string
  responses?: QuestionResponse[]
  photoCapturePath?: string
  score?: number
  createdAt: any
  updatedAt: any
  isLocal?: boolean
}

interface UseQuizResponsesOptions {
  quizId?: string
  studentId?: string
}

export function useQuizResponses(options: UseQuizResponsesOptions = {}) {
  const { user } = useAuth()
  const responses = ref<QuizResponse[]>([])
  const uploadingResponses = ref<QuizResponse[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Store the unsubscribe function
  let unsubscribe: (() => void) | null = null

  // Setup Firestore listener whenever the dependencies change
  watch(
    [() => user.value?.uid, () => options.quizId, () => options.studentId],
    ([userId, currentQuizId, currentStudentId]) => {
      // Clean up previous listener if it exists
      if (unsubscribe) {
        unsubscribe()
        unsubscribe = null
      }

      if (!userId) {
        responses.value = []
        return
      }

      // Validate that at least one filter is provided
      if (!currentQuizId && !currentStudentId) {
        error.value = 'Either quizId or studentId must be provided'
        return
      }

      loading.value = true
      error.value = null

      // Build query based on provided filters
      const queryAdditions = [
        currentStudentId && (q => q.where('studentId', '==', currentStudentId)),
        q => q.orderBy('createdAt', 'desc')
      ].filter(Boolean)

      // Set up real-time listener using Firepower
      if (currentQuizId) {
        // If we have a quizId, watch the subcollection
        unsubscribe = firestore.watchCol(
          QUIZ_RESPONSES_COL_PATH(currentQuizId),
          queryAdditions,
          snapshot => {
            responses.value = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data
            })) as QuizResponse[]
            loading.value = false
          },
          err => {
            console.error('Error watching responses:', err)
            error.value = err
            loading.value = false
          }
        )
      } else if (currentStudentId) {
        // If we only have studentId, we need to query across all quizzes
        // This would require a different data structure or a collection group query
        error.value = 'Filtering by student ID only is not yet supported'
        loading.value = false
      }
    },
    { immediate: true }
  )

  // Clean up listener when component is unmounted
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  const uploadResponse = async (photo: Blob) => {
    if (!user.value || !options.quizId) return
    
    const tempId = nanoid()
    try {
      // Create a temporary local response
      const tempResponse: QuizResponse = {
        id: tempId,
        quizId: options.quizId,
        studentId: user.value.uid,
        educatorUserId: user.value.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        isLocal: true
      }
      
      // Add to uploading list
      uploadingResponses.value.push(tempResponse)

      // Upload photo to storage
      const photoPath = `quizzes/${options.quizId}/responses/${tempId}/photo_${Date.now()}.png`
      const photoRef = storageRef(storage, photoPath)
      await uploadBytes(photoRef, photo)
      const photoUrl = await getDownloadURL(photoRef)

      // Create response document with photo path
      await firestore.addDoc(QUIZ_RESPONSES_COL_PATH(options.quizId), {
        quizId: options.quizId,
        studentId: user.value.uid,
        educatorUserId: user.value.uid,
        photoCapturePath: photoPath,
        createdAt: firestore.serverTimestamp(),
        updatedAt: firestore.serverTimestamp()
      })

      // Remove from uploading list
      uploadingResponses.value = uploadingResponses.value.filter(r => r.id !== tempId)

      return tempId
    } catch (err) {
      console.error('Failed to upload photo:', err)
      // Remove from uploading list on error
      uploadingResponses.value = uploadingResponses.value.filter(r => r.id !== tempId)
      throw err
    }
  }

  const getQuizResponse = async (quizId: string, responseId: string) => {
    loading.value = true
    error.value = null

    try {
      const doc = await firestore.getDoc(QUIZ_RESPONSE_DOC_PATH(quizId, responseId))
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data
        } as QuizResponse
      }
      return null
    } catch (e) {
      console.error('Error fetching quiz response:', e)
      error.value = 'Failed to fetch quiz response'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateQuizResponse = async (
    quizId: string,
    responseId: string,
    data: { responses?: QuestionResponse[]; score?: number }
  ) => {
    if (!user.value) return

    error.value = null

    try {
      await firestore.updateDoc(QUIZ_RESPONSE_DOC_PATH(quizId, responseId), {
        ...data,
        updatedAt: firestore.serverTimestamp()
      })
    } catch (err) {
      console.error('Error updating quiz response:', err)
      error.value = 'Failed to update quiz response'
    }
  }

  const deleteQuizResponse = async (quizId: string, responseId: string) => {
    try {
      // Get the response first to get the photo path
      const response = await getQuizResponse(quizId, responseId)
      
      if (response?.photoCapturePath) {
        // Delete the photo from storage
        const photoRef = storageRef(storage, response.photoCapturePath)
        await deleteObject(photoRef)
      }

      // Delete the response document
      await firestore.deleteDoc(QUIZ_RESPONSE_DOC_PATH(quizId, responseId))
    } catch (err) {
      console.error('Failed to delete response:', err)
      throw err
    }
  }

  const uploadingCount = computed(() => uploadingResponses.value.length)

  return {
    responses,
    uploadingResponses,
    uploadingCount,
    loading,
    error,
    uploadResponse,
    getQuizResponse,
    updateQuizResponse,
    deleteQuizResponse
  }
}
