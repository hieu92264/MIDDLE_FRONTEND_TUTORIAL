<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema } from '@/modules/auth/schemas'
import { useLoginMutation } from '@/modules/auth/queries/auth.query'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { toast } from 'vue-sonner'
import { User, Lock, Eye, EyeOff, Loader2, Sparkles } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { mutateAsync: login } = useLoginMutation()

const showPassword = ref(false)
const apiError = ref('')

const { handleSubmit, errors, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    username: '',
    password: '',
  },
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  apiError.value = ''
  try {
    const payload = await login(values)
    if (payload && payload.access_token) {
      authStore.setSession(payload)
      toast.success(`Welcome back, ${payload.user?.username || values.username}!`)
      router.push('/')
    } else {
      // In case the API returns something unexpected
      throw new Error('Invalid authentication response')
    }
  } catch (err) {
    console.error('Login error:', err)

    const error = err as {
      response?: { data?: { message?: string } }
      code?: string
      message?: string
    }

    // Check if network error (API server is offline)
    const isNetworkError =
      !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error'

    if (isNetworkError) {
      apiError.value =
        'Cannot connect to auth server. Please use "Quick Login (Demo Mode)" to test the frontend.'
      toast.error('Network Error: Cannot connect to API server.')
    } else {
      const serverMsg =
        error.response?.data?.message || error.message || 'Invalid username or password'
      apiError.value = serverMsg
      toast.error(serverMsg)
    }
  }
})

// Trigger quick demo login that bypasses the backend
const handleDemoLogin = () => {
  apiError.value = ''

  // Set mock token and user details in the Pinia store
  const mockPayload = {
    access_token: 'mock-jwt-token-xyz-123456',
    token_type: 'bearer',
    expires_in: 3600,
    user: {
      id: 1,
      username: 'Administrator',
      email: 'admin@learn-fe.dev',
      role: 'administrator',
      is_active: true,
      created_at: new Date().toISOString(),
      user_name_created: null,
      updated_at: new Date().toISOString(),
      user_name_updated: null,
    },
  }

  authStore.setSession(mockPayload)
  toast.success('Logged in successfully (Demo Mode)')
  router.push('/')
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-5">
    <!-- Server/API Error Alert -->
    <div
      v-if="apiError"
      class="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed animate-shake"
    >
      {{ apiError }}
    </div>

    <!-- Username/Email Field -->
    <div class="space-y-2">
      <label
        for="username"
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
      >
        Username
      </label>
      <div class="relative">
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground"
        >
          <User class="h-4 w-4" />
        </div>
        <input
          id="username"
          v-model="username"
          v-bind="usernameAttrs"
          type="text"
          placeholder="Enter username"
          :class="[
            'block w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-accent/25 border focus:outline-none focus:ring-1 transition-all',
            errors?.username
              ? 'border-destructive focus:ring-destructive focus:border-destructive bg-destructive/5'
              : 'border-border focus:ring-primary focus:border-primary',
          ]"
          :disabled="isSubmitting"
        />
      </div>
      <p v-if="errors?.username" class="text-[11px] text-destructive font-medium">
        {{ errors?.username }}
      </p>
    </div>

    <!-- Password Field -->
    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <label
          for="password"
          class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
        >
          Password
        </label>
        <a href="#" class="text-xs font-medium text-primary hover:underline transition-colors">
          Forgot?
        </a>
      </div>
      <div class="relative">
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground"
        >
          <Lock class="h-4 w-4" />
        </div>
        <input
          id="password"
          v-model="password"
          v-bind="passwordAttrs"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          :class="[
            'block w-full pl-10 pr-10 py-3 text-sm rounded-xl bg-accent/25 border focus:outline-none focus:ring-1 transition-all',
            errors?.password
              ? 'border-destructive focus:ring-destructive focus:border-destructive bg-destructive/5'
              : 'border-border focus:ring-primary focus:border-primary',
          ]"
          :disabled="isSubmitting"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <EyeOff v-if="showPassword" class="h-4 w-4" />
          <Eye v-else class="h-4 w-4" />
        </button>
      </div>
      <p v-if="errors?.password" class="text-[11px] text-destructive font-medium">
        {{ errors?.password }}
      </p>
    </div>

    <!-- Remember Me Checkbox -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <input
          id="remember-me"
          type="checkbox"
          class="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
        />
        <label for="remember-me" class="text-xs text-muted-foreground font-medium cursor-pointer">
          Remember me
        </label>
      </div>
    </div>

    <!-- Submit Buttons -->
    <div class="space-y-3 pt-2">
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/10"
      >
        <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
        <span v-else>Sign In</span>
      </button>

      <!-- Quick Login / Demo Mode Button -->
      <button
        type="button"
        @click="handleDemoLogin"
        :disabled="isSubmitting"
        class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent hover:bg-accent/80 text-accent-foreground font-semibold text-sm border border-border/80 active:scale-[0.98] transition-all cursor-pointer shadow-sm group"
      >
        <Sparkles class="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
        <span>Quick Login (Demo Mode)</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}
</style>
