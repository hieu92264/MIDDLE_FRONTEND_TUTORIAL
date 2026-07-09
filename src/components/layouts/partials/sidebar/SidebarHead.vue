<script setup lang="ts">
import { computed } from 'vue'
import { useSidebarStore } from '@/stores/sidebar.store'

const sidebarStore = useSidebarStore()
const isCollapsed = computed(() => sidebarStore.isCollapsed)
</script>

<template>
  <div class="sidebar-head" :class="{ 'sidebar-head--collapsed': isCollapsed }">

    <!-- Logo box — giống WMS: hộp vuông chữ viết tắt -->
    <div class="logo-box">
      <span class="logo-box__text">HRM</span>
      <span class="logo-box__line" />
    </div>

    <!-- Full name stacked — chỉ hiện khi expanded -->
    <Transition name="sidebar-text">
      <div v-if="!isCollapsed" class="logo-name">
        <span class="logo-name__line">HUMAN</span>
        <span class="logo-name__line">RESOURCE</span>
        <span class="logo-name__line logo-name__line--accent">MANAGEMENT</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ─── Wrapper ─── */
.sidebar-head {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border-bottom: 1px solid var(--sidebar-border);
  overflow: hidden;
  white-space: nowrap;
  cursor: default;
  flex-shrink: 0;
  transition: padding 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-head--collapsed {
  padding: 0;
  justify-content: center;
}

/* ─── Logo Box (hộp vuông kiểu WMS) ─── */
.logo-box {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  /* Dùng primary green cố định — luôn sáng, không bị mờ theo sidebar-foreground */
  background: #16a34a;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.2),
    0 2px 10px rgba(22, 163, 74, 0.45);
  position: relative;
  overflow: hidden;
}

/* Gloss overlay */
.logo-box::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%);
  pointer-events: none;
}

.logo-box__text {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.06em;
  color: #ffffff;
  line-height: 1;
  font-family: 'Inter', system-ui, sans-serif;
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);
}

.logo-box__line {
  display: block;
  width: 20px;
  height: 1.5px;
  background: #ffffff;
  border-radius: 1px;
  opacity: 0.55;
  position: relative;
  z-index: 1;
}

/* ─── Stacked text name ─── */
.logo-name {
  display: flex;
  flex-direction: column;
  gap: 0;
  line-height: 1.25;
}

.logo-name__line {
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--sidebar-muted-foreground);
  line-height: 1.4;
}

.logo-name__line--accent {
  color: var(--sidebar-foreground);
  font-weight: 700;
}

/* ─── Transition ─── */
.sidebar-text-enter-active,
.sidebar-text-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.sidebar-text-enter-from,
.sidebar-text-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}
</style>
