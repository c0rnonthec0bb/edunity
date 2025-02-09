import { ref, computed } from 'vue'
import { collection, doc, addDoc, onSnapshot, query, orderBy, getDoc, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import type { Timestamp } from 'firebase/firestore'
import { nanoid } from 'nanoid'

export interface QuizResponse {
  id: string
  photoCapturePath?: string
  createdAt: Timestamp
  isLocal?: boolean
}

export function useQuizResponses(quizId: string) {
  const responses = ref<QuizResponse[]>([])
  const uploadingResponses = ref<QuizResponse[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Subscribe to responses
  const responsesRef = collection(db, `quizzes/${quizId}/responses`)
  const q = query(responsesRef, orderBy('createdAt', 'desc'))
  
  const unsubscribe = onSnapshot(q, 
    (snapshot) => {
      responses.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuizResponse[]
      loading.value = false
    },
    (err) => {
      error.value = err.message
      loading.value = false
    }
  )

  // Get a single response
  const getResponse = async (responseId: string) => {
    try {
      const responseDoc = await getDoc(doc(db, `quizzes/${quizId}/responses/${responseId}`))
      if (responseDoc.exists()) {
        return {
          id: responseDoc.id,
          ...responseDoc.data()
        } as QuizResponse
      }
      return null
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Delete a response
  const deleteResponse = async (responseId: string) => {
    try {
      const response = await getResponse(responseId)
      if (response?.photoCapturePath) {
        const photoRef = storageRef(storage, response.photoCapturePath)
        await deleteObject(photoRef)
      }
      await deleteDoc(doc(db, `quizzes/${quizId}/responses/${responseId}`))
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Upload photo and create response
  const uploadResponse = async (photo: Blob) => {
    const tempId = nanoid()
    try {
      // Create a temporary local response
      const tempResponse: QuizResponse = {
        id: tempId,
        createdAt: new Date() as unknown as Timestamp,
        isLocal: true
      }
      
      // Add to uploading list
      uploadingResponses.value.push(tempResponse)

      // Upload photo to storage
      const photoPath = `quizzes/${quizId}/responses/${tempId}/photo_${Date.now()}.png`
      const photoRef = storageRef(storage, photoPath)
      await uploadBytes(photoRef, photo)

      // Create response document with photo path
      await addDoc(responsesRef, {
        createdAt: new Date(),
        photoCapturePath: photoPath
      })

      // Remove from uploading list
      uploadingResponses.value = uploadingResponses.value.filter(r => r.id !== tempId)

      return tempId
    } catch (err) {
      error.value = err.message
      // Remove from uploading list on error
      uploadingResponses.value = uploadingResponses.value.filter(r => r.id !== tempId)
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
    getResponse,
    deleteResponse,
    unsubscribe
  }
}
