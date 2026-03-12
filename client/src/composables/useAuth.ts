import { ref, computed } from 'vue'
import gun from '@/lib/gun'

interface GunUser {
  alias: string
  pub: string
}

const SESSION_KEY = 'fp_session'

const user = ref<GunUser | null>(null)
const isLoading = ref(true)

// Try to restore session from localStorage
const saved = localStorage.getItem(SESSION_KEY)
if (saved) {
  try {
    const { alias, password } = JSON.parse(saved)
    gun.user().auth(alias, password, (ack: any) => {
      if (ack.err) {
        localStorage.removeItem(SESSION_KEY)
      }
      const is = gun.user().is as GunUser | undefined
      user.value = is ?? null
      isLoading.value = false
    })
  } catch {
    localStorage.removeItem(SESSION_KEY)
    isLoading.value = false
  }
} else {
  isLoading.value = false
}

export function useAuth() {
  const isAuthenticated = computed(() => user.value !== null)

  async function signUp(alias: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      gun.user().create(alias, password, (ack: any) => {
        if (ack.err) {
          reject(new Error(ack.err))
          return
        }
        signIn(alias, password).then(resolve).catch(reject)
      })
    })
  }

  async function signIn(alias: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      gun.user().auth(alias, password, (ack: any) => {
        if (ack.err) {
          reject(new Error(ack.err))
          return
        }
        const is = gun.user().is as GunUser | undefined
        user.value = is ?? null
        // Persist session
        localStorage.setItem(SESSION_KEY, JSON.stringify({ alias, password }))
        resolve()
      })
    })
  }

  function signOut(): void {
    gun.user().leave()
    user.value = null
    localStorage.removeItem(SESSION_KEY)
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    signUp,
    signIn,
    signOut,
  }
}
