<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import {
  DollarSign,
  Users,
  Activity,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Sliders,
  Download,
  Plus,
  RefreshCw,
  Clock,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()

const currentUser = computed(() => authStore.user || { username: 'Administrator' })

// Greeting logic based on time
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// Active tab for chart visualization
const chartTab = ref<'revenue' | 'users'>('revenue')

// Stats mock data
const stats = [
  {
    title: 'Total Revenue',
    value: '$48,259.00',
    change: '+12.5%',
    trend: 'up',
    detail: 'vs last month',
    icon: DollarSign,
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    title: 'Active Users',
    value: '10,245',
    change: '+8.1%',
    trend: 'up',
    detail: 'vs last week',
    icon: Users,
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
  {
    title: 'New Subscriptions',
    value: '1,204',
    change: '+24.3%',
    trend: 'up',
    detail: 'vs yesterday',
    icon: Activity,
    color: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  },
  {
    title: 'CPU Usage',
    value: '42.5%',
    change: '-2.4%',
    trend: 'down',
    detail: 'vs last hour',
    icon: Cpu,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
]

// Recent Transactions mock data
const transactions = ref([
  {
    id: '#TRX-9482',
    user: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    status: 'success',
    date: 'Oct 23, 2026',
  },
  {
    id: '#TRX-9481',
    user: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    status: 'success',
    date: 'Oct 22, 2026',
  },
  {
    id: '#TRX-9480',
    user: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    status: 'pending',
    date: 'Oct 22, 2026',
  },
  {
    id: '#TRX-9479',
    user: 'William Kim',
    email: 'will@email.com',
    amount: '-$250.00',
    status: 'failed',
    date: 'Oct 21, 2026',
  },
  {
    id: '#TRX-9478',
    user: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    status: 'success',
    date: 'Oct 20, 2026',
  },
])

// SVG chart animations and data points
const activeTooltipIndex = ref<number | null>(null)
const tooltipX = ref(0)
const tooltipY = ref(0)
const tooltipValue = ref('')

const chartData = computed(() => {
  if (chartTab.value === 'revenue') {
    return [
      { day: 'Mon', value: 12000, label: '$12,000' },
      { day: 'Tue', value: 19000, label: '$19,000' },
      { day: 'Wed', value: 15000, label: '$15,000' },
      { day: 'Thu', value: 24000, label: '$24,000' },
      { day: 'Fri', value: 22000, label: '$22,000' },
      { day: 'Sat', value: 30000, label: '$30,000' },
      { day: 'Sun', value: 28000, label: '$28,000' },
    ]
  } else {
    return [
      { day: 'Mon', value: 4200, label: '4,200 users' },
      { day: 'Tue', value: 5500, label: '5,500 users' },
      { day: 'Wed', value: 4800, label: '4,800 users' },
      { day: 'Thu', value: 7100, label: '7,100 users' },
      { day: 'Fri', value: 8500, label: '8,500 users' },
      { day: 'Sat', value: 9200, label: '9,200 users' },
      { day: 'Sun', value: 10245, label: '10,245 users' },
    ]
  }
})

// SVG geometry helpers
const chartWidth = 500
const chartHeight = 200
const padding = 30

const minMax = computed(() => {
  const values = chartData.value.map((d) => d.value)
  return {
    min: 0,
    max: Math.max(...values) * 1.1,
  }
})

const points = computed(() => {
  const data = chartData.value
  const { max } = minMax.value
  const xStep = (chartWidth - padding * 2) / (data.length - 1)

  return data.map((item, index) => {
    const x = padding + index * xStep
    const y = chartHeight - padding - (item.value / max) * (chartHeight - padding * 2)
    return { x, y, ...item }
  })
})

const linePath = computed(() => {
  const pts = points.value
  if (pts.length === 0) return ''
  return pts.reduce((path, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    // Add smooth curve cubic bezier
    const prev = pts[i - 1]
    if (!prev) return path
    const cp1x = prev.x + (p.x - prev.x) / 3
    const cp1y = prev.y
    const cp2x = prev.x + (2 * (p.x - prev.x)) / 3
    const cp2y = p.y
    return `${path} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`
  }, '')
})

const areaPath = computed(() => {
  const pts = points.value
  const lPath = linePath.value
  if (pts.length === 0) return ''
  const first = pts[0]
  const last = pts[pts.length - 1]
  if (!first || !last) return ''
  const bottomY = chartHeight - padding
  return `${lPath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`
})

const showTooltip = (index: number) => {
  activeTooltipIndex.value = index
  const pt = points.value[index]
  if (!pt) return
  tooltipX.value = pt.x
  tooltipY.value = pt.y - 12
  tooltipValue.value = pt.label
}

const hideTooltip = () => {
  activeTooltipIndex.value = null
}

const handleQuickAction = (actionName: string) => {
  toast.success(`Action "${actionName}" executed successfully (Demo Mode)`)
}

const isRefreshing = ref(false)
const refreshDashboard = () => {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
    // Jumble transaction amounts for dynamic feel
    transactions.value = transactions.value.map((t) => ({
      ...t,
      amount:
        (t.amount.startsWith('+') ? '+$' : '-$') +
        (Math.floor(Math.random() * 1000) + 10).toFixed(2),
    }))
    toast.success('Dashboard metrics refreshed')
  }, 1000)
}
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto">
    <!-- Top Greeting Section -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/45 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-sm relative overflow-hidden"
    >
      <!-- Ambient light lines inside greeting -->
      <div
        class="absolute top-0 right-0 w-[300px] h-full bg-gradient-to-l from-primary/5 via-transparent to-transparent pointer-events-none"
      ></div>

      <div class="space-y-1 relative z-10">
        <h1
          class="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2"
        >
          {{ greeting }},
          <span
            class="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent"
            >{{ currentUser.username }}</span
          >!
        </h1>
        <p class="text-xs text-muted-foreground flex items-center gap-2">
          <Clock class="h-3.5 w-3.5" />
          {{ currentDate }}
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0 relative z-10">
        <button
          @click="refreshDashboard"
          class="h-10 px-4 rounded-xl border border-border bg-card/60 text-foreground hover:bg-accent text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <RefreshCw :class="['h-3.5 w-3.5', isRefreshing ? 'animate-spin' : '']" />
          Refresh
        </button>
        <button
          @click="handleQuickAction('Export data')"
          class="h-10 px-4 rounded-xl border border-border bg-card/60 text-foreground hover:bg-accent text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Download class="h-3.5 w-3.5" />
          Export
        </button>
        <button
          @click="handleQuickAction('Create items')"
          class="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 transition-all hover:opacity-90 cursor-pointer shadow-md shadow-primary/10 active:scale-95"
        >
          <Plus class="h-4 w-4" />
          New Invoice
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative group overflow-hidden"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{{
            stat.title
          }}</span>
          <div
            :class="[
              'h-9 w-9 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105',
              stat.color,
            ]"
          >
            <component :is="stat.icon" class="h-4 w-4" />
          </div>
        </div>
        <div class="mt-4 space-y-1">
          <div class="text-2xl font-bold tracking-tight text-foreground">
            {{ stat.value }}
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <span
              :class="[
                'flex items-center font-semibold rounded-full px-1.5 py-0.5 text-[10px]',
                stat.trend === 'up'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-destructive/10 text-destructive',
              ]"
            >
              <ArrowUpRight v-if="stat.trend === 'up'" class="h-3 w-3 shrink-0" />
              <ArrowDownRight v-else class="h-3 w-3 shrink-0" />
              {{ stat.change }}
            </span>
            <span class="text-muted-foreground">{{ stat.detail }}</span>
          </div>
        </div>

        <!-- Decorative background micro-glow -->
        <div
          class="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        ></div>
      </div>
    </div>

    <!-- Middle Visualization & Actions Area -->
    <div class="grid gap-6 lg:grid-cols-7">
      <!-- Interactive Custom SVG Chart Card -->
      <div
        class="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-6 lg:col-span-4 flex flex-col justify-between shadow-sm relative overflow-hidden"
      >
        <div class="flex items-center justify-between mb-6">
          <div class="space-y-1">
            <h2 class="text-base font-bold text-foreground">Analytics Overview</h2>
            <p class="text-xs text-muted-foreground">Showing key performance indicators</p>
          </div>
          <!-- Toggle Tabs -->
          <div class="flex items-center bg-accent/40 rounded-xl p-1 border border-border">
            <button
              @click="chartTab = 'revenue'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                chartTab === 'revenue'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              ]"
            >
              Revenue
            </button>
            <button
              @click="chartTab = 'users'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                chartTab === 'users'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              ]"
            >
              Active Users
            </button>
          </div>
        </div>

        <!-- SVG Line Chart Viewport -->
        <div class="relative w-full aspect-[5/2] mt-2 flex items-center justify-center">
          <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="w-full h-full overflow-visible">
            <defs>
              <!-- Ambient Purple Gradient Underneath Chart Area -->
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stop-color="var(--color-primary, oklch(0.205 0 0))"
                  stop-opacity="0.25"
                />
                <stop
                  offset="100%"
                  stop-color="var(--color-primary, oklch(0.205 0 0))"
                  stop-opacity="0.00"
                />
              </linearGradient>
            </defs>

            <!-- Grid Lines (Horizontal) -->
            <line
              v-for="i in 4"
              :key="i"
              :x1="padding"
              :y1="padding + ((chartHeight - padding * 2) / 4) * i"
              :x2="chartWidth - padding"
              :y2="padding + ((chartHeight - padding * 2) / 4) * i"
              stroke="var(--color-border)"
              stroke-width="1"
              stroke-dasharray="3 3"
            />

            <!-- Filled Area Under Curve -->
            <path
              :d="areaPath"
              fill="url(#chartGradient)"
              class="transition-all duration-500 ease-in-out"
            />

            <!-- Highlight Stroke Curve Line -->
            <path
              :d="linePath"
              fill="none"
              stroke="var(--color-primary)"
              stroke-width="3"
              stroke-linecap="round"
              class="transition-all duration-500 ease-in-out"
            />

            <!-- Interactive Hotspot Data Circles -->
            <circle
              v-for="(pt, idx) in points"
              :key="idx"
              :cx="pt.x"
              :cy="pt.y"
              r="4.5"
              fill="var(--background)"
              stroke="var(--color-primary)"
              stroke-width="2"
              class="transition-all duration-300 ease-in-out hover:r-6 cursor-pointer"
              @mouseenter="showTooltip(idx)"
              @mouseleave="hideTooltip"
            />

            <!-- X Axis Text Marks -->
            <text
              v-for="pt in points"
              :key="pt.day"
              :x="pt.x"
              :y="chartHeight - 8"
              text-anchor="middle"
              fill="var(--color-muted-foreground)"
              font-size="10"
              font-family="sans-serif"
              font-weight="500"
            >
              {{ pt.day }}
            </text>
          </svg>

          <!-- Interactive Tooltip Overlay HTML -->
          <div
            v-if="activeTooltipIndex !== null"
            class="absolute pointer-events-none rounded-lg bg-card/95 border border-border px-2.5 py-1.5 shadow-lg flex flex-col text-[11px] font-bold z-10 transition-all duration-100"
            :style="{
              left: `${(tooltipX / chartWidth) * 100}%`,
              top: `${(tooltipY / chartHeight) * 100}%`,
              transform: 'translate(-50%, -100%)',
            }"
          >
            <span class="text-muted-foreground text-[9px] font-medium leading-none mb-1">
              {{ chartData[activeTooltipIndex]?.day }}
            </span>
            <span class="text-foreground text-xs leading-none">
              {{ tooltipValue }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-6 mt-6 pt-4 border-t border-border/80 text-xs">
          <div class="flex items-center gap-1.5 font-medium">
            <span class="h-2.5 w-2.5 rounded-full bg-primary"></span>
            <span>Current Period</span>
          </div>
          <div class="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp class="h-3.5 w-3.5 text-emerald-500" />
            <span>Growth trend positive for 3 consecutive quarters</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions / System Health Widgets -->
      <div class="grid gap-5 lg:col-span-3">
        <!-- Quick Action Grid -->
        <div
          class="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div class="space-y-1 mb-4">
            <h2 class="text-base font-bold text-foreground">Quick Tools</h2>
            <p class="text-xs text-muted-foreground">Manage regular operations</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              @click="handleQuickAction('Invite users')"
              class="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:border-primary/20 hover:bg-accent/30 text-center gap-2 group cursor-pointer transition-all"
            >
              <div
                class="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform"
              >
                <Users class="h-4.5 w-4.5" />
              </div>
              <span class="text-xs font-semibold">Invite User</span>
            </button>
            <button
              @click="handleQuickAction('System configuration')"
              class="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:border-primary/20 hover:bg-accent/30 text-center gap-2 group cursor-pointer transition-all"
            >
              <div
                class="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center group-hover:scale-105 transition-transform"
              >
                <Sliders class="h-4.5 w-4.5" />
              </div>
              <span class="text-xs font-semibold">Config Rules</span>
            </button>
          </div>

          <div class="mt-4 pt-4 border-t border-border/80 space-y-3.5">
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-muted-foreground">Monthly Email Quota</span>
                <span class="text-foreground">8,245 / 10,000</span>
              </div>
              <div class="h-2 w-full bg-accent/40 rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full" style="width: 82.45%"></div>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-muted-foreground">Storage Allocated</span>
                <span class="text-foreground">1.2 TB / 5 TB</span>
              </div>
              <div class="h-2 w-full bg-accent/40 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full" style="width: 24%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions Section -->
    <div class="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="space-y-1">
          <h2 class="text-base font-bold text-foreground">Recent Activities</h2>
          <p class="text-xs text-muted-foreground">You made 265 sales this month</p>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="overflow-x-auto rounded-xl border border-border bg-card/20">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="border-b border-border bg-accent/25 text-muted-foreground text-xs font-semibold"
            >
              <th class="p-4">Transaction ID</th>
              <th class="p-4">Customer</th>
              <th class="p-4">Date</th>
              <th class="p-4">Amount</th>
              <th class="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-xs">
            <tr
              v-for="tx in transactions"
              :key="tx.id"
              class="hover:bg-accent/20 transition-colors"
            >
              <td class="p-4 font-mono text-[11px] text-muted-foreground font-semibold">
                {{ tx.id }}
              </td>
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div
                    class="h-8 w-8 rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center shrink-0 border border-border"
                  >
                    {{ tx.user.charAt(0) }}
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="font-semibold text-foreground truncate">{{ tx.user }}</span>
                    <span class="text-[10px] text-muted-foreground truncate">{{ tx.email }}</span>
                  </div>
                </div>
              </td>
              <td class="p-4 text-muted-foreground">
                {{ tx.date }}
              </td>
              <td class="p-4 font-semibold text-foreground">
                {{ tx.amount }}
              </td>
              <td class="p-4 text-right">
                <span
                  :class="[
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                    tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : '',
                    tx.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : '',
                    tx.status === 'failed' ? 'bg-destructive/10 text-destructive' : '',
                  ]"
                >
                  <span
                    :class="[
                      'h-1.5 w-1.5 rounded-full shrink-0',
                      tx.status === 'success' ? 'bg-emerald-500' : '',
                      tx.status === 'pending' ? 'bg-amber-500' : '',
                      tx.status === 'failed' ? 'bg-destructive' : '',
                    ]"
                  />
                  {{ tx.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
