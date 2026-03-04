# Vue 3 Enterprise Admin Dashboard

这是一个基于 **Vue 3**、**Vite**、**TypeScript** 与 **Tailwind CSS v4** 构建的现代化、企业级中后台管理系统前端骨架。

本项目抛弃了传统笨重的组件库与数据流模式，采用目前前端社区最前沿的实践（`shadcn-vue` 组件所有权模式、`ofetch` + `Vue Query` 请求流、基于角色的动态路由挂载），具备极高的运行性能和UI定制上限。

## ✨ 核心特性

- 🚀 **最新技术栈**：基于 Vue 3 (Composition API & `<script setup>`)、Vite 极速构建。
- 🛡️ **动态路由与 RBAC 权限体系**：前端通过接口动态生成路由表，拦截非法越权访问，404 兜底完美整合 SPA 刷新逻辑。
- 📑 **TagsView 多页签与状态缓存**：深度整合 `<KeepAlive>`，支持页面切换时保留表单填写状态。
- 🎨 **高度可定制的 UI 系统**：放弃传统组件库，采用 `Tailwind CSS v4` + `shadcn-vue` (Radix Vue)。UI 组件代码直接存在于本项目 `src/components/ui` 中，让你拥有对组件的 100% 控制权。
- 📡 **先进的服务端状态管理**：使用 `ofetch` 作为底层 HTTP 客户端（自带无刷新 401 拦截），上层使用 `@tanstack/vue-query` 处理请求缓存、重试与竞态控制。
- 📦 **极佳的工程化体验**：深度集成 `bun` 包管理器、`oxlint` (Rust 驱动的极速 Linter)、Prettier，以及 Vitest & Playwright 双重测试保障。

---

## 📂 目录结构

```text
my-vue-app/
├── src/
│   ├── assets/          # 静态资源 (全局 CSS、Logo 等)
│   ├── components/      # 全局组件
│   │   ├── ui/          # UI 基础组件 (shadcn-vue 生成目录)
│   │   └── ...          # 其他业务组合组件 (如 AppSidebar, TagsView)
│   ├── composables/     # 组合式函数 (如 useApi.ts 网络请求层)
│   ├── constants/       # 全局静态常量 (如路由路径、应用配置)
│   ├── layouts/         # 页面布局 (DefaultLayout 主布局, AuthLayout 登录布局)
│   ├── router/          # Vue Router 路由配置 (包含动态路由与导航守卫)
│   ├── stores/          # Pinia 状态管理
│   │   ├── auth.ts      # 用户鉴权状态
│   │   ├── permission.ts# 动态路由与菜单生成
│   │   ├── tagsView.ts  # 多页签与 KeepAlive 缓存控制
│   │   └── settings.ts  # 全局基础设置
│   ├── types/           # TypeScript 全局接口声明
│   ├── views/           # 页面级视图组件
│   ├── App.vue          # 应用根组件
│   └── main.ts          # 应用入口文件
├── .env.example         # 环境变量示例
├── components.json      # shadcn-vue 配置文件
├── tailwind.config.js   # Tailwind 配置 (如有)
├── vite.config.ts       # Vite 构建配置
└── package.json         # 项目依赖

```

---

## 🚀 快速上手

### 1. 环境准备

推荐使用 [Bun](https://bun.sh/) 作为包管理器，以获得极速的安装与运行体验。确保已安装 Node.js (>=18) 或 Bun。

### 2. 安装依赖

```bash
# 使用 bun 安装
bun install

# 或者使用 npm / pnpm
npm install
# pnpm install

```

### 3. 配置环境变量

复制根目录下的 `.env.example` 文件，重命名为 `.env`（或 `.env.local`），并根据实际后端地址修改变量：

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=Admin Dashboard

```

### 4. 启动开发服务器

```bash
bun run dev

```

打开浏览器访问控制台输出的地址（通常为 `http://localhost:5173`）。

---

## 🧠 核心架构说明 (开发必读)

### 1. 动态路由与侧边栏渲染 (Dynamic Routing)

系统路由分为两部分定义在 `src/router/index.ts` 中：

* **`constantRoutes`**：所有人均可访问的白名单路由（如 `/login`）。
* **`asyncRoutes`**：需要鉴权的路由树。带有 `meta.roles` 属性。
**执行流程**：用户登录后，全局路由守卫（`router.beforeEach`）会拉取用户角色信息，通过 `permissionStore` 过滤出可访问的 `asyncRoutes`，并使用 `router.addRoute()` 动态挂载。`AppSidebar.vue` 侧边栏菜单会自动读取过滤后的路由表进行渲染。

### 2. TagsView 与 KeepAlive 缓存机制

想要让页面在多页签切换时**保持状态（不刷新）**，开发新页面时必须遵守以下规范：
**页面组件的名称（name）必须与路由配置中的 `name` 完全一致！**

在 Vue 3 `<script setup>` 中，请使用自带的 `defineOptions` 声明组件名：

```html
<script setup lang="ts">
// 这里的 'Users' 必须和 router/index.ts 中的 name: 'Users' 保持一致！
defineOptions({ name: 'Users' }) 

import { ref } from 'vue'
const list = ref([])
</script>

```

### 3. API 请求与服务端状态 (ofetch + Vue Query)

项目抛弃了 Axios，使用了更轻量、对 SSR 更友好的 `ofetch`。

* **配置位置**：`src/composables/useApi.ts`
* **自动拦截**：底层 `apiFetch` 实例已经在 `onRequest` 中自动注入了 Token，并在 `onResponseError` 中自动捕获了 `401` 状态并触发静默登出跳转，无需在业务中重复处理。
* **业务使用**：推荐使用导出的 `useApiQuery` (查询) 和 `useApiMutation` (增删改) 进行数据流管理，天然支持 Loading 态、错误捕获与数据缓存。

```typescript
import { useApiQuery } from '@/composables/useApi'

// 示例：在组件中获取用户列表
const { data: users, isLoading } = useApiQuery(['usersList'], '/users')

```

---

## 🛠️ 常用脚本命令

```bash
bun run dev      # 启动本地开发服务
bun run build    # 针对生产环境进行类型检查并构建打包
bun run preview  # 在本地预览生产环境的构建产物
bun run lint     # 运行 ESLint 和 oxlint 检查代码规范
bun run test:unit # 运行 Vitest 单元测试
bun run test:e2e # 运行 Playwright 端到端测试

```

## 🎨 UI 组件开发 (shadcn-vue)

如果需要新增基础 UI 组件，不要直接写死在代码里，请使用 `shadcn-vue` CLI 自动生成到项目中：

```bash
# 例如添加对话框组件
npx shadcn-vue@latest add dialog

```

组件将被安装到 `src/components/ui/dialog` 目录下，随后你可以根据 UI 设计稿对其内部的 Tailwind class 进行自由修改。
