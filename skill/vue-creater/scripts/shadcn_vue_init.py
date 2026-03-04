"""
Shadcn Vue Project Initializer

A script to bootstrap a Vue 3 project with Vite, Tailwind CSS, Shadcn UI,
Pinia, and TypeScript configured with best practices.

Usage:
    python shadcn_vue_init.py [project-name]

Example:
    python shadcn_vue_init.py my-awesome-app
"""

import json
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

# Constants
DEFAULT_PROJECT_NAME = "my-vue-app"
NPM_REGISTRY = "https://registry.npmmirror.com/"
PROGRESS_BAR_WIDTH = 40


@dataclass
class ProjectConfig:
    """Project configuration settings."""

    name: str
    path: Path
    is_windows: bool = sys.platform.startswith("win")

    @classmethod
    def from_args(cls, args: list[str]) -> "ProjectConfig":
        """Create config from command line arguments."""
        project_name = args[1] if len(args) > 1 else DEFAULT_PROJECT_NAME
        project_path = Path.cwd() / project_name
        return cls(name=project_name, path=project_path)


class ProgressBar:
    """Visual progress indicator for long-running operations."""

    def __init__(self, total_steps: int, description: str = "Progress"):
        self.total = total_steps
        self.current = 0
        self.description = description

    def update(self, step_name: str = "") -> None:
        """Update progress bar with current step."""
        self.current += 1
        percent = int((self.current / self.total) * 100)
        filled = int((self.current / self.total) * PROGRESS_BAR_WIDTH)
        bar = "=" * filled + "-" * (PROGRESS_BAR_WIDTH - filled)

        status = f" - {step_name}" if step_name else ""
        display = f"\r[{self.description}] [{bar}] {percent}%{status}"
        print(display, end="", flush=True)

    def finish(self) -> None:
        """Mark progress as complete."""
        bar = "=" * PROGRESS_BAR_WIDTH
        print(f"\r [{bar}] 100% - Done[{self.description}]!\n")


class CommandRunner:
    """Execute shell commands with error handling."""

    def __init__(self, config: ProjectConfig):
        self.config = config

    def run(self, command: list[str], cwd: Optional[Path] = None) -> None:
        """Run command silently, exit on failure."""
        try:
            subprocess.run(
                command,
                check=True,
                cwd=cwd,
                shell=self.config.is_windows,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
        except subprocess.CalledProcessError as e:
            print(f"\n命令执行失败: {' '.join(command)}", file=sys.stderr)
            print(f"标准输出: {e.stdout}", file=sys.stderr)
            print(f"错误信息: {e.stderr}", file=sys.stderr)
            sys.exit(1)
        except FileNotFoundError:
            print(f"\n命令不存在: {command[0]}", file=sys.stderr)
            print("请确保已安装 bun: https://bun.sh", file=sys.stderr)
            sys.exit(1)


class FileManager:
    """Handle file operations."""

    @staticmethod
    def write(path: Path, content: str) -> None:
        """Write content to file, creating directories as needed."""
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")

    @staticmethod
    def read(path: Path) -> str:
        """Read file content."""
        return path.read_text(encoding="utf-8")

    @staticmethod
    def clean_json_comments(json_str: str) -> str:
        """Remove comments from JSON string while preserving string content."""
        result = []
        i = 0

        while i < len(json_str):
            # Handle quoted strings
            if json_str[i] == '"':
                result.append(json_str[i])
                i += 1
                # Read entire string, handling escape sequences
                while i < len(json_str):
                    if json_str[i] == "\\" and i + 1 < len(json_str):
                        result.append(json_str[i : i + 2])
                        i += 2
                    elif json_str[i] == '"':
                        result.append(json_str[i])
                        i += 1
                        break
                    else:
                        result.append(json_str[i])
                        i += 1
            # Handle single-line comments
            elif i + 1 < len(json_str) and json_str[i : i + 2] == "//":
                while i < len(json_str) and json_str[i] != "\n":
                    i += 1
            # Handle multi-line comments
            elif i + 1 < len(json_str) and json_str[i : i + 2] == "/*":
                i += 2
                while i + 1 < len(json_str):
                    if json_str[i : i + 2] == "*/":
                        i += 2
                        break
                    i += 1
            else:
                result.append(json_str[i])
                i += 1

        # Remove trailing commas
        cleaned = "".join(result)
        return re.sub(r",(\s*?[\]}])", r"\1", cleaned)


class ProjectInitializer:
    """Main project initialization orchestrator."""

    def __init__(self, config: ProjectConfig):
        self.config = config
        self.runner = CommandRunner(config)
        self.file_manager = FileManager()
        self.progress = ProgressBar(15, "Creating Project")

    def initialize(self) -> None:
        """Execute full project initialization workflow."""
        self._create_vite_project()
        self._configure_npm_registry()
        self._install_base_dependencies()
        self._install_tailwind()
        self._configure_css_and_typescript()
        self._configure_vite()
        self._setup_shadcn()
        self._update_eslint_config()
        self._install_shadcn_dependencies()
        self._add_shadcn_components()
        self._install_state_management()
        self._clean_project_files()
        self._update_main_entry()
        self._create_example_code()
        self._create_utility_files()

        self.progress.finish()
        print(self.config.path.absolute())

    def _create_vite_project(self) -> None:
        """Create new Vite project with Vue."""
        self.progress.update("Creating Vite project")

        if self.config.path.exists():
            shutil.rmtree(self.config.path)

        self.runner.run(
            [
                "npm",
                "create",
                "vue@latest",
                self.config.name,
                "--",
                "--ts",
                "--router",
                "--pinia",
                "--vitest",
                "--playwright",
                "--eslint",
                "--prettier",
            ]
        )

    def _configure_npm_registry(self) -> None:
        """Set up npm registry mirror."""
        self.progress.update("Configuring npm registry")
        npmrc_path = self.config.path / ".npmrc"
        self.file_manager.write(npmrc_path, f"registry={NPM_REGISTRY}")

    def _install_base_dependencies(self) -> None:
        """Install base project dependencies."""
        self.progress.update("Installing base dependencies")
        self.runner.run(["bun", "install"], cwd=self.config.path)

    def _install_tailwind(self) -> None:
        """Install Tailwind CSS and Vite plugin."""
        self.progress.update("Installing Tailwind CSS")
        self.runner.run(
            ["bun", "add", "tailwindcss", "@tailwindcss/vite"], cwd=self.config.path
        )

    def _configure_css_and_typescript(self) -> None:
        """Configure CSS imports and TypeScript path aliases."""
        self.progress.update("Configuring CSS and TypeScript")

        # Update main CSS file
        css_path = self.config.path / "src" / "assets" / "main.css"
        self.file_manager.write(css_path, '@import "tailwindcss";\n')

        # Update TypeScript configs
        self._update_tsconfig(self.config.path / "tsconfig.json")
        self._update_tsconfig(self.config.path / "tsconfig.app.json")

    def _update_tsconfig(self, tsconfig_path: Path) -> None:
        """Update tsconfig with path aliases."""
        if not tsconfig_path.exists():
            return

        content = self.file_manager.read(tsconfig_path)
        clean_content = self.file_manager.clean_json_comments(content)
        tsconfig = json.loads(clean_content)

        if "compilerOptions" not in tsconfig:
            tsconfig["compilerOptions"] = {}

        # Only tsconfig.json needs baseUrl
        tsconfig["compilerOptions"]["paths"] = {"@/*": ["./src/*"]}

        self.file_manager.write(
            tsconfig_path, json.dumps(tsconfig, indent=2, ensure_ascii=False)
        )

    def _configure_vite(self) -> None:
        """Configure Vite with plugins and aliases."""
        self.progress.update("Configuring Vite")

        # Install @types/node and unplugin-auto-import
        self.runner.run(
            ["bun", "install", "-D", "@types/node", "unplugin-auto-import"],
            cwd=self.config.path,
        )

        vite_config = """import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
"""
        self.file_manager.write(self.config.path / "vite.config.ts", vite_config)

    def _setup_shadcn(self) -> None:
        """Initialize Shadcn UI."""
        self.progress.update("Setting up Shadcn")
        self.runner.run(
            ["npx", "shadcn-vue@latest", "init", "-b", "neutral", "--yes"],
            cwd=self.config.path,
        )

    def _update_eslint_config(self) -> None:
        """Update ESLint to allow single-word component names and any type in ui components."""
        eslint_path = self.config.path / "eslint.config.ts"
        if not eslint_path.exists():
            return

        content = self.file_manager.read(eslint_path)

        custom_rules = """  {
    name: 'app/custom-rules',
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    name: 'app/allow-any-in-ui',
    files: ['src/components/ui/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  skipFormatting,"""

        updated_content = content.replace("  skipFormatting,", custom_rules)
        self.file_manager.write(eslint_path, updated_content)

    def _install_shadcn_dependencies(self) -> None:
        """Install Shadcn UI dependencies."""
        self.progress.update("Installing Shadcn dependencies")

        deps = [
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "lucide-vue-next",
            "radix-vue",
            "tw-animate-css",
        ]
        self.runner.run(["bun", "add"] + deps, cwd=self.config.path)

    def _add_shadcn_components(self) -> None:
        """Add initial Shadcn components."""
        self.progress.update("Adding Shadcn components")
        self.runner.run(
            ["npx", "shadcn-vue@latest", "add", "button", "-y"], cwd=self.config.path
        )

    def _install_state_management(self) -> None:
        """Install Vue Query, Zod, and VueUse."""
        self.progress.update("Installing state management and utilities")

        # Core state management and validation
        core_deps = [
            "@tanstack/vue-query",  # Data fetching and caching
            "zod",  # Schema validation
            "@vueuse/core",  # Vue composition utilities
        ]
        self.runner.run(["bun", "add"] + core_deps, cwd=self.config.path)

    def _clean_project_files(self) -> None:
        """Clean up unnecessary files and components from the template."""
        self.progress.update("Cleaning project files")

        # Remove unnecessary view files
        views_to_remove = [
            self.config.path / "src" / "views" / "HomeView.vue",
            self.config.path / "src" / "views" / "AboutView.vue",
        ]
        for view_file in views_to_remove:
            if view_file.exists():
                view_file.unlink()

        # Remove unnecessary components
        components_to_remove = [
            self.config.path / "src" / "components" / "HelloWorld.vue",
            self.config.path / "src" / "components" / "TheWelcome.vue",
            self.config.path / "src" / "components" / "WelcomeItem.vue",
            self.config.path / "src" / "components" / "icons",
        ]
        for component in components_to_remove:
            if component.exists():
                if component.is_dir():
                    shutil.rmtree(component)
                else:
                    component.unlink()

        # Update router to remove references to deleted views
        router_content = """import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
  ],
})

export default router
"""
        self.file_manager.write(
            self.config.path / "src" / "router" / "index.ts", router_content
        )

        # Create a clean HomeView.vue
        home_view = """<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useDateFormat, useNow } from '@vueuse/core'
import { useCounterStore } from '@/stores/counter'

const counterStore = useCounterStore()
const now = useNow()
const formatted = useDateFormat(now, 'YYYY-MM-DD HH:mm:ss')
</script>

<template>
  <div class="p-10 flex flex-col gap-6 justify-center items-center min-h-screen">
    <h1 class="text-3xl font-bold">Vite + Vue + Tailwind + Shadcn + Pinia + TypeScript</h1>

    <div class="flex flex-col gap-4 items-center">
      <p class="text-sm text-muted-foreground">{{ formatted }}</p>

      <div class="flex items-center gap-4">
        <Button @click="counterStore.count--" variant="outline">-</Button>
        <span class="text-2xl font-mono w-16 text-center">{{ counterStore.count }}</span>
        <Button @click="counterStore.increment">+</Button>
      </div>
    </div>
  </div>
</template>
"""
        self.file_manager.write(
            self.config.path / "src" / "views" / "HomeView.vue", home_view
        )

    def _update_main_entry(self) -> None:
        """Update main.ts with plugins."""
        self.progress.update("Updating main.ts")

        main_ts = """import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(VueQueryPlugin)
app.use(router)

app.mount('#app')
"""
        self.file_manager.write(self.config.path / "src" / "main.ts", main_ts)

    def _create_example_code(self) -> None:
        """Create example App.vue component."""
        self.progress.update("Creating example code")

        app_vue = """<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>
"""
        self.file_manager.write(self.config.path / "src" / "App.vue", app_vue)

    def _create_utility_files(self) -> None:
        """Create utility files and helpers."""
        self.progress.update("Creating utility files")

        # Create lib/utils.ts for common utilities
        utils_ts = """import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
"""
        self.file_manager.write(self.config.path / "src" / "lib" / "utils.ts", utils_ts)

        # Create composables/useApi.ts for API calls
        use_api_ts = """import { useQuery, useMutation } from '@tanstack/vue-query'
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/vue-query'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

export function useApiQuery<T>(
  key: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => fetchApi<T>(endpoint),
    ...options,
  })
}

export function useApiMutation<TData, TVariables>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) =>
      fetchApi<TData>(endpoint, {
        method,
        body: JSON.stringify(variables),
      }),
    ...options,
  })
}
"""
        self.file_manager.write(
            self.config.path / "src" / "composables" / "useApi.ts", use_api_ts
        )

        # Create .env.example
        env_example = """# API Configuration
VITE_API_URL=http://localhost:3000

# App Configuration
VITE_APP_TITLE=My Vue App
"""
        self.file_manager.write(self.config.path / ".env.example", env_example)

        # Create README.md with project information
        readme_md = f"""# {self.config.name}

A modern Vue 3 project built with:

- ⚡️ [Vite](https://vitejs.dev/) - Next generation frontend tooling
- 🖖 [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- 🎨 [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- 🧩 [Shadcn Vue](https://www.shadcn-vue.com/) - Re-usable components
- 🍍 [Pinia](https://pinia.vuejs.org/) - State management
- 🔄 [TanStack Query](https://tanstack.com/query) - Data fetching & caching
- 📝 [TypeScript](https://www.typescriptlang.org/) - Type safety
- ✅ [Zod](https://zod.dev/) - Schema validation
- 🛠️ [VueUse](https://vueuse.org/) - Composition utilities

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Run tests
bun run test:unit

# Run E2E tests
bun run test:e2e

# Lint and format
bun run lint
bun run format
```

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Vue components
│   └── ui/         # Shadcn UI components
├── composables/     # Composition functions
│   └── useApi.ts   # API utilities
├── lib/            # Utility functions
│   └── utils.ts    # Common utilities
├── router/         # Vue Router configuration
├── stores/         # Pinia stores
├── views/          # Page components
├── App.vue         # Root component
└── main.ts         # Application entry
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Utilities

### API Composables

```typescript
import {{ useApiQuery, useApiMutation }} from '@/composables/useApi'

// Fetch data
const {{ data, isLoading }} = useApiQuery(['users'], '/api/users')

// Mutate data
const {{ mutate }} = useApiMutation('/api/users', 'POST')
```

### Common Utilities

```typescript
import {{ cn, sleep }} from '@/lib/utils'

// Merge class names
const className = cn('text-red-500', isActive && 'font-bold')

// Async delay
await sleep(1000)
```

## License

MIT
"""
        self.file_manager.write(self.config.path / "README.md", readme_md)


def main() -> None:
    """Main entry point."""
    # Print banner
    print("\n" + "=" * 60)
    print("  Shadcn Vue Project Initializer")
    print("  Creating a modern Vue 3 project with best practices")
    print("=" * 60 + "\n")

    config = ProjectConfig.from_args(sys.argv)

    # Confirm project creation
    print(f"📦 Project name: {config.name}")
    print(f"📁 Project path: {config.path.absolute()}\n")

    initializer = ProjectInitializer(config)
    initializer.initialize()

    # Print success message
    print("\n" + "=" * 60)
    print("  ✅ Project created successfully!")
    print("=" * 60)
    print(f"\n📂 Project location: {config.path.absolute()}\n")
    print("🚀 Next steps:\n")
    print(f"  cd {config.name}")
    print("  bun run dev\n")
    print("📚 Documentation:")
    print("  - Vite: https://vitejs.dev")
    print("  - Vue 3: https://vuejs.org")
    print("  - Shadcn Vue: https://www.shadcn-vue.com")
    print("  - Tailwind CSS: https://tailwindcss.com\n")


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
