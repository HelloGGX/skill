import sys
import json
import math
import os
import re


# ==========================================
# 1. 颜色转换逻辑 (保持不变)
# ==========================================
def srgb_transfer_function(a):
    return ((a + 0.055) / 1.055) ** 2.4 if a >= 0.04045 else a / 12.92


def linear_srgb_to_oklch(r, g, b):
    x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b
    y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b
    z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b

    l_ = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z
    m_ = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z
    s_ = 0.0482003018 * x + 0.2611770454 * y + 0.6392612699 * z

    l_, m_, s_ = l_ ** (1 / 3), m_ ** (1 / 3), s_ ** (1 / 3)

    L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    b_val = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

    C = math.sqrt(a * a + b_val * b_val)
    H = math.atan2(b_val, a) * (180 / math.pi)
    if H < 0:
        H += 360
    if C < 0.0001:
        H = 0

    return L, C, H


def hex_to_oklch_string(hex_str):
    hex_str = hex_str.lstrip("#")
    if len(hex_str) == 3:
        hex_str = "".join(c * 2 for c in hex_str)

    r = int(hex_str[0:2], 16) / 255.0
    g = int(hex_str[2:4], 16) / 255.0
    b = int(hex_str[4:6], 16) / 255.0

    l, c, h = linear_srgb_to_oklch(
        srgb_transfer_function(r), srgb_transfer_function(g), srgb_transfer_function(b)
    )

    def fmt(val):
        return f"{val:.3f}".rstrip("0").rstrip(".") if val != 0 else "0"

    return f"oklch({fmt(l)} {fmt(c)} {fmt(h)})"


# ==========================================
# 2. 数据处理与合并逻辑
# ==========================================
def parse_dsl_to_map(json_data):
    styles = json_data.get("dsl", {}).get("styles", {})
    updates = {}

    for entry in styles.values():
        token_raw = entry.get("token", "")
        hex_val = entry.get("value", ["#000000"])[0]

        if "/" in token_raw:
            token_name = token_raw.split("/")[-1]
        else:
            token_name = token_raw

        css_var_name = f"--{token_name}"
        updates[css_var_name] = hex_to_oklch_string(hex_val)

    return updates


def determine_target_selector(input_data):
    """
    根据 DSL 中的 nodes[0].name 判断目标 CSS 选择器
    "light" -> ":root"
    "dark"  -> ".dark"
    默认返回 ":root"
    """
    try:
        nodes = input_data.get("dsl", {}).get("nodes", [])
        if nodes and len(nodes) > 0:
            frame_name = nodes[0].get("name", "").lower().strip()

            if frame_name == "dark":
                return ".dark"
            elif frame_name == "light":
                return ":root"

        return ":root"  # 默认值
    except Exception:
        return ":root"


def merge_css_content(input_data, target_file_path):
    # 1. 解析参数传入的数据
    updates = parse_dsl_to_map(input_data)
    if not updates:
        print("输入数据中没有包含样式信息，跳过更新。")
        return

    # 2. 确定目标选择器 (核心修改逻辑)
    target_selector = determine_target_selector(input_data)
    print(f"检测到设计模式: {target_selector}，将在该作用域下更新变量。")

    # 3. 检查目标文件
    if not os.path.exists(target_file_path):
        print(f"错误：目标文件不存在: {target_file_path}")
        return

    print(f"正在处理文件: {target_file_path}")

    with open(target_file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    in_target_block = False  # 状态机：是否在目标块内
    updated_count = 0

    var_pattern = re.compile(r"^(\s*--[\w-]+)(\s*:\s*)([^;]+)(;.*)?$")

    for line in lines:
        stripped = line.strip()

        # 核心修改：动态检查 target_selector (例如 :root 或 .dark)
        # 且检查该行包含 '{'，标志着块的开始
        if target_selector in stripped and "{" in stripped:
            in_target_block = True
        elif in_target_block and "}" in stripped:
            in_target_block = False

        if in_target_block:
            match = var_pattern.match(line)
            if match:
                prefix_name = match.group(1)
                separator = match.group(2)
                current_val = match.group(3)
                suffix = match.group(4) or ";"

                var_name = prefix_name.strip()

                if var_name in updates:
                    new_val = updates[var_name]
                    if new_val != current_val.strip():
                        line = f"{prefix_name}{separator}{new_val}{suffix}\n"
                        updated_count += 1

        new_lines.append(line)

    with open(target_file_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

    print(f"成功！已更新 {updated_count} 个 CSS 变量 (在 {target_selector} 作用域下)。")


# ==========================================
# 3. 主入口
# ==========================================
if __name__ == "__main__":
    args = sys.argv[1:]

    try:
        dsl_file_path = "dsl.json"
        project_root = "."
        input_data = {}

        # 1. 解析命令行参数
        if len(args) >= 1:
            dsl_file_path = args[0]
        if len(args) >= 2:
            project_root = args[1]

        # 2. 读取 DSL 文件
        if not os.path.exists(dsl_file_path):
            print(f"错误：DSL 文件不存在: {dsl_file_path}")
            sys.exit(1)

        try:
            with open(dsl_file_path, "r", encoding="utf-8") as f:
                input_data = json.load(f)
        except Exception as e:
            print(f"读取 DSL 文件失败: {e}")
            sys.exit(1)

        # 3. 执行合并
        target_css_file = os.path.join(project_root, "src", "style.css")
        merge_css_content(input_data, target_css_file)

    except Exception as e:
        print(f"发生未知错误: {e}")
        sys.exit(1)
