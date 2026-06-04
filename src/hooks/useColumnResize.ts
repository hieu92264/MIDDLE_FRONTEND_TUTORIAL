import { ref, onUnmounted } from 'vue'

/**
 * Composable xử lý column resize với hiệu năng tối ưu:
 * - Trong lúc kéo: cập nhật CSS Custom Property trực tiếp trên DOM (không trigger Vue reactivity)
 * - Khi thả chuột: gọi callback một lần duy nhất để update TanStack state
 * - RAF throttling: đảm bảo chỉ cập nhật DOM tối đa 1 lần/frame (~60fps)
 */
export function useColumnResize(onResizeEnd: (columnId: string, newSize: number) => void) {
  // ID của column đang được resize — chỉ dùng cho visual state của resize handle
  const resizingColumnId = ref<string | null>(null)

  // Internal state — dùng biến thường (không reactive) để tránh overhead
  let _startX = 0
  let _startSize = 0
  let _minSize = 40
  let _currentColumnId = ''
  let _containerEl: HTMLElement | null = null
  let _rafId: number | null = null
  let _currentSize = 0

  const _onMouseMove = (e: MouseEvent) => {
    // Hủy frame trước nếu chưa render kịp (throttle bằng RAF)
    if (_rafId !== null) cancelAnimationFrame(_rafId)

    _rafId = requestAnimationFrame(() => {
      const delta = e.clientX - _startX
      _currentSize = Math.max(_startSize + delta, _minSize)

      // ⚡ Viết thẳng vào DOM — KHÔNG qua Vue proxy, KHÔNG trigger reactivity
      _containerEl?.style.setProperty(`--col-${_currentColumnId}-size`, `${_currentSize}px`)
      _rafId = null
    })
  }

  const _onMouseUp = () => {
    if (_rafId !== null) {
      cancelAnimationFrame(_rafId)
      _rafId = null
    }

    // ✅ Chỉ lúc này mới trigger một lần re-render của Vue/TanStack
    onResizeEnd(_currentColumnId, _currentSize || _startSize)

    resizingColumnId.value = null
    _containerEl = null

    window.removeEventListener('mousemove', _onMouseMove)
    window.removeEventListener('mouseup', _onMouseUp)
  }

  /**
   * Khởi động resize khi mousedown trên resize handle
   * @param e - MouseEvent gốc
   * @param columnId - ID của column cần resize
   * @param currentSize - Kích thước hiện tại của column (px)
   * @param containerEl - Element cha chứa CSS custom properties
   * @param minSize - Kích thước tối thiểu (px), mặc định 40px
   */
  const startResize = (
    e: MouseEvent,
    columnId: string,
    currentSize: number,
    containerEl: HTMLElement,
    minSize = 40,
  ) => {
    // Ngăn text selection khi kéo
    e.preventDefault()

    _startX = e.clientX
    _startSize = currentSize
    _currentSize = currentSize
    _minSize = minSize
    _currentColumnId = columnId
    _containerEl = containerEl

    resizingColumnId.value = columnId

    // passive: true để không block browser scrolling
    window.addEventListener('mousemove', _onMouseMove, { passive: true })
    window.addEventListener('mouseup', _onMouseUp, { once: true })
  }

  // Cleanup khi component unmount
  onUnmounted(() => {
    window.removeEventListener('mousemove', _onMouseMove)
    window.removeEventListener('mouseup', _onMouseUp)
    if (_rafId !== null) cancelAnimationFrame(_rafId)
  })

  return {
    /** ID của column đang được resize (null nếu không có) */
    resizingColumnId,
    /** Gọi hàm này từ @mousedown trên resize handle */
    startResize,
  }
}
