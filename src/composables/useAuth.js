import { ref, onMounted } from 'vue'
import { auth, db } from '../firebase/config'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

const user = ref(null)
const userData = ref(null)
const isAuthReady = ref(false)

export function useAuth() {
  const error = ref(null)
  const isPending = ref(false)

  const signup = async (email, password, displayName, role, major = null) => {
    error.value = null
    isPending.value = true

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password)
      if (!res) throw new Error('Could not complete signup')

      const userDoc = {
        uid: res.user.uid,
        email,
        displayName,
        role, // 'student' or 'club'
        createdAt: new Date()
      }

      if (role === 'student') {
        userDoc.major = major
      }

      await setDoc(doc(db, 'users', res.user.uid), userDoc)
      
      user.value = res.user
      userData.value = userDoc
      isPending.value = false
    } catch (err) {
      console.error("Signup Error:", err.code, err.message);
      error.value = err.message
      isPending.value = false
    }
  }

  const login = async (email, password) => {
    error.value = null
    isPending.value = true

    try {
      const res = await signInWithEmailAndPassword(auth, email, password)
      const docSnap = await getDoc(doc(db, 'users', res.user.uid))
      
      user.value = res.user
      userData.value = docSnap.exists() ? docSnap.data() : null
      isPending.value = false
    } catch (err) {
      error.value = err.message
      isPending.value = false
    }
  }

  const logout = async () => {
    error.value = null
    isPending.value = true

    try {
      await signOut(auth)
      user.value = null
      userData.value = null
      isPending.value = false
    } catch (err) {
      error.value = err.message
      isPending.value = false
    }
  }

  return {
    user,
    userData,
    isAuthReady,
    error,
    isPending,
    signup,
    login,
    logout
  }
}

// Global Auth State
onAuthStateChanged(auth, async (_user) => {
  user.value = _user
  if (_user) {
    const docSnap = await getDoc(doc(db, 'users', _user.uid))
    userData.value = docSnap.exists() ? docSnap.data() : null
  }
  isAuthReady.value = true
})
