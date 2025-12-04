/**
 * SRL (Self-Regulated Learning) Coach Agent
 * 学习与反思教练
 */

import { generateText, generateJson } from "../client";
import { SRL_SYSTEM_PROMPT, buildReflectionPrompt, EMOTIONAL_SUPPORT_TEMPLATE } from "../prompts/srl";
import type { AbilityType } from "@/types/workout";
import type { ReflectionResponse } from "@/types/ai";

export interface SessionSummary {
  totalTasks: number;
  completedTasks: number;
  averageScore: number;
  totalTimeMinutes: number;
  abilitiesWorked: AbilityType[];
  taskHighlights?: {
    taskId: string;
    type: string;
    score: number;
    wasChallenge: boolean;
  }[];
}

/**
 * 生成训练后反思引导
 */
export async function generateReflection(
  sessionSummary: SessionSummary,
  options?: {
    consecutiveDaysLow?: boolean;
    performanceDecline?: boolean;
  }
): Promise<ReflectionResponse> {
  const prompt = buildReflectionPrompt(sessionSummary);

  let additionalContext = "";
  if (options?.consecutiveDaysLow) {
    additionalContext += "\n注意：用户最近几天训练时间较少，可以温和地询问是否生活忙碌。";
  }
  if (options?.performanceDecline) {
    additionalContext += "\n注意：用户表现比之前有所下降，可以关心一下是否有什么困扰。";
  }

  const response = await generateText({
    system: SRL_SYSTEM_PROMPT + additionalContext,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    maxTokens: 1024,
  });

  // 从回复中提取结构化数据
  const parsed = parseReflectionResponse(response.content);

  return {
    overallComment: parsed.overallComment || response.content,
    reflectionQuestions: parsed.questions || extractQuestions(response.content),
    encouragement: parsed.encouragement,
  };
}

/**
 * 从回复中提取问题
 */
function extractQuestions(content: string): string[] {
  const questions: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    // 匹配问号结尾的句子
    if (trimmed.endsWith("?") || trimmed.endsWith("？")) {
      // 移除前面的符号
      const cleaned = trimmed.replace(/^[-•*\d.)\]]\s*/, "");
      if (cleaned.length > 5) {
        questions.push(cleaned);
      }
    }
  }

  return questions.slice(0, 3); // 最多3个问题
}

/**
 * 解析反思回复
 */
function parseReflectionResponse(content: string): {
  overallComment?: string;
  questions: string[];
  encouragement?: string;
} {
  const questions = extractQuestions(content);

  // 尝试分离总体评价和问题部分
  const parts = content.split(/\n\n+/);
  let overallComment = "";
  let encouragement = "";

  if (parts.length > 1) {
    overallComment = parts[0];
    // 最后一段如果不是问题，可能是鼓励的话
    const lastPart = parts[parts.length - 1];
    if (!lastPart.includes("?") && !lastPart.includes("？")) {
      encouragement = lastPart;
    }
  }

  return { overallComment, questions, encouragement };
}

/**
 * 处理用户反思回答
 */
export async function processReflectionAnswer(
  userReflection: string,
  sessionSummary: SessionSummary
): Promise<{
  summary: string;
  insights: string[];
  nextSuggestion: string;
}> {
  const prompt = `用户刚完成了一次训练，并做了以下反思：

【训练概况】
- 完成：${sessionSummary.completedTasks}/${sessionSummary.totalTasks} 题
- 平均分：${sessionSummary.averageScore}
- 训练能力：${sessionSummary.abilitiesWorked.join("、")}

【用户反思】
${userReflection}

请：
1. 用 2-3 句话总结用户的反思要点
2. 提取 1-2 个有价值的洞察（用户可能没意识到的）
3. 给出 1 个具体的下次训练建议

输出 JSON：
{
  "summary": "反思总结",
  "insights": ["洞察1", "洞察2"],
  "nextSuggestion": "下次训练建议"
}`;

  const response = await generateJson<{
    summary: string;
    insights: string[];
    nextSuggestion: string;
  }>({
    system: SRL_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return {
    summary: response.summary || "感谢你的反思",
    insights: response.insights || [],
    nextSuggestion: response.nextSuggestion || "继续保持训练习惯",
  };
}

/**
 * 处理负面情绪
 */
export async function handleNegativeEmotion(
  userMessage: string,
  context?: {
    recentPerformance?: number;
    consecutiveFails?: number;
  }
): Promise<string> {
  let prompt = `用户在训练过程中表达了负面情绪：

【用户消息】
${userMessage}
`;

  if (context) {
    if (context.recentPerformance !== undefined) {
      prompt += `\n【近期表现】平均分 ${context.recentPerformance}`;
    }
    if (context.consecutiveFails !== undefined) {
      prompt += `\n【连续错误】${context.consecutiveFails} 次`;
    }
  }

  prompt += `

请按照情绪支持模板回应用户，要点：
1. 共情（1-2句）
2. 正常化
3. 具体化问题
4. 给出调整建议

注意：如果用户表达的是严重情绪问题，要温和建议寻求专业帮助。`;

  const response = await generateText({
    system: SRL_SYSTEM_PROMPT + "\n\n" + EMOTIONAL_SUPPORT_TEMPLATE,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    maxTokens: 512,
  });

  return response.content;
}

/**
 * 生成训练前状态检查
 */
export async function generatePreSessionCheck(
  userName: string,
  lastSessionInfo?: string
): Promise<string> {
  const prompt = `请生成训练前的状态检查对话。

用户名：${userName}
${lastSessionInfo ? `上次训练：${lastSessionInfo}` : "这是新用户"}

要点：
1. 轻松问候
2. 询问精力分数（1-10）
3. 询问今天想练的方向或目标`;

  const response = await generateText({
    system: SRL_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    maxTokens: 512,
  });

  return response.content;
}

/**
 * 生成训练中期检查
 */
export async function generateMidSessionCheck(stats: {
  completedTasks: number;
  accuracy: number;
  currentDifficulty: number;
}): Promise<string> {
  const { completedTasks, accuracy, currentDifficulty } = stats;

  let situation = "正常";
  if (accuracy >= 80) situation = "表现很好";
  else if (accuracy < 50) situation = "遇到困难";

  const prompt = `训练进行到一半，请生成一个简短的状态检查。

【当前情况】
- 已完成：${completedTasks} 题
- 正确率：${accuracy}%
- 当前难度：${currentDifficulty}/5
- 状态：${situation}

请生成 2-3 句话的检查，根据情况：
- 表现好：简短肯定 + 询问是否想加挑战
- 正常：询问感受
- 遇到困难：共情 + 询问是否需要调整`;

  const response = await generateText({
    system: SRL_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    maxTokens: 256,
  });

  return response.content;
}

/**
 * 生成目标设定引导
 */
export async function generateGoalSetting(
  userInput: string,
  availableAbilities: AbilityType[]
): Promise<{
  clarifiedGoal: string;
  suggestedFocus: AbilityType[];
  confirmation: string;
}> {
  const prompt = `用户想要设定训练目标，请帮助具体化。

【用户输入】
${userInput}

【可选训练方向】
${availableAbilities.join("、")}

请：
1. 把用户的模糊目标具体化
2. 建议 1-2 个重点能力方向
3. 生成确认话术

输出 JSON：
{
  "clarifiedGoal": "具体化的目标描述",
  "suggestedFocus": ["能力1", "能力2"],
  "confirmation": "确认话术"
}`;

  const response = await generateJson<{
    clarifiedGoal: string;
    suggestedFocus: AbilityType[];
    confirmation: string;
  }>({
    system: SRL_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return {
    clarifiedGoal: response.clarifiedGoal || userInput,
    suggestedFocus: response.suggestedFocus || [availableAbilities[0]],
    confirmation: response.confirmation || "好的，我们开始吧！",
  };
}

