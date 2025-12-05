/**
 * SRL (Self-Regulated Learning) Agent - 基于 LangChain 的元认知教练
 * 负责引导用户反思、规划、自我调节
 */

import { ChatOpenAI } from "@langchain/openai";
import {
  SystemMessage,
  HumanMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { createChatModel, convertToLangChainMessages } from "../client";
import { SRL_SYSTEM_PROMPT, buildReflectionPrompt } from "../../prompts/srl";
import type { AgentContext, ChatMessage } from "@/types/ai";
import type { ReflectionResult } from "@/types/workout";

// 反思输出 Schema
const reflectionOutputSchema = z.object({
  summary: z.string().describe("训练总结"),
  highlights: z.array(z.string()).describe("亮点"),
  challenges: z.array(z.string()).describe("挑战"),
  cognitiveInsights: z.string().describe("认知洞察"),
  recommendations: z.array(z.string()).describe("建议"),
  nextSteps: z.string().describe("下一步计划"),
  metacognitivePrompts: z.array(z.string()).optional().describe("元认知提问"),
});

// 反思解析器
const reflectionParser = StructuredOutputParser.fromZodSchema(reflectionOutputSchema);

// 学习计划 Schema
const learningPlanSchema = z.object({
  shortTermGoals: z.array(z.string()).describe("短期目标（1-2周）"),
  mediumTermGoals: z.array(z.string()).describe("中期目标（1-2月）"),
  focusAreas: z.array(z.string()).describe("重点训练领域"),
  suggestedSchedule: z.object({
    sessionsPerWeek: z.number().describe("每周训练次数"),
    minutesPerSession: z.number().describe("每次训练时长"),
    bestTimes: z.array(z.string()).describe("建议训练时间"),
  }),
  milestones: z.array(z.object({
    target: z.string(),
    deadline: z.string(),
    metric: z.string(),
  })).describe("里程碑"),
});

// 学习计划解析器
const planParser = StructuredOutputParser.fromZodSchema(learningPlanSchema);

export interface SRLOptions {
  context: AgentContext;
  sessionData?: {
    exercises: Array<{
      type: string;
      difficulty: number;
      score: number;
      timeSpent: number;
    }>;
    totalDuration: number;
    averageScore: number;
  };
  previousReflections?: ReflectionResult[];
}

/**
 * 生成训练反思
 */
export async function generateReflection(options: SRLOptions): Promise<ReflectionResult> {
  const systemPrompt = SRL_SYSTEM_PROMPT;
  const chatModel = createChatModel({
    temperature: 0.6,
    maxTokens: 2048,
  });

  // 构建会话数据描述
  let sessionDescription = "";
  if (options.sessionData) {
    const { exercises, totalDuration, averageScore } = options.sessionData;
    sessionDescription = `
【本次训练数据】
- 完成题目数：${exercises.length}
- 训练时长：${Math.round(totalDuration / 60)} 分钟
- 平均得分：${averageScore}
- 题目表现：
${exercises.map((e, i) => `  ${i + 1}. ${e.type} (难度${e.difficulty}) - ${e.score}分, 用时${e.timeSpent}秒`).join("\n")}
`;
  }

  // 构建历史反思
  let previousInsights = "";
  if (options.previousReflections && options.previousReflections.length > 0) {
    const recent = options.previousReflections.slice(-3);
    previousInsights = `
【近期反思摘要】
${recent.map((r) => `- ${r.summary}`).join("\n")}
`;
  }

  const reflectPrompt = `请为用户生成本次训练的反思和总结。

【用户信息】
用户名：${options.context.userName}
${options.context.cognitiveProfile ? `认知画像：专注力${options.context.cognitiveProfile.attention} | 记忆力${options.context.cognitiveProfile.memory} | 逻辑力${options.context.cognitiveProfile.logic}` : ""}

${sessionDescription}
${previousInsights}

${reflectionParser.getFormatInstructions()}

请生成深度、有洞察力的反思内容：`;

  const messages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage(reflectPrompt),
  ];

  const response = await chatModel.invoke(messages);
  const content = response.content as string;

  // 解析输出
  try {
    const parsed = await reflectionParser.parse(content);
    return {
      ...parsed,
      createdAt: new Date(),
    } as ReflectionResult;
  } catch {
    // 如果解析失败，尝试直接提取 JSON
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1].trim());
      return {
        ...parsed,
        createdAt: new Date(),
      } as ReflectionResult;
    }
    throw new Error(`无法解析反思输出: ${content}`);
  }
}

/**
 * 引导反思对话
 */
export async function guideReflectionDialogue(
  userInput: string,
  context: AgentContext,
  history: ChatMessage[]
): Promise<{
  response: string;
  metacognitiveQuestion?: string;
  insightDetected?: string;
}> {
  const systemPrompt = SRL_SYSTEM_PROMPT;
  const chatModel = createChatModel({
    temperature: 0.7,
    maxTokens: 1024,
  });

  const dialoguePrompt = `你正在引导用户进行训练反思。

用户说：${userInput}

请根据用户的回应：
1. 给出有同理心的回应
2. 如果用户有洞察，给予肯定和扩展
3. 提出一个引导性的元认知问题

请用JSON格式回复：
{
  "response": "你的回应",
  "metacognitiveQuestion": "引导问题（可选）",
  "insightDetected": "检测到的洞察（可选）"
}`;

  const messages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    ...convertToLangChainMessages(history),
    new HumanMessage(dialoguePrompt),
  ];

  const response = await chatModel.invoke(messages);
  const content = response.content as string;

  // 提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return {
    response: content,
  };
}

/**
 * 生成个性化学习计划
 */
export async function generateLearningPlan(
  context: AgentContext,
  historicalData?: {
    sessionsCompleted: number;
    averageScores: Record<string, number>;
    preferredTimes: string[];
    consistencyRate: number;
  }
): Promise<z.infer<typeof learningPlanSchema>> {
  const systemPrompt = SRL_SYSTEM_PROMPT;
  const chatModel = createChatModel({
    temperature: 0.5,
    maxTokens: 2048,
  });

  let dataDescription = "";
  if (historicalData) {
    dataDescription = `
【历史训练数据】
- 已完成会话：${historicalData.sessionsCompleted} 次
- 各能力平均分：${JSON.stringify(historicalData.averageScores)}
- 常用训练时间：${historicalData.preferredTimes.join(", ")}
- 训练一致性：${historicalData.consistencyRate}%
`;
  }

  const planPrompt = `请为用户生成个性化学习计划。

【用户信息】
用户名：${context.userName}
${context.cognitiveProfile ? `当前能力：专注力${context.cognitiveProfile.attention} | 记忆力${context.cognitiveProfile.memory} | 逻辑力${context.cognitiveProfile.logic}` : ""}

${dataDescription}

${planParser.getFormatInstructions()}

请制定科学、可执行的学习计划：`;

  const messages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage(planPrompt),
  ];

  const response = await chatModel.invoke(messages);
  const content = response.content as string;

  // 解析输出
  try {
    return await planParser.parse(content);
  } catch {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    throw new Error(`无法解析学习计划: ${content}`);
  }
}

/**
 * 生成自我评估问题
 */
export async function generateSelfAssessmentQuestions(
  context: AgentContext,
  focus?: string
): Promise<string[]> {
  const systemPrompt = SRL_SYSTEM_PROMPT;
  const chatModel = createChatModel({
    temperature: 0.7,
    maxTokens: 1024,
  });

  const questionPrompt = `请生成5个自我评估问题，帮助用户反思自己的认知训练。

${focus ? `重点方向：${focus}` : ""}

请用JSON数组格式返回：
["问题1", "问题2", "问题3", "问题4", "问题5"]

问题应该：
- 引导用户思考训练过程
- 帮助识别进步和挑战
- 促进元认知发展`;

  const messages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage(questionPrompt),
  ];

  const response = await chatModel.invoke(messages);
  const content = response.content as string;

  // 提取 JSON 数组
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return [
    "这次训练中，你觉得最有挑战的是什么？",
    "你使用了什么策略来解决困难的题目？",
    "哪些方面你感觉有进步？",
    "下次训练你想尝试什么不同的方法？",
    "你对自己的表现满意吗？为什么？",
  ];
}

/**
 * 分析用户的元认知水平
 */
export async function analyzeMetacognition(
  reflections: string[],
  context: AgentContext
): Promise<{
  level: "beginner" | "developing" | "proficient" | "advanced";
  indicators: string[];
  suggestions: string[];
}> {
  const chatModel = createChatModel({
    temperature: 0.4,
    maxTokens: 1024,
  });

  const analysisPrompt = `分析用户的元认知水平。

用户的反思内容：
${reflections.map((r, i) => `${i + 1}. ${r}`).join("\n")}

请用JSON格式返回分析结果：
{
  "level": "beginner/developing/proficient/advanced",
  "indicators": ["体现的元认知指标1", "指标2"],
  "suggestions": ["提升建议1", "建议2"]
}

元认知水平判断标准：
- beginner: 很少反思，对自己的思维过程缺乏觉察
- developing: 开始注意到思维过程，但缺乏系统性
- proficient: 能有效监控和调节学习过程
- advanced: 深入理解自己的认知特点，能灵活调整策略`;

  const messages: BaseMessage[] = [
    new SystemMessage("你是元认知评估专家。"),
    new HumanMessage(analysisPrompt),
  ];

  const response = await chatModel.invoke(messages);
  const content = response.content as string;

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return {
    level: "developing",
    indicators: ["展示了基本的自我反思能力"],
    suggestions: ["尝试更深入地思考学习过程"],
  };
}

/**
 * 生成激励信息
 */
export async function generateMotivation(
  context: AgentContext,
  currentStreak?: number,
  recentAchievements?: string[]
): Promise<string> {
  const chatModel = createChatModel({
    temperature: 0.8,
    maxTokens: 256,
  });

  const motivationPrompt = `为用户 ${context.userName} 生成一条激励信息。

${currentStreak ? `连续训练天数：${currentStreak}` : ""}
${recentAchievements ? `近期成就：${recentAchievements.join(", ")}` : ""}

请生成简短、真诚、有力量的激励话语。直接输出激励信息，不需要JSON格式。`;

  const messages: BaseMessage[] = [
    new SystemMessage("你是一个温暖又有力量的激励教练。"),
    new HumanMessage(motivationPrompt),
  ];

  const response = await chatModel.invoke(messages);
  return response.content as string;
}

