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

// Generate twinkling stars on canvas
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
  <div class="nf-root">
    <!-- Space background image -->
    <div class="nf-bg" :style="{ backgroundImage: `url(${spaceBg})` }" />

    <!-- Twinkling star canvas overlay -->
    <canvas ref="canvasRef" class="nf-canvas" />

    <!-- Main content -->
    <div class="nf-content">
      <!-- Big 404 -->
      <h1 class="nf-code">404</h1>

      <!-- Title + description -->
      <div class="nf-text-block">
        <h2 class="nf-title">Page Not Found</h2>
        <p class="nf-desc">Sorry, we couldn't find the page you're looking for</p>
        <button class="nf-btn" @click="goHome">Back To Home</button>
      </div>

      <!-- Fun annotation (right side) -->
      <div class="nf-annotation">
        <span class="nf-annotation-text">But I'm sure what you're looking<br />for is in here somewhere.</span>
        <svg class="nf-arrow" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 10 C30 5, 55 30, 60 65"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
            style="stroke-dasharray: 120; stroke-dashoffset: 0;"
          />
          <!-- Arrowhead -->
          <path
            d="M50 63 C55 68, 63 70, 68 65"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
          <path
            d="M57 74 C60 68, 63 70, 68 65"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>

    <!-- Bottom fact -->
    <div class="nf-fact">
      <span>
        Did you know? This photo shows Earth<br />
        from about 6 billion kilometers away as a<br />
        'Pale Blue Dot,' captured by Voyager 1.
      </span>
    </div>
  </div>
</template>

<style scoped>
.nf-root {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #fff;
}

/* Background image */
.nf-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.55);
  z-index: 0;
}

/* Canvas twinkling stars */
.nf-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

/* Main content */
.nf-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 5rem 5vw 0 5vw;
  gap: 3rem;
  min-height: 80vh;
}

/* Big 404 number */
.nf-code {
  font-size: clamp(100px, 18vw, 200px);
  font-weight: 900;
  line-height: 0.9;
  margin: 0;
  letter-spacing: -4px;
  white-space: nowrap;
  text-shadow: 0 0 60px rgba(255, 255, 255, 0.15);
  animation: nf-float 5s ease-in-out infinite;
  flex-shrink: 0;
}

/* Text block */
.nf-text-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.nf-title {
  font-size: clamp(22px, 3.5vw, 38px);
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.nf-desc {
  font-size: clamp(13px, 1.4vw, 16px);
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  max-width: 380px;
  line-height: 1.6;
}

/* Back to home button */
.nf-btn {
  margin-top: 0.5rem;
  padding: 0.55rem 1.4rem;
  border: 1.5px solid rgba(255, 255, 255, 0.65);
  background: transparent;
  color: #fff;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
}
.nf-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #fff;
  transform: translateY(-1px);
}
.nf-btn:active {
  transform: scale(0.97);
}

/* Annotation */
.nf-annotation {
  position: absolute;
  right: 10vw;
  top: 38%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  max-width: 200px;
  z-index: 3;
}
.nf-annotation-text {
  font-family: 'Caveat', 'Patrick Hand', cursive, sans-serif;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  text-align: left;
}
.nf-arrow {
  width: 70px;
  height: 70px;
  margin-left: 8px;
  opacity: 0.8;
  animation: nf-arrow-bounce 2.5s ease-in-out infinite;
}

/* Bottom fact */
.nf-fact {
  position: absolute;
  bottom: 2rem;
  left: 5vw;
  z-index: 2;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.7;
}

/* Animations */
@keyframes nf-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes nf-arrow-bounce {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(6px) rotate(5deg); }
}

/* Responsive */
@media (max-width: 700px) {
  .nf-content {
    flex-direction: column;
    padding: 3rem 6vw 0 6vw;
    gap: 1.5rem;
    min-height: unset;
  }
  .nf-annotation {
    position: relative;
    right: unset;
    top: unset;
    margin-left: 0;
  }
  .nf-fact {
    position: relative;
    bottom: unset;
    left: unset;
    padding: 2rem 6vw;
  }
}
</style>
