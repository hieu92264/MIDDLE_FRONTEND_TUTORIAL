<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue'
import spaceBg from '@/assets/space-bg.png'

const router = useRouter()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animFrameId: number

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function initStars(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const stars: { x: number; y: number; r: number; alpha: number; delta: number }[] = []
  for (let i = 0; i < 220; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random(),
      delta: (Math.random() - 0.5) * 0.012,
    })
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const s of stars) {
      s.alpha += s.delta
      if (s.alpha <= 0 || s.alpha >= 1) s.delta *= -1
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, s.alpha))})`
      ctx.fill()
    }
    animFrameId = requestAnimationFrame(draw)
  }
  draw()
}

onMounted(() => {
  if (canvasRef.value) initStars(canvasRef.value)
})
onUnmounted(() => {
  cancelAnimationFrame(animFrameId)
})
</script>

<template>
  <div class="fb-root">
    <!-- Space background image (slightly red tinted for forbidden) -->
    <div class="fb-bg" :style="{ backgroundImage: `url(${spaceBg})` }" />

    <!-- Red nebula overlay for 403 mood -->
    <div class="fb-nebula" />

    <!-- Twinkling star canvas overlay -->
    <canvas ref="canvasRef" class="fb-canvas" />

    <!-- Main content -->
    <div class="fb-content">
      <!-- Big 403 -->
      <h1 class="fb-code">403</h1>

      <!-- Title + description -->
      <div class="fb-text-block">
        <h2 class="fb-title">Access Forbidden</h2>
        <p class="fb-desc">
          You don't have permission to access this page. Please contact your administrator or go
          back to safety.
        </p>
        <div class="fb-actions">
          <button class="fb-btn fb-btn--outline" @click="goBack">Go Back</button>
          <button class="fb-btn fb-btn--solid" @click="goHome">Back To Home</button>
        </div>
      </div>

      <!-- Annotation (right side) -->
      <div class="fb-annotation">
        <span class="fb-annotation-text">This zone is<br />restricted territory.</span>
        <svg class="fb-arrow" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 10 C30 5, 55 30, 60 65"
            stroke="rgba(255,120,80,0.9)"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
          <path
            d="M50 63 C55 68, 63 70, 68 65"
            stroke="rgba(255,120,80,0.9)"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
          <path
            d="M57 74 C60 68, 63 70, 68 65"
            stroke="rgba(255,120,80,0.9)"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>

    <!-- Bottom fact -->
    <div class="fb-fact">
      <span>
        Error 403 — Your credentials don't grant<br />
        access to this resource. All access attempts<br />
        are logged and monitored.
      </span>
    </div>
  </div>
</template>

<style scoped>
.fb-root {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #fff;
}

/* Background image */
.fb-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.5) saturate(0.8);
  z-index: 0;
}

/* Red nebula overlay */
.fb-nebula {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 50% at 35% 40%, rgba(220, 50, 30, 0.18) 0%, transparent 70%);
  z-index: 1;
  pointer-events: none;
}

/* Canvas twinkling stars */
.fb-canvas {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

/* Main content */
.fb-content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 5rem 5vw 0 5vw;
  gap: 3rem;
  min-height: 80vh;
}

/* Big 403 number */
.fb-code {
  font-size: clamp(100px, 18vw, 200px);
  font-weight: 900;
  line-height: 0.9;
  margin: 0;
  letter-spacing: -4px;
  white-space: nowrap;
  background: linear-gradient(135deg, #fff 20%, rgba(255, 100, 70, 0.85) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  filter: drop-shadow(0 0 40px rgba(255, 70, 40, 0.3));
  animation: fb-float 5s ease-in-out infinite;
  flex-shrink: 0;
}

/* Text block */
.fb-text-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.fb-title {
  font-size: clamp(22px, 3.5vw, 38px);
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.fb-desc {
  font-size: clamp(13px, 1.4vw, 16px);
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  max-width: 380px;
  line-height: 1.6;
}

/* Actions */
.fb-actions {
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

/* Buttons */
.fb-btn {
  padding: 0.55rem 1.4rem;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
}
.fb-btn--outline {
  border: 1.5px solid rgba(255, 255, 255, 0.65);
  background: transparent;
  color: #fff;
}
.fb-btn--outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
  transform: translateY(-1px);
}
.fb-btn--solid {
  border: 1.5px solid rgba(255, 90, 60, 0.8);
  background: rgba(220, 50, 30, 0.25);
  color: #fff;
  backdrop-filter: blur(4px);
}
.fb-btn--solid:hover {
  background: rgba(220, 50, 30, 0.45);
  transform: translateY(-1px);
}
.fb-btn:active {
  transform: scale(0.97);
}

/* Annotation */
.fb-annotation {
  position: absolute;
  right: 10vw;
  top: 38%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  max-width: 200px;
  z-index: 4;
}
.fb-annotation-text {
  font-family: 'Caveat', 'Patrick Hand', cursive, sans-serif;
  font-size: 15px;
  color: rgba(255, 160, 120, 0.9);
  line-height: 1.5;
  text-align: left;
}
.fb-arrow {
  width: 70px;
  height: 70px;
  margin-left: 8px;
  opacity: 0.85;
  animation: fb-arrow-bounce 2.5s ease-in-out infinite;
}

/* Bottom fact */
.fb-fact {
  position: absolute;
  bottom: 2rem;
  left: 5vw;
  z-index: 3;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.7;
}

/* Animations */
@keyframes fb-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes fb-arrow-bounce {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(6px) rotate(5deg); }
}

/* Responsive */
@media (max-width: 700px) {
  .fb-content {
    flex-direction: column;
    padding: 3rem 6vw 0 6vw;
    gap: 1.5rem;
    min-height: unset;
  }
  .fb-annotation {
    position: relative;
    right: unset;
    top: unset;
    margin-left: 0;
  }
  .fb-fact {
    position: relative;
    bottom: unset;
    left: unset;
    padding: 2rem 6vw;
  }
}
</style>
