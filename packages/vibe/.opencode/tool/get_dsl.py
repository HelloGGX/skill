import sys
import json
import os
import logging
from typing import Optional, Tuple, List, Dict, Any
from urllib.parse import urlparse, parse_qs
from pathlib import Path

import requests
import urllib3
from dotenv import load_dotenv

# 配置日志
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# 禁用 SSL 警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv()


class MasterGoAPI:
    """封装 MasterGo API 交互逻辑"""

    def __init__(self):
        self.base_url = self._init_base_url()
        self.token = os.getenv("MG_MCP_TOKEN") or os.getenv("MASTERGO_API_TOKEN")
        if not self.token:
            raise ValueError("Authentication token (MG_MCP_TOKEN) is missing")

        self.session = requests.Session()
        self.session.headers.update(
            {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-MG-UserAccessToken": self.token,
            }
        )
        self.session.verify = False  # 对应原代码中的 verify=False

    def _init_base_url(self) -> str:
        url = os.getenv("API_BASE_URL", "https://mastergo.com/")
        try:
            obj = urlparse(url)
            if not obj.scheme or not obj.hostname:
                raise ValueError
            base = f"{obj.scheme}://{obj.hostname}"
            if obj.port:
                base += f":{obj.port}"
            return base
        except Exception:
            raise ValueError(f"Invalid API_BASE_URL format: {url}")

    def resolve_short_link(self, url: str) -> str:
        """处理短链接重定向"""
        if "/goto/" not in url:
            return url

        try:
            # 仅获取 Header 提高性能
            resp = self.session.get(url, allow_redirects=False, timeout=10)
            if 300 <= resp.status_code < 400:
                target = resp.headers.get("Location")
                if target:
                    return target
            raise ValueError("Failed to resolve short link: No redirect location found")
        except requests.RequestException as e:
            raise ValueError(f"Network error resolving short link: {e}")

    def extract_ids(self, url: str) -> Tuple[str, str]:
        """从 URL 中提取 fileId 和 layerId"""
        target_url = self.resolve_short_link(url)
        parsed = urlparse(target_url)

        # 提取 fileId: 路径中第一个全数字字符串
        path_segments = parsed.path.strip("/").split("/")
        file_id = next((s for s in path_segments if s.isdigit()), None)

        # 提取 layerId
        query_params = parse_qs(parsed.query)
        layer_id = query_params.get("layer_id", [None])[0]

        if not file_id or not layer_id:
            raise ValueError(f"Could not extract IDs from: {target_url}")

        return file_id, layer_id

    def fetch_dsl(self, file_id: str, layer_id: str) -> Dict[str, Any]:
        """获取 DSL 数据"""
        endpoint = f"{self.base_url}/mcp/dsl"
        params = {"fileId": file_id, "layerId": layer_id}

        resp = self.session.get(endpoint, params=params, timeout=30)
        resp.raise_for_status()

        # 处理可能存在的单引号 JSON 问题
        try:
            return resp.json()
        except json.JSONDecodeError:
            # 如果上游返回的是非标准 JSON (如单引号)，进行温和修复
            fixed_text = resp.text.replace("'", '"')
            return json.loads(fixed_text)


class DSLProcessor:
    """DSL 数据处理逻辑"""

    @staticmethod
    def extract_links(dsl: Dict[str, Any]) -> List[str]:
        """递归提取组件文档链接"""
        links = set()

        def traverse(node: Any):
            if not isinstance(node, dict):
                return

            # 安全提取嵌套属性
            info = node.get("componentInfo", {})
            doc_links = info.get("documentLink", [])
            if doc_links and isinstance(doc_links, list) and len(doc_links) > 0:
                links.add(doc_links[0])

            for child in node.get("children", []):
                traverse(child)

        nodes = dsl.get("nodes", [])
        for node in nodes:
            traverse(node)
        return list(links)

    @staticmethod
    def build_rules(no_rule: bool) -> List[str]:
        """构建规则列表"""
        if no_rule:
            return []

        default_rules = [
            "token filed must be generated as a variable (colors, shadows, fonts, etc.) and the token field must be displayed in the comment",
            "componentDocumentLinks is a list of frontend component documentation links...",
        ]

        try:
            env_rules = json.loads(os.getenv("RULES", "[]"))
        except json.JSONDecodeError:
            env_rules = []
            logger.warning("Environment variable 'RULES' is not a valid JSON list")

        return default_rules + env_rules


def main():
    try:
        # 1. 初始化参数
        args = sys.argv[1:]
        input_data = json.loads(args[0]) if args else {}

        short_link = input_data.get("link")
        no_rule = "--no-rule" in sys.argv

        # 2. 初始化 API 客户端
        api = MasterGoAPI()

        if not short_link:
            raise ValueError("请提供设计稿主题页面的地址")

        # 3. 确定 ID
        file_id, layer_id = api.extract_ids(short_link)

        if not file_id or not layer_id:
            raise ValueError("Missing fileId or layerId")

        # 4. 获取并处理数据
        dsl_data = api.fetch_dsl(file_id, layer_id)
        processor = DSLProcessor()

        result = {
            "dsl": dsl_data,
            "componentDocumentLinks": processor.extract_links(dsl_data),
            "rules": processor.build_rules(no_rule),
        }

        # 5. 持久化存储 (使用 pathlib)
        # 假设项目根目录是当前脚本上两级
        project_root = Path(__file__).resolve().parent.parent.parent
        output_path = project_root / "dsl.json"

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        # 6. 输出结果
        print(output_path)

    except Exception as e:
        print(json.dumps({"error": str(e), "type": e.__class__.__name__}))
        sys.exit(1)


if __name__ == "__main__":
    main()
