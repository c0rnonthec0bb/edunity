import { initGenKit } from 'firebase-genkit'
import { storage } from 'firebase-admin'

const genkit = initGenKit({
  storage: storage(),
  apiKey: process.env.GENKIT_API_KEY
})

export const { describeImage } = genkit
