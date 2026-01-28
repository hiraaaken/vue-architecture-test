import type { LoginInput, LoginResult, User } from '@/domain/types'

export interface AuthRepository {
  login(input: LoginInput): Promise<LoginResult>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
}
