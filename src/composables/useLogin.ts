import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { authRepositoryImpl } from '@/infrastructure/api/authRepositoryImpl'
import { login as loginUseCase } from '@/usecases/auth/login'

export function useLogin() {
  const router = useRouter()
  const store = useAuthStore()

  // UI State
  const email = ref('')
  const password = ref('')

  // Derived
  const isValid = computed(() => {
    return email.value.trim().length > 0 && password.value.length > 0
  })
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)

  // Actions
  const submit = async () => {
    if (!isValid.value) return

    const success = await loginUseCase(
      { email: email.value, password: password.value },
      { repository: authRepositoryImpl, store }
    )

    if (success) {
      router.push('/board')
    }
  }

  return {
    // UI State
    email,
    password,
    // Derived
    isValid,
    isLoading,
    error,
    // Actions
    submit,
  }
}
