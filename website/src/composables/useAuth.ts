import { ref } from 'vue'
import { auth } from '../firebase'
import { 
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'

const user = ref<User | null>(null)
const loading = ref(true)

export function useAuth() {
  onAuthStateChanged(auth, (newUser) => {
    user.value = newUser
    loading.value = false
  })

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    signOut
  }
}
