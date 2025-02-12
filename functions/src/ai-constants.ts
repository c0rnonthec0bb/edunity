export const QUIZ_RESPONSE_PROMPT = (questions?: string[]) => {
  const questionsContext = questions?.length ?
    `\nQuiz Questions for Context:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n` :
    ''

  return `Please analyze this image of student work and return a JSON object. ${questionsContext}

1. First, check if this appears to be student work. Look for:
   - Handwritten answers on any type of paper (notebook, loose leaf, printed quiz, etc.)
   - Mathematical work, written responses, or multiple choice answers
   - Any form of student responses to questions or problems
   If you don't see any of these, return a JSON object with an "error" field explaining why.

2. If you find multiple distinct pieces of student work in the image, focus only on the work that appears closest to the center of the image. Ignore other work that may be visible at the edges or corners.

3. For the selected student work:
   - Look for any student name written on the paper
   - Extract ALL handwritten or student-provided work
   - Pay special attention to:
     * Mathematical equations and expressions
     * Written explanations or reasoning
     * Multiple choice selections
     * Diagrams or drawings made by the student
   - If you see numbered answers (e.g., "(1)", "2.", etc.), these refer to the quiz questions provided above. Note that students use 1-based indexing, so their "Question 1" corresponds to questions[0] in the context.

4. Return a JSON object with any of these fields that you can determine:
   {
     "studentName": "string, if a name is found on the paper",
     "description": "string, a full text description of all visible student work",
     "answers": {
       "questionIndex": "string, the student's answer",
       // Example: "0": "4x + 2" means the answer to Question 1 is "4x + 2"
     }
   }

   If there's an error, return:
   {
     "error": "string, description of what went wrong"
   }

Note: Only include answers in the "answers" object if you're confident they correspond to specific quiz questions. Omit any answers you're unsure about.`
}
