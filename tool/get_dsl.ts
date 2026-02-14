import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "获取MasterGo设计稿的DSL数据",
  args: {
    link: tool.schema
      .string()
      .optional()
      .describe("MasterGo link (like https://{domain}/goto/LhGgBAK)."),
  },
  async execute(args, ctx) {
    const scriptPath = ".opencode/tool/get_dsl.py";
    try {
      await Bun.$`pip install -r requirements.txt`.text();
      const { stdout, stderr, exitCode } =
        await Bun.$`python ${scriptPath} ${JSON.stringify(args)}`.quiet();

      // 3. 错误处理
      if (exitCode !== 0) {
        throw new Error(`Python 脚本执行失败: ${stderr.toString()}`);
      }
      // 4. 解析 Python 打印出来的 JSON 字符串
      const result = stdout.toString();

      if (result.error) {
        throw new Error(result.error);
      }

      return JSON.stringify(result);
    } catch (error: any) {
      const errorMessage = error.response?.data ?? error?.message;
      return JSON.stringify(errorMessage);
    }
  },
});
