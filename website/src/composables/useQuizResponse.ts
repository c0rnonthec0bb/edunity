import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { firestore } from '@/firebase'
import { QUIZ_RESPONSE_DOC_PATH, STUDENT_DOC_PATH } from '../../../shared/paths'
import { useStudents } from './useStudents'
import type { QuizResponse } from './useQuizResponses'

export function useQuizResponse() {
  const route = useRoute()
  const { students, loading: studentsLoading } = useStudents()
  
  const response = ref<QuizResponse | null>(null)
  const student = ref(null)

  const getLatestDefinedTimestamp = (timestamps: (Date | undefined)[]) => {
    return timestamps
      .filter((t): t is Date => t !== undefined)
      .reduce((latest, current) => 
        !latest || current > latest ? current : latest
      , undefined as Date | undefined)
  }

  const isWithinLast30Seconds = (date: Date | undefined) => {
    if (!date) return false
    return (Date.now() - date.getTime()) < 30000 // 30 seconds in milliseconds
  }

  const isProcessingParse = computed(() => {
    if (!response.value) return false
    
    const latestTimestamp = getLatestDefinedTimestamp([
      response.value.createDate,
      response.value.photoCaptureShouldParseDate,
      response.value.photoCaptureParseStartDate
    ])

    return isWithinLast30Seconds(latestTimestamp) && 
           (!response.value.photoCaptureParseEndDate || 
            latestTimestamp > response.value.photoCaptureParseEndDate)
  })

  const isProcessingGrade = computed(() => {
    if (!response.value) return false
    
    const latestTimestamp = getLatestDefinedTimestamp([
      response.value.createDate,
      response.value.autoGradeShouldRunDate,
      response.value.autoGradeRunStartDate
    ])

    return isWithinLast30Seconds(latestTimestamp) && 
           (!response.value.autoGradeRunEndDate || 
            latestTimestamp > response.value.autoGradeRunEndDate)
  })

  const isProcessingStudent = computed(() => {
    if (!response.value) return false

    // If manualStudentId is defined, check if it matches studentId
    if (response.value.manualStudentId !== undefined) {
      return response.value.manualStudentId !== response.value.studentId
    }

    if (!response.value.photoCaptureParsedInfo?.studentName) {
      return false
    }

    // Otherwise check processing state
    const latestTimestamp = getLatestDefinedTimestamp([
      response.value.createDate,
      response.value.photoCaptureParseEndDate,
      response.value.photoCaptureParsedStudentIdStartDate
    ])

    return isWithinLast30Seconds(latestTimestamp) && 
           (!response.value.photoCaptureParsedStudentIdEndDate || 
            response.value.photoCaptureParsedStudentId && response.value.photoCaptureParsedStudentId !== response.value.studentId)
  })

  // Store the unsubscribe function
  let unsubscribe: (() => void) | null = null
  let path: string | null = null

  onMounted(() => {
    const responseId = route.params.responseId as string
    const quizId = route.params.quizId as string
    if (responseId && quizId) {
      path = QUIZ_RESPONSE_DOC_PATH(quizId, responseId)
      // Set up real-time listener for the response
      unsubscribe = firestore.watchDoc(
        path,
        (doc) => {
          if (doc.exists) {
            response.value = doc.data as QuizResponse
          } else {
            response.value = null
          }
        }
      )
    }
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  const loadStudent = async (studentId: string) => {
    if (!studentId) return

    const studentDoc = await firestore.getDoc(STUDENT_DOC_PATH(studentId))
    if (studentDoc.exists) {
      student.value = {
        id: studentDoc.id,
        ...studentDoc.data
      }
    }
  }

  const selectStudent = async (studentId: string) => {
    try {
      const path = QUIZ_RESPONSE_DOC_PATH(route.params.quizId as string, route.params.responseId as string)
      if (path) {
        await firestore.updateDoc(path, {
          manualStudentId: studentId,
        })
      }
    } catch (error) {
      console.error('Error selecting student:', error)
    }
  }

  const handleReParse = async () => {
    try {
      if (path) {
        await firestore.updateDoc(path, {
          photoCaptureShouldParseDate: firestore.serverTimestamp(),
        })
      }
    } catch (error) {
      console.error('Error triggering reparse:', error)
    }
  }

  const handleRegrade = async () => {
    try {
      if (path) {
        await firestore.updateDoc(path, {
          autoGradeShouldRunDate: firestore.serverTimestamp(),
        })
      }
    } catch (error) {
      console.error('Error triggering regrade:', error)
    }
  }

  const handleSelectStudent = async (studentId: string | null) => {
    try {
      if (path) {
        await firestore.updateDoc(path, {
          manualStudentId: studentId || firestore.cloudDelete()
        })
      }
    } catch (error) {
      console.error('Error updating student:', error)
    }
  }

  return {
    response,
    student,
    students,
    isProcessingParse,
    isProcessingGrade,
    isProcessingStudent,
    studentsLoading,
    loadStudent,
    handleRegrade,
    handleReParse,
    selectStudent,
  }
}
