import type { AuthRepository } from '@/repositories/authRepository'
import type { AuthStore } from '@/stores/authStore'

export type LogoutDeps = {
  repository: AuthRepository
  store: AuthStore
}

export async function logout(deps: LogoutDeps): Promise<void> {
  const { repository, store } = deps

  try {
    await repository.logout()
  } finally {
    store.clear()
  }
}
