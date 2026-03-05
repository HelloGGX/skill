"""
Nuxt Shadcn Dashboard Setup Script

A script to extract and setup a pre-configured Nuxt 3 admin dashboard
with Shadcn UI, Tailwind CSS, and all necessary dependencies.

Usage:
    python setup_nuxt_dashboard.py [project-name]

Example:
    python setup_nuxt_dashboard.py my-nuxt-admin
"""

import shutil
import subprocess
import sys
import zipfile
from pathlib import Path
from typing import Optional

# Constants
DEFAULT_PROJECT_NAME = "nuxt-admin-dashboard"
PROGRESS_BAR_WIDTH = 40


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


class NuxtDashboardSetup:
    """Setup Nuxt admin dashboard from template."""

    def __init__(self, project_name: str):
        self.project_name = project_name
        self.project_path = Path.cwd() / project_name
        self.script_dir = Path(__file__).parent
        self.zip_path = self.script_dir.parent / "templates" / "nuxt-shadcn-dashboard.zip"
        self.is_windows = sys.platform.startswith("win")
        self.progress = ProgressBar(3, "Setting up Nuxt Dashboard")

    def setup(self) -> None:
        """Execute full setup workflow."""
        self._validate_zip_exists()
        self._extract_template()
        self._install_dependencies()
        
        self.progress.finish()
        print(self.project_path.absolute())

    def _validate_zip_exists(self) -> None:
        """Check if the template zip file exists."""
        if not self.zip_path.exists():
            print(f"\n❌ Error: Template file not found at {self.zip_path}", file=sys.stderr)
            print("Please ensure nuxt-shadcn-dashboard.zip exists in skill/vue-creater/templates/", file=sys.stderr)
            sys.exit(1)

    def _extract_template(self) -> None:
        """Extract the Nuxt dashboard template."""
        self.progress.update("Extracting template")

        # Remove existing directory if it exists
        if self.project_path.exists():
            shutil.rmtree(self.project_path)

        # Create project directory
        self.project_path.mkdir(parents=True, exist_ok=True)

        # Extract zip file
        try:
            with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:
                zip_ref.extractall(self.project_path)
        except zipfile.BadZipFile:
            print(f"\n❌ Error: Invalid zip file at {self.zip_path}", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"\n❌ Error extracting template: {e}", file=sys.stderr)
            sys.exit(1)

    def _install_dependencies(self) -> None:
        """Install project dependencies using bun."""
        self.progress.update("Installing dependencies")

        try:
            subprocess.run(
                ["bun", "install"],
                check=True,
                cwd=self.project_path,
                shell=self.is_windows,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
            )
        except subprocess.CalledProcessError as e:
            print(f"\n❌ Failed to install dependencies", file=sys.stderr)
            print(f"Standard output: {e.stdout}", file=sys.stderr)
            print(f"Error message: {e.stderr}", file=sys.stderr)
            sys.exit(1)
        except FileNotFoundError:
            print(f"\n❌ Command not found: bun", file=sys.stderr)
            print("Please install bun: https://bun.sh", file=sys.stderr)
            sys.exit(1)


def main() -> None:
    """Main entry point."""
    # Print banner
    print("\n" + "=" * 60)
    print("  Nuxt Shadcn Dashboard Setup")
    print("  Extracting pre-configured Nuxt 3 admin dashboard")
    print("=" * 60 + "\n")

    # Get project name from arguments
    project_name = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PROJECT_NAME
    project_path = Path.cwd() / project_name

    # Confirm project creation
    print(f"📦 Project name: {project_name}")
    print(f"📁 Project path: {project_path.absolute()}\n")

    # Setup project
    setup = NuxtDashboardSetup(project_name)
    setup.setup()

    # Print success message
    print("\n" + "=" * 60)
    print("  ✅ Nuxt dashboard created successfully!")
    print("=" * 60)
    print(f"\n📂 Project location: {project_path.absolute()}\n")
    print("🚀 Next steps:\n")
    print(f"  cd {project_name}")
    print("  bun run dev\n")
    print("📚 Documentation:")
    print("  - Nuxt 3: https://nuxt.com")
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
