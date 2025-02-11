import './firebase'

import { functions, firestore } from './firebase'
import { QUIZ_RESPONSE_DOC_PATH } from '../../shared/paths'
import { describeImage } from './genkit'

export const onQuizResponseUpdated = functions.onDocUpdated(QUIZ_RESPONSE_DOC_PATH('{quizId}', '{responseId}'), async ({ docChange, path }) => {
    const updates = {}
    const promiseFunctions = []

    const photoCapturePathChange = docChange.transform(({ photoCapturePath }) => photoCapturePath)
    if (photoCapturePathChange.isUnequal) {
        updates.photoCaptureDescription = firestore.cloudDelete()

        if (photoCapturePathChange.newValue) {
            promiseFunctions.push(
                async () => {
                    // Call GenKit to analyze the image
                    const photoCaptureDescription = await describeImage({
                        storagePath: photoCapturePathChange.newValue,
                        prompt: 'Please describe what you see in this image, focusing on any text or mathematical content visible.'
                    })

                    // Update the document with the AI description
                    await firestore.updateDoc(path, { photoCaptureDescription })
                },
            )
        }
    }

    return { updates, promiseFunctions }
})