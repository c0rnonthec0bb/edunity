import { functions, firestore } from './firebase'
import { QUIZ_RESPONSE_DOC_PATH, QUIZ_DOC_PATH, STUDENTS_COL_PATH } from './paths'
import { parseQuizResponseImage, matchStudentName, gradeQuizResponse } from './ai-utils'

interface QuizResponse {
  id: string
  quizId: string
  photoCapturePath?: string
  photoCaptureError?: string
  photoCaptureShouldParseDate?: any
  photoCapturePathChangeDate?: any
  photoCaptureParsedInfo?: {
    studentName?: string
    description?: string
    answers?: Record<string, string>
  }
  photoCaptureParsedStudentId?: string
  photoCaptureParsedStudentIdStartDate?: any
  photoCaptureParsedStudentIdEndDate?: any
  manualStudentId?: string
  studentId?: string
  autoGradeShouldRunDate?: any
  autoGradeRunStartDate?: any
  autoGradeRunEndDate?: any
  autoGradeError?: string
  autoGradeResults?: {
    questionGrades: Array<{
      questionId: string
      studentAnswer: string
      pointsEarned: number
      maxPoints: number
      explanation: string
    }>
    totalPointsEarned: number
    totalPossiblePoints: number
    summary: string
  }
}

interface Student {
  id: string
  name: string
}

export const onQuizResponseUpdated = functions.onDocUpdated.withOptions(
  { memory: '512MB' },
  QUIZ_RESPONSE_DOC_PATH('{quizId}', '{responseId}'),
  async ({ dataChange, path, params }) => {
    const updates: any = {}
    const promiseFunctions = []

    const photoCapturePathChange = dataChange.transform(({ photoCapturePath }: QuizResponse) => photoCapturePath)
    if (photoCapturePathChange.isUnequal) {
      updates.photoCapturePathChangeDate = firestore.serverTimestamp()
    }

    const photoCaptureShouldParseTrigger = dataChange
      .transform(({ photoCaptureShouldParseDate, photoCapturePath }: QuizResponse) => ({ photoCaptureShouldParseDate, photoCapturePath }))
    if (photoCaptureShouldParseTrigger.isUnequal) {
      updates.photoCaptureError = firestore.cloudDelete()
      updates.photoCaptureParsedInfo = firestore.cloudDelete()

      if (photoCapturePathChange.newValue) {
        updates.photoCaptureParseStartDate = firestore.serverTimestamp()
        promiseFunctions.push(
          async () => {
            try {
              // get questions from quiz doc
              const quizDoc = await firestore.getDoc(QUIZ_DOC_PATH(params.quizId))
              const quiz = quizDoc.data

              // Call AI to analyze the image
              const parsedResponse = await parseQuizResponseImage(photoCapturePathChange.newValue!, quiz)

              if (parsedResponse.error) {
                throw new Error(parsedResponse.error)
              }

              // Store both the full description and structured data
              const updates = {
                photoCaptureParsedInfo: {
                  studentName: parsedResponse.studentName,
                  description: parsedResponse.description,
                  answers: parsedResponse.answers,
                },
                photoCaptureParseEndDate: firestore.serverTimestamp(),
              }

              // Update the document with the AI response
              await firestore.updateDoc(path, updates)
            } catch (error) {
              console.error('Error processing image:', error)
              await firestore.updateDoc(path, {
                photoCaptureError: error instanceof Error ? error.message : 'Unknown error',
                photoCaptureParsedInfo: firestore.cloudDelete(),
                photoCaptureParseEndDate: firestore.serverTimestamp(),
              })
            }
          },
        )
      }
    }

    const photoCaptureParsedStudentNameChange = dataChange
      .transform(({ photoCaptureParsedInfo }: QuizResponse) => photoCaptureParsedInfo?.studentName)

    if (photoCaptureParsedStudentNameChange.isUnequal && photoCaptureParsedStudentNameChange.newValue) {
      updates.photoCaptureParsedStudentId = firestore.cloudDelete()
      updates.photoCaptureParsedStudentIdStartDate = firestore.serverTimestamp()
      promiseFunctions.push(
        async () => {
          try {
            // get educator ID from quiz
            const quizDoc = await firestore.getDoc(QUIZ_DOC_PATH(params.quizId))
            const { educatorUserId } = quizDoc.data
            if (!educatorUserId) {
              throw new Error('Educator user ID not found')
            }

            // download the list of the educator's students
            const studentsCol = await firestore.getCol(STUDENTS_COL_PATH, [(q) => q.where('educatorUserId', '==', educatorUserId)])

            const studentList: Student[] = studentsCol.docs
              .map(({ id, data }) => ({ id, name: data.name }))
              .filter(({ name }: { name: string }) => name)
              .sort((a, b) => a.name.localeCompare(b.name))

            // run AI to attempt to match parsed name with a student
            const { studentId } = await matchStudentName(
              photoCaptureParsedStudentNameChange.newValue!,
              studentList
            )

            await firestore.updateDoc(path, {
              photoCaptureParsedStudentId: studentId || firestore.cloudDelete(),
              photoCaptureParsedStudentIdEndDate: firestore.serverTimestamp(),
            })
          } catch (error) {
            console.error('Error getting students:', error)
          }
        }
      )
    }

    const studentIdChange = dataChange
      .transform(({ manualStudentId, photoCaptureParsedStudentId }: QuizResponse) => manualStudentId || photoCaptureParsedStudentId)
    if (studentIdChange.isUnequal && studentIdChange.newValue) {
      updates.studentId = studentIdChange.newValue
    }

    const autoGradeRunTrigger = dataChange
      .transform(({ autoGradeShouldRunDate, photoCaptureParsedInfo }: QuizResponse) => ({ autoGradeShouldRunDate, photoCaptureParsedInfo }))
    if (autoGradeRunTrigger.isUnequal) {
      updates.autoGradeRunStartDate = firestore.serverTimestamp()
      updates.autoGradeResults = firestore.cloudDelete()
      updates.autoGradeError = firestore.cloudDelete()

      promiseFunctions.push(
        async () => {
          try {
            // get quiz
            const quizDoc = await firestore.getDoc(QUIZ_DOC_PATH(params.quizId))
            const quiz = quizDoc.data

            // call AI to grade quiz response
            const gradeResults = await gradeQuizResponse(
              autoGradeRunTrigger.newValue.photoCaptureParsedInfo || {},
              quiz
            )

            await firestore.updateDoc(path, {
              autoGradeResults: gradeResults,
              autoGradeRunEndDate: firestore.serverTimestamp(),
              autoGradeError: firestore.cloudDelete(),
            })
          } catch (error) {
            console.error('Error auto-grading quiz:', error)
            await firestore.updateDoc(path, {
              autoGradeError: error instanceof Error ? error.message : 'Unknown error',
              autoGradeResults: firestore.cloudDelete(),
              autoGradeRunEndDate: firestore.serverTimestamp(),
            })
          }
        }
      )
    }

    return { updates, promiseFunctions }
  }
)
