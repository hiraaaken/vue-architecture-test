import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { authRepositoryImpl } from '@/infrastructure/api/authRepositoryImpl'
import { logout as logoutUseCase } from '@/usecases/auth/logout'

export function useAuth() {
  const router = useRouter()
  const store = useAuthStore()

  // Derived
  const isAuthenticated = computed(() => store.isAuthenticated)
  const user = computed(() => store.user)

  // Actions
  const logout = async () => {
    await logoutUseCase({ repository: authRepositoryImpl, store })
    router.push('/login')
  }

  return {
    isAuthenticated,
    user,
    logout,
  }
}
