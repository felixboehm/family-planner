import { ref, computed } from 'vue'
import gun from '@/lib/gun'

interface GunUser {
  alias: string
  pub: string
}

const user = ref<GunUser | null>(null)
const isLoading = ref(true)

// Recall session from sessionStorage (GunDB's built-in persistence)
gun.user().recall({ sessionStorage: true })

// Listen for successful auth (fires on recall AND manual auth)
gun.on('auth', () => {
  const is = gun.user().is as GunUser | undefined
  if (is) {
    user.value = { alias: is.alias, pub: is.pub }
  }
  isLoading.value = false
})

// If no session is recalled, resolve loading after a short wait
setTimeout(() => {
  if (isLoading.value) {
    isLoading.value = false
  }
}, 1000)

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
        if (is) {
          user.value = { alias: is.alias, pub: is.pub }
        }
        resolve()
      })
    })
  }

  function signOut(): void {
    gun.user().leave()
    user.value = null
    // Clear sessionStorage to prevent recall
    sessionStorage.removeItem('pair')
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
