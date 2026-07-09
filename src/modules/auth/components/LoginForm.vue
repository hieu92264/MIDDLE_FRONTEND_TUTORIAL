<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema } from '@/modules/auth/schemas'
import { useLoginMutation } from '@/modules/auth/queries/auth.query'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { toast } from 'vue-sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next'

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
      throw new Error('Invalid authentication response')
    }
  } catch (err) {
    console.error('Login error:', err)

    const error = err as {
      response?: { data?: { message?: string } }
      code?: string
      message?: string
    }

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

  const mockPayload = {
    access_token: 'mock-jwt-token-xyz-123456',
    token_type: 'bearer',
    expires_in: 3600,
    user: {
      id: 1,
      username: 'Administrator',
      email: 'admin@hrm-system.dev',
      role: 'administrator',
      is_active: true,
      created_at: new Date().toISOString(),
      user_name_created: null,
      updated_at: new Date().toISOString(),
      user_name_updated: null,
    },
  }

  authStore.setSession(mockPayload)
  toast.success('Đăng nhập thành công (Demo Mode)')
  router.push('/')
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="login-form">
    <!-- Server/API Error Alert -->
    <div
      v-if="apiError"
      class="login-error"
    >
      {{ apiError }}
    </div>

    <!-- Tài khoản -->
    <div class="lf-field">
      <label for="username" class="lf-label">Tài khoản</label>
      <input
        id="username"
        v-model="username"
        v-bind="usernameAttrs"
        type="text"
        placeholder="Nhập tài khoản"
        class="lf-input"
        :class="{ 'lf-input--error': errors?.username }"
        :disabled="isSubmitting"
      />
      <p v-if="errors?.username" class="lf-error-msg">{{ errors?.username }}</p>
    </div>

    <!-- Mật khẩu -->
    <div class="lf-field">
      <label for="password" class="lf-label">Mật khẩu</label>
      <div class="lf-input-wrap">
        <input
          id="password"
          v-model="password"
          v-bind="passwordAttrs"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          class="lf-input lf-input--pw"
          :class="{ 'lf-input--error': errors?.password }"
          :disabled="isSubmitting"
        />
        <button
          type="button"
          class="lf-eye-btn"
          @click="showPassword = !showPassword"
          tabindex="-1"
        >
          <EyeOff v-if="showPassword" :size="16" />
          <Eye v-else :size="16" />
        </button>
      </div>
      <p v-if="errors?.password" class="lf-error-msg">{{ errors?.password }}</p>
    </div>

    <!-- Remember Me + Forgot -->
    <div class="lf-remember-row">
      <label class="lf-checkbox-label">
        <input type="checkbox" class="lf-checkbox" />
        <span>Ghi nhớ tài khoản</span>
      </label>
      <a href="#" class="lf-forgot">Quên mật khẩu?</a>
    </div>

    <!-- Submit -->
    <div class="lf-actions">
      <button
        type="submit"
        :disabled="isSubmitting"
        class="lf-btn-submit"
      >
        <Loader2 v-if="isSubmitting" :size="16" class="lf-spinner" />
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Đăng nhập</span>
      </button>

      <!-- Demo Mode -->
      <button
        type="button"
        @click="handleDemoLogin"
        :disabled="isSubmitting"
        class="lf-btn-demo"
      >
        <span>Quick Login (Demo Mode)</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Error alert */
.login-error {
  padding: 10px 14px;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 13px;
  line-height: 1.5;
  animation: shake 0.4s ease-in-out;
}

/* Field */
.lf-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lf-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.lf-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13.5px;
  color: #111827;
  background: #fff;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  width: 100%;
}

.lf-input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.12);
}

.lf-input--error {
  border-color: #ef4444;
}
.lf-input--error:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.12);
}

.lf-input-wrap {
  position: relative;
}

.lf-input--pw {
  padding-right: 42px;
}

.lf-eye-btn {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.15s;
}
.lf-eye-btn:hover {
  color: #374151;
}

.lf-error-msg {
  font-size: 11.5px;
  color: #ef4444;
  margin: 0;
}

/* Remember row */
.lf-remember-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -4px;
}

.lf-checkbox-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.lf-checkbox {
  width: 15px;
  height: 15px;
  accent-color: #16a34a;
  cursor: pointer;
}

.lf-forgot {
  font-size: 12.5px;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.15s;
}
.lf-forgot:hover {
  color: #16a34a;
}

/* Actions */
.lf-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

.lf-btn-submit {
  width: 100%;
  height: 42px;
  border-radius: 6px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s ease, transform 0.1s ease;
}

.lf-btn-submit:hover {
  background: #111111;
}

.lf-btn-submit:active {
  transform: scale(0.99);
}

.lf-btn-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.lf-spinner {
  animation: spin 0.8s linear infinite;
}

.lf-btn-demo {
  width: 100%;
  height: 38px;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.lf-btn-demo:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
