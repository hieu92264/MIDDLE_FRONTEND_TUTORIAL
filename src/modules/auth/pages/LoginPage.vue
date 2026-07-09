<script setup lang="ts">
import LoginForm from '../components/LoginForm.vue'
</script>

<template>
  <div class="login-page">
    <!-- Back button top-left -->
    <button class="login-back-btn" @click="$router.back()" title="Quay lại">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Settings icon top-right -->
    <button class="login-settings-btn" title="Cài đặt">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Main Content -->
    <div class="login-container">
      <!-- Title -->
      <div class="login-header">
        <h1 class="login-title">Đăng nhập vào hệ thống</h1>
        <p class="login-subtitle">
          Nhập tài khoản, mật khẩu và chọn bộ phận đang công tác để truy cập vào<br />hệ thống
        </p>
      </div>

      <!-- Steps indicator -->
      <div class="login-steps">
        <div class="login-step login-step--active">
          <div class="login-step-circle login-step-circle--active">1</div>
          <span class="login-step-label login-step-label--active">Xác thực tài khoản</span>
        </div>
        <div class="login-step-line" />
        <div class="login-step">
          <div class="login-step-circle">2</div>
          <span class="login-step-label">Chọn đơn vị công tác</span>
        </div>
      </div>

      <!-- Login Form Card -->
      <div class="login-card">
        <LoginForm />
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: 'Inter', 'Be Vietnam Pro', sans-serif;
}

/* Back button */
.login-back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.15s ease, color 0.15s ease;
}
.login-back-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Settings button */
.login-settings-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.15s ease, color 0.15s ease;
}
.login-settings-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Container */
.login-container {
  width: 100%;
  max-width: 480px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* Header */
.login-header {
  text-align: center;
}

.login-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
  letter-spacing: -0.3px;
}

.login-subtitle {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* Steps */
.login-steps {
  display: flex;
  align-items: center;
  gap: 0;
  width: 100%;
  max-width: 380px;
  padding: 12px 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.login-step {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.login-step-line {
  width: 40px;
  height: 1px;
  background: #d1d5db;
  flex-shrink: 0;
  margin: 0 4px;
}

.login-step-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  flex-shrink: 0;
  background: #fff;
}

.login-step-circle--active {
  border-color: #16a34a;
  background: #fff;
  color: #16a34a;
}

.login-step-label {
  font-size: 12.5px;
  color: #9ca3af;
  font-weight: 500;
}

.login-step-label--active {
  color: #16a34a;
  font-weight: 600;
}

/* Card */
.login-card {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 28px 32px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

@media (max-width: 480px) {
  .login-card {
    padding: 20px 16px;
  }
}
</style>
