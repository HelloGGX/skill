"""
Admin Dashboard Setup Script

Sets up a complete admin dashboard template with sidebar, data table, and analytics cards.
This script transforms a basic Vue project into a production-ready admin dashboard.
"""

import subprocess
import sys
from pathlib import Path
from typing import Optional


class DashboardSetup:
    """Setup admin dashboard template."""

    def __init__(self, project_path: Path):
        self.project_path = project_path
        self.is_windows = sys.platform.startswith("win")

    def run_command(self, command: list[str], cwd: Optional[Path] = None) -> None:
        """Run command silently, exit on failure."""
        try:
            subprocess.run(
                command,
                check=True,
                cwd=cwd or self.project_path,
                shell=self.is_windows,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
        except subprocess.CalledProcessError as e:
            print(f"\n命令执行失败: {' '.join(command)}", file=sys.stderr)
            print(f"错误信息: {e.stderr}", file=sys.stderr)
            sys.exit(1)

    def write_file(self, path: Path, content: str) -> None:
        """Write content to file."""
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")

    def install_dashboard_components(self) -> None:
        """Install dashboard components from shadcn-vue."""
        print("📦 Installing dashboard components...")

        # Install required dependencies for dashboard
        print("  Installing dnd-kit dependencies...")
        self.run_command(["bun", "add", "dnd-kit-vue", "@dnd-kit/abstract"])

        # Install dashboard components
        print("  Installing dashboard-01 components...")
        self.run_command(["npx", "shadcn-vue@latest", "add", "dashboard-01"])

    def create_dashboard_view(self) -> None:
        """Create the main dashboard view."""
        print("📄 Creating dashboard view...")

        dashboard_content = """<script lang="ts">
export const iframeHeight = "800px"
export const description = "A dashboard with sidebar, data table, and analytics cards."
</script>

<script setup lang="ts">
import ChartAreaInteractive from "@/components/ChartAreaInteractive.vue"
import DataTable from "@/components/DataTable.vue"
import SectionCards from "@/components/SectionCards.vue"

const data = [
  {
    id: 1,
    header: "Cover page",
    type: "Cover page",
    status: "In Process",
    target: "18",
    limit: "5",
    reviewer: "Eddie Lake",
  },
  {
    id: 2,
    header: "Table of contents",
    type: "Table of contents",
    status: "Done",
    target: "29",
    limit: "24",
    reviewer: "Eddie Lake",
  },
  {
    id: 3,
    header: "Executive summary",
    type: "Narrative",
    status: "Done",
    target: "10",
    limit: "13",
    reviewer: "Eddie Lake",
  },
  {
    id: 4,
    header: "Technical approach",
    type: "Narrative",
    status: "Done",
    target: "27",
    limit: "23",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 5,
    header: "Design",
    type: "Narrative",
    status: "In Process",
    target: "2",
    limit: "16",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 6,
    header: "Capabilities",
    type: "Narrative",
    status: "In Process",
    target: "20",
    limit: "8",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 7,
    header: "Integration with existing systems",
    type: "Narrative",
    status: "In Process",
    target: "19",
    limit: "21",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 8,
    header: "Innovation and Advantages",
    type: "Narrative",
    status: "Done",
    target: "25",
    limit: "26",
    reviewer: "Assign reviewer",
  },
  {
    id: 9,
    header: "Overview of EMR's Innovative Solutions",
    type: "Technical content",
    status: "Done",
    target: "7",
    limit: "23",
    reviewer: "Assign reviewer",
  },
  {
    id: 10,
    header: "Advanced Algorithms and Machine Learning",
    type: "Narrative",
    status: "Done",
    target: "30",
    limit: "28",
    reviewer: "Assign reviewer",
  },
  {
    id: 11,
    header: "Adaptive Communication Protocols",
    type: "Narrative",
    status: "Done",
    target: "9",
    limit: "31",
    reviewer: "Assign reviewer",
  },
  {
    id: 12,
    header: "Advantages Over Current Technologies",
    type: "Narrative",
    status: "Done",
    target: "12",
    limit: "0",
    reviewer: "Assign reviewer",
  },
  {
    id: 13,
    header: "Past Performance",
    type: "Narrative",
    status: "Done",
    target: "22",
    limit: "33",
    reviewer: "Assign reviewer",
  },
  {
    id: 14,
    header: "Customer Feedback and Satisfaction Levels",
    type: "Narrative",
    status: "Done",
    target: "15",
    limit: "34",
    reviewer: "Assign reviewer",
  },
  {
    id: 15,
    header: "Implementation Challenges and Solutions",
    type: "Narrative",
    status: "Done",
    target: "3",
    limit: "35",
    reviewer: "Assign reviewer",
  },
  {
    id: 16,
    header: "Security Measures and Data Protection Policies",
    type: "Narrative",
    status: "In Process",
    target: "6",
    limit: "36",
    reviewer: "Assign reviewer",
  },
  {
    id: 17,
    header: "Scalability and Future Proofing",
    type: "Narrative",
    status: "Done",
    target: "4",
    limit: "37",
    reviewer: "Assign reviewer",
  },
  {
    id: 18,
    header: "Cost-Benefit Analysis",
    type: "Plain language",
    status: "Done",
    target: "14",
    limit: "38",
    reviewer: "Assign reviewer",
  },
  {
    id: 19,
    header: "User Training and Onboarding Experience",
    type: "Narrative",
    status: "Done",
    target: "17",
    limit: "39",
    reviewer: "Assign reviewer",
  },
  {
    id: 20,
    header: "Future Development Roadmap",
    type: "Narrative",
    status: "Done",
    target: "11",
    limit: "40",
    reviewer: "Assign reviewer",
  },
  {
    id: 21,
    header: "System Architecture Overview",
    type: "Technical content",
    status: "In Process",
    target: "24",
    limit: "18",
    reviewer: "Maya Johnson",
  },
  {
    id: 22,
    header: "Risk Management Plan",
    type: "Narrative",
    status: "Done",
    target: "15",
    limit: "22",
    reviewer: "Carlos Rodriguez",
  },
  {
    id: 23,
    header: "Compliance Documentation",
    type: "Legal",
    status: "In Process",
    target: "31",
    limit: "27",
    reviewer: "Sarah Chen",
  },
  {
    id: 24,
    header: "API Documentation",
    type: "Technical content",
    status: "Done",
    target: "8",
    limit: "12",
    reviewer: "Raj Patel",
  },
  {
    id: 25,
    header: "User Interface Mockups",
    type: "Visual",
    status: "In Process",
    target: "19",
    limit: "25",
    reviewer: "Leila Ahmadi",
  },
  {
    id: 26,
    header: "Database Schema",
    type: "Technical content",
    status: "Done",
    target: "22",
    limit: "20",
    reviewer: "Thomas Wilson",
  },
  {
    id: 27,
    header: "Testing Methodology",
    type: "Technical content",
    status: "In Process",
    target: "17",
    limit: "14",
    reviewer: "Assign reviewer",
  },
  {
    id: 28,
    header: "Deployment Strategy",
    type: "Narrative",
    status: "Done",
    target: "26",
    limit: "30",
    reviewer: "Eddie Lake",
  },
  {
    id: 29,
    header: "Budget Breakdown",
    type: "Financial",
    status: "In Process",
    target: "13",
    limit: "16",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 30,
    header: "Market Analysis",
    type: "Research",
    status: "Done",
    target: "29",
    limit: "32",
    reviewer: "Sophia Martinez",
  },
]
</script>

<template>
  <div class="@container/main flex flex-1 flex-col">
    <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div class="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable :data="data" />
    </div>
  </div>
</template>
"""
        dashboard_path = self.project_path / "src" / "views" / "DashboardView.vue"
        self.write_file(dashboard_path, dashboard_content)

        # Remove old HomeView.vue if it exists
        home_view = self.project_path / "src" / "views" / "HomeView.vue"
        if home_view.exists():
            home_view.unlink()

    def create_router(self) -> None:
        """Create complete router configuration with guards and meta."""
        print("🔧 Creating router configuration...")

        router_content = """import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录', guest: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '仪表盘', icon: 'dashboard' }
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/UsersView.vue'),
        meta: { title: '用户管理', icon: 'users' }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { title: '系统设置', icon: 'settings' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '404 Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - ${import.meta.env.VITE_APP_TITLE || 'Admin Dashboard'}`
  }

  const isAuthenticated = localStorage.getItem('auth_token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guest && isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
"""
        router_path = self.project_path / "src" / "router" / "index.ts"
        self.write_file(router_path, router_content)

    def create_api_client(self) -> None:
        """Create enhanced API client with interceptors."""
        print("🔧 Creating API client...")

        api_content = """import { useQuery, useMutation } from '@tanstack/vue-query'
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { ROUTE_PATHS } from '@/constants/routes'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const authStore = useAuthStore()
  const token = authStore.token

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.message || `Request failed with status ${response.status}`,
      response.status,
      errorData.code
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

function handleError(error: unknown): never {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = ROUTE_PATHS.LOGIN
    }
    console.error(`[API Error] ${error.status}: ${error.message}`)
    throw error
  }
  console.error('[Unknown Error]', error)
  throw new ApiError('An unexpected error occurred', 500)
}

export function useApiQuery<T>(
  key: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => fetchApi<T>(endpoint).catch(handleError),
    ...options,
  })
}

export function useApiMutation<TData, TVariables>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) =>
      fetchApi<TData>(endpoint, {
        method,
        body: method !== 'GET' ? JSON.stringify(variables) : undefined,
      }).catch(handleError),
    ...options,
  })
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'DELETE' }),
}

export { API_BASE_URL }
"""
        api_path = self.project_path / "src" / "composables" / "useApi.ts"
        self.write_file(api_path, api_content)

    def create_auth_store(self) -> None:
        """Create auth store for authentication state."""
        print("🔧 Creating auth store...")

        auth_store_content = """import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import router from '@/router'
import { ROUTE_PATHS } from '@/constants/routes'
import type { User } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.name || 'Guest')

  async function login(email: string, password: string) {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (email && password) {
      const mockUser: User = {
        id: '1',
        name: 'Admin User',
        email: email,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const mockToken = 'mock_token_' + Date.now()

      token.value = mockToken
      user.value = mockUser
      localStorage.setItem('auth_token', mockToken)

      return { user: mockUser, token: mockToken }
    }

    throw new Error('Login failed')
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    router.push(ROUTE_PATHS.LOGIN)
  }

  async function fetchUser() {
    if (!token.value) return null

    await new Promise((resolve) => setTimeout(resolve, 200))

    user.value = {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return user.value
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    userName,
    login,
    logout,
    fetchUser,
  }
})
"""
        auth_store_path = self.project_path / "src" / "stores" / "auth.ts"
        self.write_file(auth_store_path, auth_store_content)

    def create_settings_store(self) -> None:
        """Create settings store for app configuration."""
        print("🔧 Creating settings store...")

        settings_store_content = """import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark' | 'system'
export type Language = 'en' | 'zh-CN' | 'zh-TW'

export interface AppSettings {
  theme: Theme
  language: Language
  sidebarCollapsed: boolean
  tableDensity: 'compact' | 'default' | 'comfortable'
  showNotifications: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
  sidebarCollapsed: false,
  tableDensity: 'default',
  showNotifications: true,
}

const STORAGE_KEY = 'app_settings'

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch {
    console.warn('Failed to load settings from localStorage')
  }
  return { ...DEFAULT_SETTINGS }
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>(loadSettings())

  watch(
    settings,
    (newSettings) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    },
    { deep: true }
  )

  function setTheme(theme: Theme) {
    settings.value.theme = theme
  }

  function setLanguage(language: Language) {
    settings.value.language = language
  }

  function toggleSidebar() {
    settings.value.sidebarCollapsed = !settings.value.sidebarCollapsed
  }

  function setTableDensity(density: AppSettings['tableDensity']) {
    settings.value.tableDensity = density
  }

  function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS }
  }

  return {
    settings,
    setTheme,
    setLanguage,
    toggleSidebar,
    setTableDensity,
    resetSettings,
  }
})
"""
        settings_store_path = self.project_path / "src" / "stores" / "settings.ts"
        self.write_file(settings_store_path, settings_store_content)

    def create_notifications_store(self) -> None:
        """Create notifications store for toast messages."""
        print("🔧 Creating notifications store...")

        notifications_store_content = """import { ref } from 'vue'
import { defineStore } from 'pinia'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  dismissible?: boolean
}

let notificationId = 0

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])

  function addNotification(notification: Omit<Notification, 'id'>) {
    const id = `notification_${++notificationId}`
    const newNotification: Notification = {
      id,
      duration: 5000,
      dismissible: true,
      ...notification,
    }
    notifications.value.push(newNotification)

    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function success(title: string, message?: string) {
    return addNotification({ type: 'success', title, message })
  }

  function error(title: string, message?: string) {
    return addNotification({ type: 'error', title, message, duration: 0 })
  }

  function warning(title: string, message?: string) {
    return addNotification({ type: 'warning', title, message })
  }

  function info(title: string, message?: string) {
    return addNotification({ type: 'info', title, message })
  }

  function clearAll() {
    notifications.value = []
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clearAll,
  }
})
"""
        notifications_store_path = (
            self.project_path / "src" / "stores" / "notifications.ts"
        )
        self.write_file(notifications_store_path, notifications_store_content)

    def create_toast_container(self) -> None:
        """Create toast notification container."""
        print("🔧 Creating toast container...")

        toast_content = """<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'

const notificationStore = useNotificationStore()

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex max-w-sm flex-col gap-2">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        :class="[
          'relative flex items-start gap-3 rounded-lg border p-4 shadow-lg',
          colorMap[notification.type],
        ]"
      >
        <component
          :is="iconMap[notification.type]"
          :class="['h-5 w-5 flex-shrink-0', iconColorMap[notification.type]]"
        />
        <div class="flex-1">
          <p class="font-medium">{{ notification.title }}</p>
          <p v-if="notification.message" class="mt-1 text-sm opacity-90">
            {{ notification.message }}
          </p>
        </div>
        <button
          v-if="notification.dismissible"
          @click="notificationStore.removeNotification(notification.id)"
          class="flex-shrink-0 opacity-70 hover:opacity-100"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
"""
        toast_path = self.project_path / "src" / "components" / "ToastContainer.vue"
        self.write_file(toast_path, toast_content)

    def update_app_vue(self) -> None:
        """Update App.vue."""
        print("🔧 Updating App.vue...")

        app_content = """<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ToastContainer from '@/components/ToastContainer.vue'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.token) {
    authStore.fetchUser()
  }
})
</script>

<template>
  <ToastContainer />
  <RouterView />
</template>
"""
        app_path = self.project_path / "src" / "App.vue"
        self.write_file(app_path, app_content)

    def create_layout(self) -> None:
        """Create proper layout structure for admin dashboard."""
        print("📐 Setting up layout...")

        layouts_dir = self.project_path / "src" / "layouts"
        layouts_dir.mkdir(exist_ok=True)

        default_layout = """<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider
    :style="{
      '--sidebar-width': 'calc(var(--spacing) * 72)',
      '--header-height': 'calc(var(--spacing) * 12)',
    }"
  >
    <AppSidebar variant="inset" />
    <SidebarInset>
      <SiteHeader />
      <div class="flex flex-1 flex-col">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
"""
        self.write_file(layouts_dir / "DefaultLayout.vue", default_layout)

        auth_layout = """<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center">
    <RouterView />
  </div>
</template>
"""
        self.write_file(layouts_dir / "AuthLayout.vue", auth_layout)

    def create_view_pages(self) -> None:
        """Create basic view pages."""
        print("📄 Creating view pages...")

        views_dir = self.project_path / "src" / "views"
        views_dir.mkdir(exist_ok=True)

        login_view = """<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Please enter email and password'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login(email.value, password.value)
    const redirect = route.query.redirect as string || '/dashboard'
    router.push(redirect)
  } catch (e) {
    error.value = 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen w-full items-center justify-center px-4">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl">Login</CardTitle>
        <CardDescription>Enter your email and password to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="grid gap-4">
          <div class="grid gap-2">
            <Input
              v-model="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div class="grid gap-2">
            <Input
              v-model="password"
              type="password"
              placeholder="Password"
              required
            />
          </div>
          <div v-if="error" class="text-sm text-destructive">{{ error }}</div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Loading...' : 'Sign in' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
"""
        self.write_file(views_dir / "LoginView.vue", login_view)

        not_found_view = """<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="flex h-[calc(100vh-200px)] w-full items-center justify-center">
    <div class="flex flex-col items-center gap-4 text-center">
      <h1 class="text-4xl font-bold">404</h1>
      <p class="text-muted-foreground">The page you are looking for does not exist.</p>
      <Button @click="$router.push('/dashboard')">Go to Dashboard</Button>
    </div>
  </div>
</template>
"""
        self.write_file(views_dir / "NotFoundView.vue", not_found_view)

        users_view = """<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const searchQuery = ref('')

const users = ref([
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
])
</script>

<template>
  <div class="flex flex-col gap-4 p-4 md:p-6">
    <div class="flex items-center gap-4">
      <Input
        v-model="searchQuery"
        placeholder="Search users..."
        class="max-w-sm"
      />
      <Button>Add User</Button>
    </div>
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="user in users" :key="user.id">
            <TableCell class="font-medium">{{ user.name }}</TableCell>
            <TableCell>{{ user.email }}</TableCell>
            <TableCell>{{ user.role }}</TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="sm">Edit</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
"""
        self.write_file(views_dir / "UsersView.vue", users_view)

        settings_view = """<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const siteName = ref('Admin Dashboard')
const itemsPerPage = ref(10)
</script>

<template>
  <div class="flex flex-col gap-4 p-4 md:p-6">
    <h1 class="text-2xl font-bold">Settings</h1>
    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure general application settings</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Site Name</label>
            <Input v-model="siteName" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Items Per Page</label>
            <Input v-model="itemsPerPage" type="number" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
"""
        self.write_file(views_dir / "SettingsView.vue", settings_view)

    def create_types(self) -> None:
        """Create TypeScript type definitions."""
        print("📝 Creating type definitions...")

        types_dir = self.project_path / "src" / "types"
        types_dir.mkdir(exist_ok=True)

        api_types = """export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code?: string
  status: number
}

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
"""
        self.write_file(types_dir / "api.ts", api_types)

        user_types = """export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
  createdAt: string
  updatedAt: string
}

export interface UserCreateInput {
  name: string
  email: string
  password: string
  role?: 'user' | 'admin'
}

export interface UserUpdateInput {
  name?: string
  email?: string
  avatar?: string
  role?: 'admin' | 'user'
}

export type UserRole = 'admin' | 'user' | 'guest'

export interface UserListParams {
  page?: number
  pageSize?: number
  search?: string
  role?: UserRole
}
"""
        self.write_file(types_dir / "user.ts", user_types)

    def create_constants(self) -> None:
        """Create constants."""
        print("📌 Creating constants...")

        constants_dir = self.project_path / "src" / "constants"
        constants_dir.mkdir(exist_ok=True)

        app_constants = """export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Admin Dashboard'
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Admin Dashboard'

export const API_TIMEOUT = 30000

export const PAGE_SIZES = [10, 20, 50, 100]

export const DEFAULT_PAGE_SIZE = 10
"""
        self.write_file(constants_dir / "app.ts", app_constants)

        routes_constants = """export const ROUTE_NAMES = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  USERS: 'users',
  SETTINGS: 'settings',
  NOT_FOUND: 'not-found',
} as const

export const ROUTE_PATHS = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  SETTINGS: '/settings',
} as const
"""
        self.write_file(constants_dir / "routes.ts", routes_constants)

    def create_env_example(self) -> None:
        """Update .env.example with all needed variables."""
        print("📋 Updating .env.example...")

        env_content = """VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Admin Dashboard
VITE_APP_TITLE=Admin Dashboard
"""
        env_path = self.project_path / ".env.example"
        self.write_file(env_path, env_content)

    def update_env_dts(self) -> None:
        """Update env.d.ts with type definitions."""
        print("📝 Updating env.d.ts...")

        env_dts_content = """/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
"""
        env_dts_path = self.project_path / "src" / "env.d.ts"
        self.write_file(env_dts_path, env_dts_content)

    def fix_chart_component(self) -> None:
        """Fix ChartAreaInteractive.vue to import ref and computed."""
        print("🔧 Fixing chart component imports...")

        chart_path = (
            self.project_path / "src" / "components" / "ChartAreaInteractive.vue"
        )
        if not chart_path.exists():
            return

        content = chart_path.read_text(encoding="utf-8")

        if "import { ref, computed }" in content or "import {ref,computed}" in content:
            return

        if '<script setup lang="ts">' in content:
            content = content.replace(
                '<script setup lang="ts">',
                "<script setup lang=\"ts\">\nimport { ref, computed } from 'vue'",
            )
            chart_path.write_text(content, encoding="utf-8")

    def setup(self) -> None:
        """Execute full dashboard setup."""
        print("\n" + "=" * 60)
        print("  Admin Dashboard Setup (Enhanced)")
        print("  Setting up production-ready admin dashboard")
        print("=" * 60 + "\n")

        self.install_dashboard_components()
        self.create_dashboard_view()
        self.fix_chart_component()
        self.create_router()
        self.create_api_client()
        self.create_auth_store()
        self.create_settings_store()
        self.create_notifications_store()
        self.create_toast_container()
        self.create_layout()
        self.create_view_pages()
        self.create_types()
        self.create_constants()
        self.create_env_example()
        self.update_env_dts()
        self.update_app_vue()

        print("\n" + "=" * 60)
        print("  ✅ Dashboard setup completed successfully!")
        print("=" * 60)
        print(f"\n📂 Project location: {self.project_path.absolute()}\n")
        print("🎯 Enhanced Features:")
        print("  - Complete routing system with guards")
        print("  - Layout system (Default + Auth)")
        print("  - Enhanced API client with interceptors")
        print("  - Authentication store")
        print("  - Type definitions")
        print("  - Constants")
        print("  - Environment variables support")
        print("  - Login, Users, Settings, 404 pages\n")


def main() -> None:
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python setup_admin_dashboard.py <project_path>", file=sys.stderr)
        sys.exit(1)

    project_path = Path(sys.argv[1])

    if not project_path.exists():
        print(f"Error: Project path does not exist: {project_path}", file=sys.stderr)
        sys.exit(1)

    setup = DashboardSetup(project_path)
    setup.setup()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n操作已取消", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"\n发生错误: {e}", file=sys.stderr)
        import traceback

        traceback.print_exc()
        sys.exit(1)
