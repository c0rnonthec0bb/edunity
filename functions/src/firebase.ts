import firebase from 'firebase-admin'
import { initFirepower, firestore, functions } from '@acobb/firepower'

// Initialize Firebase
firebase.initializeApp()

// Initialize Firepower
initFirepower(firebase)

// Export firestore utilities
export { firestore, functions }
