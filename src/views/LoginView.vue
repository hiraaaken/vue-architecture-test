<script setup lang="ts">
import { useLogin } from '@/composables/useLogin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LayoutDashboard, Loader2 } from 'lucide-vue-next'

const { email, password, isValid, isLoading, error, submit } = useLogin()

const handleSubmit = (e: Event) => {
  e.preventDefault()
  submit()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
    <Card class="w-full max-w-md shadow-xl border-gray-200">
      <CardHeader class="space-y-1 text-center">
        <div class="flex justify-center mb-4">
          <div class="p-3 rounded-xl bg-primary text-white shadow-lg">
            <LayoutDashboard class="h-8 w-8" />
          </div>
        </div>
        <CardTitle class="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
        <CardDescription class="text-gray-600">
          Sign in to your Kanban board
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="email" class="text-gray-700 font-medium">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="name@example.com"
              class="border-gray-300 focus:border-primary"
              :disabled="isLoading"
            />
          </div>

          <div class="space-y-2">
            <Label for="password" class="text-gray-700 font-medium">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              class="border-gray-300 focus:border-primary"
              :disabled="isLoading"
            />
          </div>

          <div v-if="error" class="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {{ error }}
          </div>

          <Button
            type="submit"
            class="w-full font-semibold"
            :disabled="!isValid || isLoading"
          >
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </Button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          Demo: Use any email/password to sign in
        </p>
      </CardContent>
    </Card>
  </div>
</template>
