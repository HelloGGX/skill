import os
import subprocess
import json
import shutil
import sys
import re

# 项目配置
PROJECT_NAME = "my-vue-app"
IS_WINDOWS = sys.platform.startswith("win")
SHELL = IS_WINDOWS


# --- 核心功能函数 ---
def run_command_silent(command, cwd=None):
    """静默运行Shell命令，失败时直接退出不打印错误"""
    try:
        subprocess.run(
            command,
            check=True,
            cwd=cwd,
            shell=SHELL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except subprocess.CalledProcessError as e:
        print(f"命令执行失败: {' '.join(command)}", file=sys.stderr)
        print(f"错误信息: {e.stderr}", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError as e:
        print(f"命令不存在: {command[0]}", file=sys.stderr)
        print(f"请确保已安装 bun: https://bun.sh", file=sys.stderr)
        sys.exit(1)


def write_file(path, content):
    """写入文件内容"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def clean_json_comments(json_str):
    """清理JSON中的注释"""
    json_str = re.sub(r"//.*", "", json_str)
    json_str = re.sub(r"/\*.*?\*/", "", json_str, flags=re.DOTALL)
    json_str = re.sub(r",(\s*?[\]}])", r"\1", json_str)
    return json_str


def update_tsconfig(file_path):
    """更新tsconfig文件"""
    if not os.path.exists(file_path):
        return

    with open(file_path, "r", encoding="utf-8") as f:
        try:
            content = f.read()
            if not content.strip():
                data = {}
            else:
                data = json.loads(clean_json_comments(content))
        except Exception:
            return

    if "compilerOptions" not in data:
        data["compilerOptions"] = {}

    data["compilerOptions"]["baseUrl"] = "."
    if "paths" not in data["compilerOptions"]:
        data["compilerOptions"]["paths"] = {}

    data["compilerOptions"]["paths"]["@/*"] = ["./src/*"]

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def main():
    global PROJECT_NAME
    if len(sys.argv) > 1:
        PROJECT_NAME = sys.argv[1]

    current_dir = os.getcwd()
    project_path = os.path.join(current_dir, PROJECT_NAME)

    # 1. Create Project
    if os.path.exists(project_path):
        shutil.rmtree(project_path)

    run_command_silent(
        [
            "bun",
            "create",
            "vite",
            PROJECT_NAME,
            "--template",
            "vue-ts",
            "--no-interactive",
        ]
    )

    # 1.1 Fix scripts in package.json
    package_json_path = os.path.join(project_path, "package.json")
    with open(package_json_path, "r", encoding="utf-8") as f:
        package_data = json.load(f)

    package_data["scripts"]["dev"] = "bun vite"
    package_data["scripts"]["build"] = "bun vite build"
    package_data["scripts"]["preview"] = "bun vite preview"

    with open(package_json_path, "w", encoding="utf-8") as f:
        json.dump(package_data, f, indent=2)

    # 2. Config npm registry
    npmrc_path = os.path.join(project_path, ".npmrc")
    write_file(npmrc_path, "registry=https://registry.npmmirror.com/")

    # 3. Install Base Deps
    env = os.environ.copy()
    env["BUN_NO_PROGRESS"] = "1"
    run_command_silent(["bun", "install"], cwd=project_path)

    # 4. Install Tailwind
    run_command_silent(
        ["bun", "install", "tailwindcss", "@tailwindcss/vite"], cwd=project_path
    )

    # 5. Config Files (CSS & TS)
    write_file(
        os.path.join(project_path, "src", "style.css"), '@import "tailwindcss";\n'
    )
    update_tsconfig(os.path.join(project_path, "tsconfig.json"))
    update_tsconfig(os.path.join(project_path, "tsconfig.app.json"))

    # 6. Config Vite
    run_command_silent(["bun", "install", "-D", "@types/node"], cwd=project_path)
    vite_config_content = """import path from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    open: true,
  }
})
"""
    write_file(os.path.join(project_path, "vite.config.ts"), vite_config_content)

    # 7. Setup Shadcn
    run_command_silent(
        ["npx", "shadcn-vue@latest", "init", "-y", "-d"], cwd=project_path
    )

    shadcn_deps = [
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
        "lucide-vue-next",
        "radix-vue",
        "tw-animate-css",
    ]
    run_command_silent(["bun", "install"] + shadcn_deps, cwd=project_path)

    # 8. Add Components
    run_command_silent(
        ["npx", "shadcn-vue@latest", "add", "button", "-y"], cwd=project_path
    )

    # 8.1 Install Pinia & Vue Query
    run_command_silent(
        ["bun", "install", "pinia", "@tanstack/vue-query"], cwd=project_path
    )

    # 8.2 Update main.ts (With Pinia, Vue Query & Style import)
    main_ts_content = """import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './style.css'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(VueQueryPlugin)
app.mount('#app')
"""
    write_file(os.path.join(project_path, "src", "main.ts"), main_ts_content)

    # 9. Example Code
    app_vue_content = """<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="p-10 flex flex-col gap-4 justify-center items-center h-screen">
    <h1 class="text-2xl font-bold">Vite + Tailwind + Shadcn + Pinia + TypeScript</h1>
    <Button>按钮</Button>
  </div>
</template>
"""
    write_file(os.path.join(project_path, "src", "App.vue"), app_vue_content)

    # 输出最终路径供调用方捕获
    print(os.path.abspath(project_path))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(1)
