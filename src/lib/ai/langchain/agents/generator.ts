/**
 * Generator Agent - 基于 LangChain 的题目生成专家
 * 负责生成各类认知训练题目
 */

import { ChatOpenAI } from "@langchain/openai";
import {
  SystemMessage,
  HumanMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { createChatModel, generateJsonWithLangChain } from "../client";
import { buildGeneratorSystemPrompt, getExerciseTypePrompt } from "../../prompts/generator";
import type { Exercise, ExerciseType, GeneratedExercise } from "@/types/exercise";
import type { AgentContext } from "@/types/ai";

// 题目输出 Schema
const exerciseOutputSchema = z.object({
  id: z.string().describe("题目唯一标识"),
  type: z.enum([
    "memory_recall",
    "pattern_recognition",
    "logic_reasoning",
    "verbal_fluency",
    "creative_thinking",
  ]).describe("题目类型"),
  prompt: z.string().describe("题目内容"),
  data: z.any().optional().describe("题目附加数据"),
  abilities: z.array(z.string()).describe("训练的认知能力"),
  difficulty: z.number().min(1).max(5).describe("难度等级 1-5"),
  suggestedTime: z.number().optional().describe("建议用时（秒）"),
  hints: z.array(z.string()).optional().describe("提示列表"),
  solution: z.string().optional().describe("参考答案"),
});

// 结构化输出解析器
const exerciseParser = StructuredOutputParser.fromZodSchema(exerciseOutputSchema);

export interface GeneratorOptions {
  type?: ExerciseType;
  difficulty?: number;
  abilities?: string[];
  theme?: string;
  context?: AgentContext;
  avoidTypes?: ExerciseType[];
  customPrompt?: string;
}

/**
 * 生成单个题目
 */
export async function generateExercise(
  options: GeneratorOptions
): Promise<GeneratedExercise> {
  const systemPrompt = buildGeneratorSystemPrompt(options);
  const typePrompt = options.type ? getExerciseTypePrompt(options.type) : "";

  const generatePrompt = `请生成一道认知训练题目。

参数：
- 类型：${options.type || "自动选择"}
- 难度：${options.difficulty || 3}/5
- 目标能力：${options.abilities?.join(", ") || "综合训练"}
${options.theme ? `- 主题：${options.theme}` : ""}
${typePrompt ? `\n类型说明：\n${typePrompt}` : ""}
${options.customPrompt ? `\n额外要求：\n${options.customPrompt}` : ""}

${exerciseParser.getFormatInstructions()}

请生成题目：`;

  const chatModel = createChatModel({
    temperature: 0.8, // 题目生成用较高温度增加创意
    maxTokens: 2048,
  });

  const messages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    new HumanMessage(generatePrompt),
  ];

  const response = await chatModel.invoke(messages);
  const content = response.content as string;

  // 解析输出
  try {
    const parsed = await exerciseParser.parse(content);
    return {
      ...parsed,
      id: parsed.id || `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      generatedAt: new Date(),
    } as GeneratedExercise;
  } catch {
    // 如果解析失败，尝试直接提取 JSON
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1].trim());
      return {
        ...parsed,
        id: parsed.id || `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        generatedAt: new Date(),
      } as GeneratedExercise;
    }
    throw new Error(`无法解析题目输出: ${content}`);
  }
}

/**
 * 批量生成题目
 */
export async function generateExerciseBatch(
  count: number,
  options: GeneratorOptions
): Promise<GeneratedExercise[]> {
  const exercises: GeneratedExercise[] = [];
  const usedTypes = new Set<ExerciseType>();

  for (let i = 0; i < count; i++) {
    // 避免连续重复类型
    const avoidTypes = options.avoidTypes
      ? [...options.avoidTypes, ...Array.from(usedTypes)]
      : Array.from(usedTypes);

    const exercise = await generateExercise({
      ...options,
      avoidTypes: avoidTypes as ExerciseType[],
    });

    exercises.push(exercise);

    if (exercise.type) {
      usedTypes.add(exercise.type as ExerciseType);
      // 只保留最近2个类型
      if (usedTypes.size > 2) {
        const first = usedTypes.values().next().value;
        if (first) usedTypes.delete(first);
      }
    }
  }

  return exercises;
}

/**
 * 根据用户画像自适应生成题目
 */
export async function generateAdaptiveExercise(
  context: AgentContext,
  recentPerformance?: {
    averageScore: number;
    weakAreas: string[];
    strongAreas: string[];
  }
): Promise<GeneratedExercise> {
  // 计算自适应难度
  let difficulty = 3;
  if (recentPerformance) {
    if (recentPerformance.averageScore > 80) {
      difficulty = Math.min(5, difficulty + 1);
    } else if (recentPerformance.averageScore < 60) {
      difficulty = Math.max(1, difficulty - 1);
    }
  }

  // 确定训练能力
  let abilities = recentPerformance?.weakAreas || ["memory", "logic"];
  if (abilities.length === 0) {
    abilities = ["attention", "memory", "logic"];
  }

  // 根据用户画像调整
  if (context.cognitiveProfile) {
    const profile = context.cognitiveProfile;
    const profileAbilities = [
      { name: "attention", score: profile.attention },
      { name: "memory", score: profile.memory },
      { name: "logic", score: profile.logic },
    ];

    // 优先训练薄弱能力
    profileAbilities.sort((a, b) => a.score - b.score);
    abilities = profileAbilities.slice(0, 2).map((a) => a.name);
  }

  return generateExercise({
    difficulty,
    abilities,
    context,
    customPrompt: `用户最近平均得分 ${recentPerformance?.averageScore || "未知"}，请根据此调整题目难度和类型。`,
  });
}

/**
 * 生成特定主题的题目
 */
export async function generateThemedExercise(
  theme: string,
  options?: Partial<GeneratorOptions>
): Promise<GeneratedExercise> {
  return generateExercise({
    ...options,
    theme,
    customPrompt: `请围绕"${theme}"主题设计题目，让用户在有趣的场景中锻炼认知能力。`,
  });
}

/**
 * 生成热身题目（低难度）
 */
export async function generateWarmupExercise(
  context?: AgentContext
): Promise<GeneratedExercise> {
  return generateExercise({
    difficulty: 1,
    abilities: ["memory", "attention"],
    context,
    customPrompt: "这是热身题目，请设计简单有趣的内容，帮助用户进入状态。",
  });
}

/**
 * 生成挑战题目（高难度）
 */
export async function generateChallengeExercise(
  context?: AgentContext
): Promise<GeneratedExercise> {
  return generateExercise({
    difficulty: 5,
    abilities: ["logic", "metacog", "creativity"],
    context,
    customPrompt: "这是挑战题目，请设计具有深度的内容，需要多步推理或创造性思考。",
  });
}

/**
 * 为特定能力生成专项训练题目
 */
export async function generateFocusedExercise(
  targetAbility: string,
  difficulty: number = 3,
  context?: AgentContext
): Promise<GeneratedExercise> {
  const abilityTypeMap: Record<string, ExerciseType[]> = {
    attention: ["pattern_recognition"],
    memory: ["memory_recall"],
    logic: ["logic_reasoning"],
    expression: ["verbal_fluency"],
    creativity: ["creative_thinking"],
  };

  const preferredTypes = abilityTypeMap[targetAbility] || [];

  return generateExercise({
    type: preferredTypes[0],
    difficulty,
    abilities: [targetAbility],
    context,
    customPrompt: `请专门针对"${targetAbility}"能力设计训练题目。`,
  });
}

