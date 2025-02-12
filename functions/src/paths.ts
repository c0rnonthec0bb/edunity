// Students
export const STUDENTS_COL_PATH = 'students'
export const STUDENT_DOC_PATH = (studentId: string) => `${STUDENTS_COL_PATH}/${studentId}`

// Quizzes
export const QUIZZES_COL_PATH = 'quizzes'
export const QUIZ_DOC_PATH = (quizId: string) => `${QUIZZES_COL_PATH}/${quizId}`

// Quiz Responses
export const QUIZ_RESPONSES_COL_PATH = (quizId: string) => `${QUIZ_DOC_PATH(quizId)}/responses`
export const QUIZ_RESPONSE_DOC_PATH = (quizId: string, responseId: string) => `${QUIZ_RESPONSES_COL_PATH(quizId)}/${responseId}`
