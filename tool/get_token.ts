import { tool } from "@opencode-ai/plugin";

export default tool({
  description:
    "基于MasterGo设计稿的DSL数据文件，获取Design Token 信息并更新项目CSS",
  args: {
    dslPath: tool.schema
      .string()
      .optional()
      .describe(
        "Path to the MasterGo design file DSL JSON file (e.g., 'dsl.json')."
      ),
    projectPath: tool.schema
      .string()
      .optional()
      .describe("Target project root path. Default is current directory."),
  },
  async execute(args) {
    try {
      await Bun.$`pip install -r requirements.txt`.text();
      const scriptPath = ".opencode/tool/get_token.py";
      const { dslPath, projectPath } = args;

      // 1. 设置默认值
      // 如果没传 dslPath，默认传 "dsl.json" 给 Python，让 Python 去找
      const finalDslPath = dslPath || "dsl.json";
      const finalProjectPath = projectPath || ".";

      // 2. 直接调用 Python，传入路径字符串
      // 参数1: DSL文件路径
      // 参数2: 项目根目录路径
      await Bun.$`python ${scriptPath} ${finalDslPath} ${finalProjectPath}`.quiet();

      return `Design tokens updated successfully in ${finalProjectPath}/src/style.css using ${finalDslPath}`;
    } catch (error: any) {
      return JSON.stringify(error);
    }
  },
});
