import OpenAI from 'openai'
import * as firebaseFunctions from 'firebase-functions/v1'
import { ChatCompletionContentPart } from 'openai/resources/chat/completions'

const openai = new OpenAI({
  apiKey: firebaseFunctions.config().openai.api_key,
})

export async function runAi(
  content: Array<ChatCompletionContentPart>,
  responseFormat?: any,
) {
  try {
    return await openai.beta.chat.completions.parse({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content,
        },
      ],
      ...(responseFormat ? {
        response_format: responseFormat,
      } : {}),
      max_tokens: 1000,
    })
  } catch (error) {
    console.error('Error calling OpenAI:', error)
    throw error
  }
}
