import { ref, onMounted, onUnmounted } from 'vue'
import { auth } from '@/firebase'
import type { User } from 'firebase/compat/auth'

const user = ref<User | null>(null)
const loading = ref(true)

export function useAuth() {
  auth.onAuthStateChanged((newUser) => {
    user.value = newUser
    loading.value = false
  })

  const signInWithGoogle = async () => {
    try {
      const provider = new auth.GoogleAuthProvider()
      await auth.signInWithPopup(provider)
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const signOut = async () => {
    try {
      await auth.signOut()
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
