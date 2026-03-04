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
import AppSidebar from "@/components/AppSidebar.vue"
import ChartAreaInteractive from "@/components/ChartAreaInteractive.vue"
import DataTable from "@/components/DataTable.vue"
import SectionCards from "@/components/SectionCards.vue"
import SiteHeader from "@/components/SiteHeader.vue"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

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
  <SidebarProvider
    :style=" {
      '--sidebar-width': 'calc(var(--spacing) * 72)',
      '--header-height': 'calc(var(--spacing) * 12)',
    }"
  >
    <AppSidebar variant="inset" />
    <SidebarInset>
      <SiteHeader />
      <div class="flex flex-1 flex-col">
        <div class="@container/main flex flex-1 flex-col gap-2">
          <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div class="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable :data="data" />
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
"""
        dashboard_path = self.project_path / "src" / "views" / "DashboardView.vue"
        self.write_file(dashboard_path, dashboard_content)

        # Remove old HomeView.vue if it exists
        home_view = self.project_path / "src" / "views" / "HomeView.vue"
        if home_view.exists():
            home_view.unlink()

    def update_router(self) -> None:
        """Update router configuration for dashboard."""
        print("🔧 Updating router configuration...")

        router_content = """import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
  ],
})

export default router
"""
        router_path = self.project_path / "src" / "router" / "index.ts"
        self.write_file(router_path, router_content)

    def update_app_vue(self) -> None:
        """Update App.vue for dashboard layout."""
        print("🎨 Updating App.vue...")

        app_content = """<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>
"""
        app_path = self.project_path / "src" / "App.vue"
        self.write_file(app_path, app_content)

    def create_layout_structure(self) -> None:
        """Create proper layout structure for admin dashboard."""
        print("📐 Setting up layout structure...")

        # Create layouts directory
        layouts_dir = self.project_path / "src" / "layouts"
        layouts_dir.mkdir(exist_ok=True)

        # Create default layout
        default_layout = """<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-background">
    <RouterView />
  </div>
</template>
"""
        self.write_file(layouts_dir / "DefaultLayout.vue", default_layout)

    def fix_chart_component(self) -> None:
        """Fix ChartAreaInteractive.vue to import ref and computed."""
        print("🔧 Fixing chart component imports...")

        chart_path = self.project_path / "src" / "components" / "ChartAreaInteractive.vue"
        if not chart_path.exists():
            return

        content = chart_path.read_text(encoding="utf-8")

        # Check if ref and computed are already imported
        if "import { ref, computed }" in content or "import {ref,computed}" in content:
            return

        # Add ref and computed import at the beginning of script setup
        if "<script setup lang=\"ts\">" in content:
            content = content.replace(
                "<script setup lang=\"ts\">",
                "<script setup lang=\"ts\">\nimport { ref, computed } from 'vue'"
            )
            chart_path.write_text(content, encoding="utf-8")

    def setup(self) -> None:
        """Execute full dashboard setup."""
        print("\n" + "=" * 60)
        print("  Admin Dashboard Setup")
        print("  Setting up production-ready admin dashboard")
        print("=" * 60 + "\n")

        self.install_dashboard_components()
        self.create_dashboard_view()
        self.fix_chart_component()
        self.update_router()
        self.update_app_vue()
        self.create_layout_structure()

        print("\n" + "=" * 60)
        print("  ✅ Dashboard setup completed successfully!")
        print("=" * 60)
        print(f"\n📂 Project location: {self.project_path.absolute()}\n")
        print("🎯 Dashboard features:")
        print("  - Sidebar navigation")
        print("  - Data table with sample data")
        print("  - Analytics cards")
        print("  - Interactive charts")
        print("  - Responsive layout\n")


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
