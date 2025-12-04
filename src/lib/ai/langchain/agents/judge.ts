/**
 * Judge Agent - 基于 LangChain 的评估裁判
 * 负责评估用户回答、打分、生成反馈
 */

import { ChatOpenAI } from "@langchain/openai";
import {
  SystemMessage,
  HumanMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { createChatModel } from "../client";
import { buildJudgeSystemPrompt } from "../../prompts/judge";
import type { Exercise, EvaluationResult, EvaluationDimensions } from "@/types/exercise";
import type { AgentContext } from "@/types/ai";

// 评估输出 Schema
const evaluationOutputSchema = z.object({
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

// 结构化输出解析器
const evaluationParser = StructuredOutputParser.fromZodSchema(evaluationOutputSchema);

export interface JudgeOptions {
  exercise: Exercise;
  userAnswer: string;
  timeSpent?: number;
  context?: AgentContext;
  expectedAnswer?: string;
  evaluationFocus?: string[];
}

/**
 * 评估用户回答
 */
export async function evaluateAnswer(options: JudgeOptions): Promise<EvaluationResult> {
  const systemPrompt = buildJudgeSystemPrompt(options);
  const chatModel = createChatModel({
    temperature: 0.3, // 评估用较低温度保证一致性
    maxTokens: 2048,
  });

  // 计算时间相关信息
  let timeInfo = "";
  if (options.timeSpent && options.exercise.suggestedTime) {
    const timeRatio = options.timeSpent / options.exercise.suggestedTime;
    if (timeRatio < 0.5) {
      timeInfo = `用时 ${options.timeSpent}秒，远快于建议时间（${options.exercise.suggestedTime}秒），可能存在仓促作答`;
    } else if (timeRatio > 2) {
      timeInfo = `用时 ${options.timeSpent}秒，远超建议时间（${options.exercise.suggestedTime}秒），可能遇到困难`;
    } else {
      timeInfo = `用时 ${options.timeSpent}秒，在建议时间范围内`;
    }
  }

  const evaluatePrompt = `请评估以下用户回答。

【题目信息】
类型：${options.exercise.type}
难度：${options.exercise.difficulty}/5
训练能力：${options.exercise.abilities?.join(", ") || "综合"}
题目内容：
${options.exercise.prompt}

${options.exercise.solution ? `【参考答案】\n${options.exercise.solution}\n` : ""}

【用户回答】
${options.userAnswer}

${timeInfo ? `【用时信息】\n${timeInfo}\n` : ""}

${options.evaluationFocus ? `【重点评估】\n${options.evaluationFocus.join(", ")}\n` : ""}

${evaluationParser.getFormatInstructions()}

请进行全面评估：`;

  const messages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage(evaluatePrompt),
  ];

  const response = await chatModel.invoke(messages);
  const content = response.content as string;

  // 解析输出
  try {
    const parsed = await evaluationParser.parse(content);
    return {
      ...parsed,
      exerciseId: options.exercise.id,
      userAnswer: options.userAnswer,
      timeSpent: options.timeSpent,
      evaluatedAt: new Date(),
    } as EvaluationResult;
  } catch {
    // 如果解析失败，尝试直接提取 JSON
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1].trim());
      return {
        ...parsed,
        exerciseId: options.exercise.id,
        userAnswer: options.userAnswer,
        timeSpent: options.timeSpent,
        evaluatedAt: new Date(),
      } as EvaluationResult;
    }
    throw new Error(`无法解析评估输出: ${content}`);
  }
}

/**
 * 快速评估（简化版本）
 */
export async function quickEvaluate(
  exercise: Exercise,
  userAnswer: string
): Promise<{ score: number; isCorrect: boolean; feedback: string }> {
  const chatModel = createChatModel({
    temperature: 0.2,
    maxTokens: 512,
  });

  const quickEvalPrompt = `快速评估用户回答。

题目：${exercise.prompt}
${exercise.solution ? `参考答案：${exercise.solution}` : ""}

用户回答：${userAnswer}

请用JSON格式返回：
{
  "score": 0-100分,
  "isCorrect": true/false,
  "feedback": "一句话反馈"
}`;

  const messages: BaseMessage[] = [
    new SystemMessage("你是一个简洁的评估助手。"),
    new HumanMessage(quickEvalPrompt),
  ];

  const response = await chatModel.invoke(messages);
  const content = response.content as string;

  // 提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  // 默认返回
  return {
    score: 50,
    isCorrect: false,
    feedback: "无法评估，请检查答案格式",
  };
}

/**
 * 对比评估（与参考答案对比）
 */
export async function comparativeEvaluate(
  exercise: Exercise,
  userAnswer: string,
  referenceAnswer: string
): Promise<{
  similarity: number;
  differences: string[];
  suggestions: string[];
}> {
  const chatModel = createChatModel({
    temperature: 0.3,
    maxTokens: 1024,
  });

  const comparePrompt = `比较用户答案与参考答案。

题目：${exercise.prompt}

参考答案：
${referenceAnswer}

用户答案：
${userAnswer}

请用JSON格式返回：
{
  "similarity": 0-100相似度,
  "differences": ["差异1", "差异2"],
  "suggestions": ["改进建议1", "改进建议2"]
}`;

  const messages: BaseMessage[] = [
    new SystemMessage("你是一个精准的答案比较助手。"),
    new HumanMessage(comparePrompt),
  ];

  const response = await chatModel.invoke(messages);
  const content = response.content as string;

  // 提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return {
    similarity: 50,
    differences: ["无法详细比较"],
    suggestions: ["请重新检查答案"],
  };
}

/**
 * 多维度评估
 */
export async function multidimensionalEvaluate(
  exercise: Exercise,
  userAnswer: string,
  dimensions: string[]
): Promise<Record<string, { score: number; comment: string }>> {
  const chatModel = createChatModel({
    temperature: 0.3,
    maxTokens: 2048,
  });

  const dimPrompt = `对用户回答进行多维度评估。

题目：${exercise.prompt}
用户回答：${userAnswer}

评估维度：${dimensions.join(", ")}

请为每个维度给出0-100分和简短评语，JSON格式：
{
  "维度名": { "score": 分数, "comment": "评语" },
  ...
}`;

  const messages: BaseMessage[] = [
    new SystemMessage("你是一个专业的多维度评估专家。"),
    new HumanMessage(dimPrompt),
  ];

  const response = await chatModel.invoke(messages);
  const content = response.content as string;

  // 提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  // 默认返回
  const defaultResult: Record<string, { score: number; comment: string }> = {};
  for (const dim of dimensions) {
    defaultResult[dim] = { score: 50, comment: "无法评估" };
  }
  return defaultResult;
}

/**
 * 生成详细反馈报告
 */
export async function generateFeedbackReport(
  evaluations: EvaluationResult[]
): Promise<{
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  progressNotes: string;
}> {
  const chatModel = createChatModel({
    temperature: 0.5,
    maxTokens: 2048,
  });

  const evalSummary = evaluations.map((e, i) => ({
    index: i + 1,
    score: e.overallScore,
    label: e.label,
    type: e.exerciseId,
  }));

  const reportPrompt = `基于以下评估结果生成训练反馈报告。

评估汇总：
${JSON.stringify(evalSummary, null, 2)}

平均分：${evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length}
优秀数：${evaluations.filter((e) => e.label === "excellent").length}

请生成详细反馈报告，JSON格式：
{
  "summary": "总体评价",
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["待改进1", "待改进2"],
  "recommendations": ["建议1", "建议2"],
  "progressNotes": "进步观察"
}`;

  const messages: BaseMessage[] = [
    new SystemMessage("你是一个专业的训练效果分析师。"),
    new HumanMessage(reportPrompt),
  ];

  const response = await chatModel.invoke(messages);
  const content = response.content as string;

  // 提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return {
    summary: "训练完成，整体表现正常",
    strengths: ["完成了所有题目"],
    weaknesses: ["需要更多练习"],
    recommendations: ["继续坚持训练"],
    progressNotes: "保持当前节奏",
  };
}

