import { tool } from "@opencode-ai/plugin";
import path from "node:path";
import process from "node:process";

export default tool({
  description: "初始化Shadcn-Vue项目",
  args: {
    projectName: tool.schema.string().describe("项目名称").optional(),
  },
  async execute(args, ctx) {
    try {
      // 1. 构造绝对路径，防止路径错误
      const scriptPath = path.join(
        process.cwd(),
        ".opencode",
        "tool",
        "shadcn_vue_init.py",
      );

      let output: Bun.ShellOutput;

      if (args.projectName) {
        // 有项目名称参数
        output = await Bun.$`python ${scriptPath} ${args.projectName}`;
      } else {
        // 无参数，使用默认值
        output = await Bun.$`python ${scriptPath}`;
      }

      // 3. 获取输出文本
      const resultText = output.text();

      return `Shadcn-Vue项目初始化完成，路径为：\n${resultText}`;
    } catch (error) {
      // 捕获错误对象并转为字符串
      console.log("错误信息:", error);
      throw new Error(`执行失败: ${error}`);
    }
  },
});
