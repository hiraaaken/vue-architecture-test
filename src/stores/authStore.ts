import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthToken } from '@/domain/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<AuthToken | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => user.value !== null && token.value !== null)

  // Mutations
  const setUser = (newUser: User | null) => {
    user.value = newUser
  }

  const setToken = (newToken: AuthToken | null) => {
    token.value = newToken
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (msg: string | null) => {
    error.value = msg
  }

  const clear = () => {
    user.value = null
    token.value = null
    error.value = null
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    // Mutations
    setUser,
    setToken,
    setLoading,
    setError,
    clear,
  }
})

export type AuthStore = ReturnType<typeof useAuthStore>
