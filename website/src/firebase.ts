import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/auth'
import 'firebase/compat/storage'
import { initFirepower, firestore } from '@acobb/firepower'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = app.auth()
export const storage = app.storage()

// Initialize Firepower
initFirepower(firebase)

// Export firestore utilities
export { firestore }

// Export auth utilities
export const signInWithGoogle = async () => {
  try {
    const provider = new firebase.auth.GoogleAuthProvider()
    await auth.signInWithPopup(provider)
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}
