import type { AuthRepository } from '@/repositories/authRepository'
import type { LoginInput, LoginResult, User, UserId, AuthToken } from '@/domain/types'
import { delay } from './delay'

let currentUser: User | null = null

export const authRepositoryImpl: AuthRepository = {
  async login(input: LoginInput): Promise<LoginResult> {
    await delay(500)

    // Mock: any email/password succeeds
    const user: User = {
      id: 'user-1' as UserId,
      email: input.email,
      name: input.email.split('@')[0],
    }

    const token: AuthToken = {
      accessToken: `mock-token-${Date.now()}`,
      expiresAt: Date.now() + 3600000, // 1 hour
    }

    currentUser = user

    return { user, token }
  },

  async logout(): Promise<void> {
    await delay(200)
    currentUser = null
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100)
    return currentUser
  },
}
