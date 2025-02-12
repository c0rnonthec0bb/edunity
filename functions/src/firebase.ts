import * as firebaseAdmin from 'firebase-admin'
import * as firebaseFunctions from 'firebase-functions/v1'
import { initFirepower, functions, firestore } from '@acobb/firepower'

// Initialize Firebase
firebaseAdmin.initializeApp()

// Initialize Firepower
initFirepower(firebaseAdmin, firebaseFunctions)

export { functions, firestore }
