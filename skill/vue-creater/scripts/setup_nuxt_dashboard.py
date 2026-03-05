"""
Nuxt Shadcn Dashboard Setup Script

A script to extract and setup a pre-configured Nuxt 3 admin dashboard
with Shadcn UI, Tailwind CSS, and all necessary dependencies.

Usage:
    python setup_nuxt_dashboard.py [project-name]

Example:
    python setup_nuxt_dashboard.py my-nuxt-admin
    python setup_nuxt_dashboard.py  # Creates 'dashboard' directory
"""

import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

# Constants
DEFAULT_PROJECT_NAME = "dashboard"



def extract_template(zip_path: Path, project_path: Path) -> None:
    """Extract the Nuxt dashboard template to project directory."""
    print("📦 Extracting template...", flush=True)

    # Remove existing directory if it exists
    if project_path.exists():
        shutil.rmtree(project_path)

    # Create temporary extraction directory
    temp_dir = project_path.parent / f".temp_{project_path.name}"
    if temp_dir.exists():
        shutil.rmtree(temp_dir)

    try:
        # Extract zip file to temp directory
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)

        # Find nuxt-shadcn-dashboard folder and move its contents to project_path
        source_dir = temp_dir / "nuxt-shadcn-dashboard"

        if not source_dir.exists():
            print(f"❌ Error: nuxt-shadcn-dashboard folder not found in zip", file=sys.stderr)
            shutil.rmtree(temp_dir)
            sys.exit(1)

        # Move the nuxt-shadcn-dashboard folder to project_path
        shutil.move(str(source_dir), str(project_path))

        # Clean up temp directory
        shutil.rmtree(temp_dir)

        print("✅ Template extracted successfully")
    except zipfile.BadZipFile:
        print(f"❌ Error: Invalid zip file at {zip_path}", file=sys.stderr)
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error extracting template: {e}", file=sys.stderr)
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        sys.exit(1)


def install_dependencies(project_path: Path) -> None:
    """Install project dependencies using bun."""
    print("📥 Installing dependencies with bun...", flush=True)

    try:
        # Change to project directory and run bun install
        subprocess.run(
            ["bun", "install"],
            cwd=project_path,
            check=True,
            capture_output=False
        )
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("❌ Command not found: bun", file=sys.stderr)
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

    # Get template zip path
    script_dir = Path(__file__).parent
    zip_path = script_dir.parent / "templates" / "nuxt-shadcn-dashboard.zip"

    # Validate zip exists
    if not zip_path.exists():
        print(f"❌ Error: Template file not found at {zip_path}", file=sys.stderr)
        print("Please ensure nuxt-shadcn-dashboard.zip exists in skill/vue-creater/templates/", file=sys.stderr)
        sys.exit(1)

    # Confirm project creation
    print(f"📦 Project name: {project_name}")
    print(f"📁 Project path: {project_path.absolute()}\n")

    # Extract template
    extract_template(zip_path, project_path)

    # Install dependencies
    install_dependencies(project_path)

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
        print("\n\n❌ Operation cancelled", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Error occurred: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
