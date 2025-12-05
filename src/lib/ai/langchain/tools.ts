/**
 * LangChain 工具定义
 * 定义 Agent 可以使用的各种工具
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * 题目生成工具的输出 schema
 */
export const exerciseSchema = z.object({
  id: z.string().describe("题目唯一标识"),
  type: z.enum(["memory_recall", "pattern_recognition", "logic_reasoning", "verbal_fluency", "creative_thinking"]).describe("题目类型"),
  prompt: z.string().describe("题目内容"),
  data: z.any().optional().describe("题目附加数据"),
  abilities: z.array(z.string()).describe("训练的认知能力"),
  difficulty: z.number().min(1).max(5).describe("难度等级 1-5"),
  suggestedTime: z.number().optional().describe("建议用时（秒）"),
  hints: z.array(z.string()).optional().describe("提示列表"),
  solution: z.string().optional().describe("参考答案"),
});

/**
 * 评估结果 schema
 */
export const evaluationSchema = z.object({
  overallScore: z.number().min(0).max(100).describe("总分 0-100"),
  label: z.enum(["excellent", "good", "fair", "needs_work"]).describe("表现等级"),
  dimensions: z.object({
    accuracy: z.number().min(0).max(100).describe("准确性得分"),
    completeness: z.number().min(0).max(100).describe("完整性得分"),
    creativity: z.number().min(0).max(100).optional().describe("创意性得分"),
    speed: z.number().min(0).max(100).optional().describe("速度得分"),
  }),
  strengthsForUser: z.string().describe("给用户的优点反馈"),
  improvementsForUser: z.string().describe("给用户的改进建议"),
  nextTimeTipForUser: z.string().describe("下次训练建议"),
  cognitiveInsights: z.object({
    attention: z.number().min(-10).max(10).optional(),
    memory: z.number().min(-10).max(10).optional(),
    logic: z.number().min(-10).max(10).optional(),
    expression: z.number().min(-10).max(10).optional(),
    metacog: z.number().min(-10).max(10).optional(),
  }).optional().describe("认知能力变化估计"),
});

/**
 * 反思结果 schema
 */
export const reflectionSchema = z.object({
  summary: z.string().describe("训练总结"),
  highlights: z.array(z.string()).describe("亮点"),
  challenges: z.array(z.string()).describe("挑战"),
  cognitiveInsights: z.string().describe("认知洞察"),
  recommendations: z.array(z.string()).describe("建议"),
  nextSteps: z.string().describe("下一步计划"),
});

/**
 * 阶段转换建议 schema
 */
export const phaseTransitionSchema = z.object({
  shouldTransition: z.boolean().describe("是否应该转换阶段"),
  nextPhase: z.enum(["start", "warmup", "main", "cooldown", "reflect", "complete"]).optional().describe("建议的下一阶段"),
  reason: z.string().optional().describe("转换原因"),
});

/**
 * 生成题目工具
 */
export const generateExerciseTool = tool(
  async ({ type, difficulty, abilities, theme }) => {
    // 这是一个占位实现，实际逻辑在 Agent 中处理
    return JSON.stringify({
      success: true,
      message: `正在生成 ${type} 类型的题目，难度 ${difficulty}，主题：${theme || "通用"}`,
    });
  },
  {
    name: "generate_exercise",
    description: "根据指定参数生成认知训练题目",
    schema: z.object({
      type: z.enum(["memory_recall", "pattern_recognition", "logic_reasoning", "verbal_fluency", "creative_thinking"]).describe("题目类型"),
      difficulty: z.number().min(1).max(5).describe("难度等级"),
      abilities: z.array(z.string()).describe("目标训练能力"),
      theme: z.string().optional().describe("题目主题"),
    }),
  }
);

/**
 * 评估答案工具
 */
export const evaluateAnswerTool = tool(
  async ({ exercise, userAnswer, timeSpent }) => {
    return JSON.stringify({
      success: true,
      message: `正在评估用户答案，用时 ${timeSpent} 秒`,
    });
  },
  {
    name: "evaluate_answer",
    description: "评估用户对题目的回答",
    schema: z.object({
      exercise: z.object({
        prompt: z.string(),
        solution: z.string().optional(),
      }).describe("题目信息"),
      userAnswer: z.string().describe("用户答案"),
      timeSpent: z.number().optional().describe("用时（秒）"),
    }),
  }
);

/**
 * 查询用户画像工具
 */
export const getUserProfileTool = tool(
  async ({ userId }) => {
    return JSON.stringify({
      success: true,
      message: `正在查询用户 ${userId} 的认知画像`,
    });
  },
  {
    name: "get_user_profile",
    description: "获取用户的认知能力画像",
    schema: z.object({
      userId: z.string().describe("用户ID"),
    }),
  }
);

/**
 * 更新用户画像工具
 */
export const updateUserProfileTool = tool(
  async ({ userId, updates }) => {
    return JSON.stringify({
      success: true,
      message: `正在更新用户 ${userId} 的认知画像`,
    });
  },
  {
    name: "update_user_profile",
    description: "更新用户的认知能力画像",
    schema: z.object({
      userId: z.string().describe("用户ID"),
      updates: z.record(z.string(), z.number()).describe("能力值更新"),
    }),
  }
);

/**
 * 生成反思总结工具
 */
export const generateReflectionTool = tool(
  async ({ sessionData }) => {
    return JSON.stringify({
      success: true,
      message: "正在生成训练反思总结",
    });
  },
  {
    name: "generate_reflection",
    description: "基于训练会话数据生成反思总结",
    schema: z.object({
      sessionData: z.object({
        exercises: z.array(z.any()),
        responses: z.array(z.any()),
        duration: z.number(),
      }).describe("训练会话数据"),
    }),
  }
);

// 导出所有工具
export const allTools = [
  generateExerciseTool,
  evaluateAnswerTool,
  getUserProfileTool,
  updateUserProfileTool,
  generateReflectionTool,
];

// 导出 Coach Agent 专用工具
export const coachTools = [
  generateExerciseTool,
  getUserProfileTool,
];

// 导出 Generator Agent 专用工具
export const generatorTools = [
  generateExerciseTool,
];

// 导出 Judge Agent 专用工具
export const judgeTools = [
  evaluateAnswerTool,
  updateUserProfileTool,
];

// 导出 SRL Agent 专用工具
export const srlTools = [
  generateReflectionTool,
  getUserProfileTool,
];

