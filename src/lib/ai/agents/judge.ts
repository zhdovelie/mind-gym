/**
 * Assessment/Judge Agent - 评分与反馈
 */

import { generateJson, generateText } from "../client";
import { JUDGE_SYSTEM_PROMPT, buildEvaluationPrompt, buildSimpleEvaluationPrompt } from "../prompts/judge";
import type { EvaluationRubric, EvaluateAnswerResponse } from "@/types/exercise";
import type { AbilityType } from "@/types/workout";

export interface EvaluateParams {
  prompt: string;
  userAnswer: string;
  referenceAnswer?: string;
  evaluationRubric: EvaluationRubric;
  abilities: AbilityType[];
}

/**
 * 评估用户答案（完整评估）
 */
export async function evaluateAnswer(
  params: EvaluateParams
): Promise<EvaluateAnswerResponse> {
  const prompt = buildEvaluationPrompt({
    prompt: params.prompt,
    userAnswer: params.userAnswer,
    referenceAnswer: params.referenceAnswer,
    evaluationRubric: params.evaluationRubric,
    abilities: params.abilities,
  });

  const response = await generateJson<EvaluateAnswerResponse>({
    system: JUDGE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5, // 评分时降低随机性
    maxTokens: 1024,
  });

  // 确保所有必要字段存在
  return {
    overallScore: response.overallScore ?? 0,
    label: response.label ?? "错误",
    dimensionScores: response.dimensionScores ?? [],
    errorTypes: response.errorTypes ?? [],
    strengthsForUser: response.strengthsForUser ?? "你做出了尝试",
    improvementsForUser: response.improvementsForUser ?? "可以再仔细思考一下",
    nextTimeTipForUser: response.nextTimeTipForUser ?? "下次可以花更多时间理解题目",
    feedbackToUser: response.feedbackToUser ?? generateDefaultFeedback(response.overallScore ?? 0),
    nextHint: response.nextHint,
  };
}

/**
 * 简单评估（用于客观题）
 */
export async function evaluateSimple(params: {
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
}): Promise<{
  isCorrect: boolean;
  overallScore: number;
  label: string;
  briefFeedback: string;
}> {
  const prompt = buildSimpleEvaluationPrompt(params);

  const response = await generateJson<{
    isCorrect: boolean;
    overallScore: number;
    label: string;
    briefFeedback: string;
  }>({
    system: JUDGE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    maxTokens: 256,
  });

  return {
    isCorrect: response.isCorrect ?? false,
    overallScore: response.overallScore ?? 0,
    label: response.label ?? "错误",
    briefFeedback: response.briefFeedback ?? "请再试一次",
  };
}

/**
 * 评估开放式回答
 */
export async function evaluateOpenAnswer(params: {
  prompt: string;
  userAnswer: string;
  context?: string;
}): Promise<EvaluateAnswerResponse> {
  const openRubric: EvaluationRubric = {
    dimensions: [
      { name: "思考深度", description: "是否有深入思考", weight: 0.35 },
      { name: "逻辑性", description: "论述是否有逻辑", weight: 0.25 },
      { name: "表达清晰", description: "表达是否清晰易懂", weight: 0.25 },
      { name: "独特见解", description: "是否有自己的想法", weight: 0.15 },
    ],
    scoringScale: {
      "0": "没有实质内容",
      "1": "有内容但很浅",
      "2": "一般水平的回答",
      "3": "较好的回答",
      "4": "很好的回答",
      "5": "出色的回答",
    },
    typicalMistakes: ["过于简短", "逻辑跳跃", "偏离主题", "过于空泛"],
  };

  return evaluateAnswer({
    prompt: params.prompt,
    userAnswer: params.userAnswer,
    evaluationRubric: openRubric,
    abilities: ["expression", "metacog"],
  });
}

/**
 * 生成提示（不直接给答案）
 */
export async function generateHint(params: {
  prompt: string;
  userAnswer: string;
  referenceAnswer: string;
  hintLevel: 1 | 2 | 3; // 1=小提示, 2=中提示, 3=大提示
}): Promise<string> {
  const { prompt: question, userAnswer, referenceAnswer, hintLevel } = params;

  const hintPrompt = `用户在做一道题时遇到了困难，请根据提示级别给出适当的引导。

【题目】
${question}

【用户当前答案】
${userAnswer || "（用户还没有作答）"}

【参考答案】（不要直接告诉用户）
${referenceAnswer}

【提示级别】${hintLevel}/3
- 级别1：非常小的提示，只是引导思考方向
- 级别2：中等提示，指出关键点但不给答案
- 级别3：较大提示，可以说出部分思路

请生成一个恰当的提示，帮助用户自己想出答案，而不是直接告诉他答案。`;

  const response = await generateText({
    system: JUDGE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: hintPrompt }],
    temperature: 0.7,
    maxTokens: 256,
  });

  return response.content;
}

/**
 * 生成默认反馈
 */
function generateDefaultFeedback(score: number): string {
  if (score >= 90) {
    return "非常棒！你的回答准确且思路清晰。继续保持这种状态！";
  } else if (score >= 70) {
    return "做得不错！核心思路是对的，还有一些小细节可以完善。";
  } else if (score >= 50) {
    return "有一定的理解，但还需要再深入思考一下。我们来看看哪里可以改进。";
  } else if (score >= 30) {
    return "看起来这道题有些挑战性。没关系，我们一起来分析一下。";
  } else {
    return "这道题确实不容易。让我们从头梳理一下思路。";
  }
}

/**
 * 计算综合分数
 */
export function calculateOverallScore(
  dimensionScores: { score: number; weight?: number }[],
  maxScore: number = 5
): number {
  if (!dimensionScores.length) return 0;

  const totalWeight = dimensionScores.reduce((sum, d) => sum + (d.weight || 1), 0);
  const weightedSum = dimensionScores.reduce(
    (sum, d) => sum + d.score * (d.weight || 1),
    0
  );

  const normalizedScore = weightedSum / totalWeight;
  return Math.round((normalizedScore / maxScore) * 100);
}

/**
 * 获取分数标签
 */
export function getScoreLabel(score: number): EvaluateAnswerResponse["label"] {
  if (score >= 90) return "完全正确";
  if (score >= 70) return "基本正确";
  if (score >= 40) return "部分正确";
  return "错误";
}

