import { ref, computed } from 'vue'
import gun from '@/lib/gun'

interface GunUser {
  alias: string
  pub: string
}

const user = ref<GunUser | null>(null)
const isLoading = ref(true)

const gunUser = gun.user().recall({ sessionStorage: true })

// Track auth state changes
gun.on('auth', () => {
  const is = gun.user().is as GunUser | undefined
  user.value = is ?? null
  isLoading.value = false
})

// Resolve initial loading state if no session is restored
setTimeout(() => {
  if (isLoading.value) {
    const is = gun.user().is as GunUser | undefined
    user.value = is ?? null
    isLoading.value = false
  }
}, 500)

export function useAuth() {
  const isAuthenticated = computed(() => user.value !== null)

  async function signUp(alias: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      gun.user().create(alias, password, (ack: any) => {
        if (ack.err) {
          reject(new Error(ack.err))
          return
        }
        // Auto sign-in after registration
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
        resolve()
      })
    })
  }

  function signOut(): void {
    gun.user().leave()
    user.value = null
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
