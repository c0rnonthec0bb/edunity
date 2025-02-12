import * as firebaseAdmin from 'firebase-admin'
import { runAi } from './openai'
import { ChatCompletionContentPartImage, ChatCompletionContentPartText } from 'openai/resources'

interface Question {
  id: string
  question: string
  answer: string
  points: number
}

interface Quiz {
  id: string
  name: string
  educatorUserId: string
  questions: Question[]
  createdAt: Date
  updatedAt: Date
}

export type ParsedQuizResponse = {
  studentName?: string;
  description?: string;
  answers?: Record<string, string>;
  error?: string;
}

const quizResponseSchema = {
  type: 'object',
  properties: {
    studentName: {
      type: 'string',
      description: 'The name of the student who took the quiz',
    },
    description: {
      type: 'string',
      description: 'Any additional context or description from the image',
    },
    answers: {
      type: 'object',
      description: 'Map of question ID to student answer',
      additionalProperties: {
        type: 'string',
      },
    },
    error: {
      type: 'string',
    },
  },
  additionalProperties: false,
} as const

interface Student {
  id: string
  name: string
}

interface StudentMatchResponse {
  studentId?: string
  confidence: number
}

const studentMatchSchema = {
  type: 'object',
  properties: {
    studentId: {
      type: 'string',
      description: 'The ID of the matched student, or empty if no confident match found',
    },
    confidence: {
      type: 'number',
      description: 'Confidence score between 0 and 1 for the match',
    },
  },
  required: ['confidence'],
}

interface QuestionGrade {
  questionId: string
  studentAnswer: string
  pointsEarned: number
  maxPoints: number
  explanation: string
}

interface QuizGrade {
  questionGrades: QuestionGrade[]
  totalPointsEarned: number
  totalPossiblePoints: number
  summary: string
}

const quizGradeSchema = {
  type: 'object',
  properties: {
    questionGrades: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          questionId: {
            type: 'string',
            description: 'ID of the question being graded',
          },
          studentAnswer: {
            type: 'string',
            description: 'The student\'s answer to this question',
          },
          pointsEarned: {
            type: 'number',
            description: 'Integer number of points earned for this question',
          },
          maxPoints: {
            type: 'number',
            description: 'Maximum possible points for this question',
          },
          explanation: {
            type: 'string',
            description: 'Brief explanation of why this grade was assigned',
          },
        },
        required: ['questionId', 'studentAnswer', 'pointsEarned', 'maxPoints', 'explanation'],
      },
    },
    totalPointsEarned: {
      type: 'number',
      description: 'Total integer points earned across all questions',
    },
    totalPossiblePoints: {
      type: 'number',
      description: 'Total integer possible points across all questions',
    },
    summary: {
      type: 'string',
      description: 'Overall summary of student performance, including patterns in right/wrong answers and potential areas for improvement',
    },
  },
  required: ['questionGrades', 'totalPointsEarned', 'totalPossiblePoints', 'summary'],
}

export async function parseQuizResponseImage(storagePath: string, quiz: Quiz): Promise<ParsedQuizResponse> {
  try {
    const bucket = firebaseAdmin.storage().bucket()

    // Get the public URL for the image
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

    const result = await runAi([
      {
        type: 'text',
        text: `Analyze this quiz response image and extract the student's answers. ${quiz.questions.length > 0 ? `This is for a quiz with the following questions:
${quiz.questions.map((q) => `ID: ${q.id}
Question: ${q.question}`).join('\n\n')}` : ''}

Please identify:
1. The student's name if present
2. Any relevant description or context from the image
3. The student's answers, matching them to the corresponding question IDs

If the student put their name and/or responded to at least one question, return a successful result, even if the answers to some questions are missing. Return a relevant error if they provided neither their name nor an answer.

Format the response as JSON with:
- studentName (if found)
- description (any relevant context)
- answers (object mapping question IDs to student answers)`,
      } as ChatCompletionContentPartText,
      {
        type: 'image_url',
        image_url: {
          url: publicUrl,
        },
      } as ChatCompletionContentPartImage,
    ], {
      type: 'json_schema',
      json_schema: {
        name: 'quiz_response',
        schema: quizResponseSchema,
      },
    })

    return result.choices[0].message.parsed as ParsedQuizResponse
  } catch (error) {
    console.error('Error processing image:', error)
    return { error: 'Failed to process image' }
  }
}

export async function matchStudentName(parsedName: string, students: Student[]): Promise<StudentMatchResponse> {
  try {
    const result = await runAi([
      {
        type: 'text',
        text: `Given the name "${parsedName}" from a quiz response, find the best matching student from this list:\n${
          students.map((s) => `ID: ${s.id}, Name: ${s.name}`).join('\n')
        }\n\nConsider variations in spelling, nicknames, and formatting. Return the student ID only if you are confident it's the same person (confidence > 0.8).`,
      },
    ], {
      type: 'json_schema',
      json_schema: {
        name: 'student_match',
        schema: studentMatchSchema,
      },
    })

    return result.choices[0].message.parsed as StudentMatchResponse
  } catch (error) {
    console.error('Error matching student name:', error)
    return { confidence: 0 }
  }
}

export async function gradeQuizResponse(parsedInfo: ParsedQuizResponse, quiz: Quiz): Promise<QuizGrade> {
  try {
    if (!Object.keys(parsedInfo.answers || {}).length) {
      throw new Error('No answers found')
    }

    const result = await runAi([
      {
        type: 'text',
        text: `Grade this quiz response and provide brief feedback. The quiz questions and correct answers are:

${quiz.questions.map((q) => `Question ID: ${q.id}
Question: ${q.question}
Correct Answer: ${q.answer}
Points: ${q.points}`).join('\n\n')}

The student's answers from their quiz response are below. If an answer to a question is missing, assume the student left it blank and should get zero points.
${Object.entries(parsedInfo.answers || {}).map(([id, ans]) => {
    const question = quiz.questions.find((q) => q.id === id)
    return question ? `Question ID ${id} (${question.question}): ${ans}` : `Question ID ${id}: ${ans}`
  }).join('\n')}

Grade each answer fairly with an integer grade between 0 and the number of points indicated for the question above, considering:
1. Correctness of the core concepts
2. Partial credit for partially correct answers
3. Brief explanation of points awarded/deducted (1-2 sentences max)

Provide a concise summary (2-6 sentences) focusing on strengths, weaknesses, and suggestions for improvement.`,
      },
    ], {
      type: 'json_schema',
      json_schema: {
        name: 'quiz_grade',
        schema: quizGradeSchema,
      },
    })

    return result.choices[0].message.parsed as QuizGrade
  } catch (error) {
    console.error('Error grading quiz:', error)
    throw error
  }
}

export async function summarizeQuizResponses(
  responseSummaries: Array<{
    studentId: string
    studentName: string
    autoGradeResults: {
      totalPointsEarned: number
      totalPossiblePoints: number
      questionGrades: Array<{
        questionId: string
        pointsEarned: number
        maxPoints: number
        explanation: string
      }>
    }
  }>,
  questions: Array<{
    id: string
    question: string
  }>
): Promise<string> {
  if (!questions.length) throw new Error('The quiz does not have any questions yet.')

  if (!responseSummaries.length) throw new Error('The quiz does not have any responses yet.')

  const formattedResponses = responseSummaries.map((s) => `
${s.studentName}:
- Total Score: ${s.autoGradeResults.totalPointsEarned}/${s.autoGradeResults.totalPossiblePoints}
- Question Scores: ${s.autoGradeResults.questionGrades.map((g) => `${g.pointsEarned}/${g.maxPoints}`).join(', ')}
`).join('\n')

  const prompt = `Analyze these quiz results and create a detailed summary. For each question, analyze the responses to identify patterns, common mistakes, and areas where students showed strong understanding.

Focus on:
1. Overall performance trends
2. Specific concepts that students understood well
3. Areas where students struggled
4. Notable misconceptions or common errors
5. Suggestions for topics that may need review

Format your response as plain text. Do not use any special formatting or markdown. You may use newlines to separate sections and create structure.

Quiz Results:
${formattedResponses}`

  const response = await runAi([
    {
      type: 'text',
      text: 'You are an experienced educational analyst helping teachers understand quiz results.',
    },
    {
      type: 'text',
      text: prompt,
    },
  ], {
    type: 'text',
  })

  return response.choices[0]?.message?.content || 'Unable to generate summary'
}
