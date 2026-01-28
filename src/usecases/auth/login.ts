import type { AuthRepository } from '@/repositories/authRepository'
import type { AuthStore } from '@/stores/authStore'
import type { LoginInput } from '@/domain/types'

export type LoginDeps = {
  repository: AuthRepository
  store: AuthStore
}

export async function login(
  input: LoginInput,
  deps: LoginDeps
): Promise<boolean> {
  const { repository, store } = deps

  store.setLoading(true)
  store.setError(null)

  try {
    const result = await repository.login(input)
    store.setUser(result.user)
    store.setToken(result.token)
    return true
  } catch (e) {
    store.setError(e instanceof Error ? e.message : 'Login failed')
    return false
  } finally {
    store.setLoading(false)
  }
}
