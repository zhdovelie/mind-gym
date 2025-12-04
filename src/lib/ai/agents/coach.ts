/**
 * Coach Agent - 教练总管
 * 负责对话控制、流程编排、状态管理
 */

import { generateText, buildMessages } from "../client";
import { buildCoachSystemPrompt } from "../prompts/coach";
import type { AgentContext, ChatMessage } from "@/types/ai";
import type { WorkoutPhase } from "@/types/workout";

export interface CoachResponse {
  content: string;
  suggestedPhase?: WorkoutPhase;
  shouldGenerateExercise?: boolean;
  shouldEvaluate?: boolean;
  shouldReflect?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * 运行 Coach Agent
 */
export async function runCoachAgent(
  userMessage: string,
  context: AgentContext,
  history: ChatMessage[]
): Promise<CoachResponse> {
  const systemPrompt = buildCoachSystemPrompt(context);
  
  const messages = buildMessages(history, userMessage);

  const response = await generateText({
    system: systemPrompt,
    messages,
    temperature: 0.7,
    maxTokens: 1024,
  });

  // 分析回复内容，推断下一步动作
  const suggestedAction = analyzeCoachResponse(response.content, context.currentPhase);

  return {
    content: response.content,
    ...suggestedAction,
  };
}

/**
 * 分析 Coach 回复，推断下一步动作
 */
function analyzeCoachResponse(
  content: string,
  currentPhase: WorkoutPhase
): Partial<CoachResponse> {
  const lowerContent = content.toLowerCase();
  
  // 检测是否要出题
  const exerciseKeywords = ["下一道题", "这道题", "请记住", "请思考", "请回答", "试试看"];
  const shouldGenerateExercise = exerciseKeywords.some(k => content.includes(k));

  // 检测是否进入反思
  const reflectKeywords = ["反思", "回顾", "总结", "最难的", "最有挑战"];
  const shouldReflect = reflectKeywords.some(k => content.includes(k)) && 
    (currentPhase === "cooldown" || currentPhase === "reflect");

  // 推断阶段转换
  let suggestedPhase: WorkoutPhase | undefined;
  
  if (currentPhase === "start") {
    if (content.includes("热身") || content.includes("简单的")) {
      suggestedPhase = "warmup";
    }
  } else if (currentPhase === "warmup") {
    if (content.includes("主训练") || content.includes("正式开始") || content.includes("挑战")) {
      suggestedPhase = "main";
    }
  } else if (currentPhase === "main") {
    if (content.includes("最后") || content.includes("总结") || content.includes("反思")) {
      suggestedPhase = "cooldown";
    }
  } else if (currentPhase === "cooldown") {
    if (shouldReflect) {
      suggestedPhase = "reflect";
    }
  } else if (currentPhase === "reflect") {
    if (content.includes("结束") || content.includes("下次") || content.includes("期待")) {
      suggestedPhase = "complete";
    }
  }

  return {
    suggestedPhase,
    shouldGenerateExercise,
    shouldReflect,
  };
}

/**
 * 生成开场对话
 */
export async function generateSessionStart(
  context: AgentContext
): Promise<string> {
  const systemPrompt = buildCoachSystemPrompt({
    ...context,
    currentPhase: "start",
  });

  const startPrompt = `请开始一次新的训练会话。

用户信息：
- 用户名：${context.userName}
${context.lastSessionSummary ? `- 上次训练：${context.lastSessionSummary}` : "- 这是新用户，没有历史训练记录"}
${context.cognitiveProfile ? `- 能力画像：专注力${context.cognitiveProfile.attention} | 记忆力${context.cognitiveProfile.memory} | 逻辑力${context.cognitiveProfile.logic}` : ""}

请按照开场模板，问候用户并询问状态。`;

  const response = await generateText({
    system: systemPrompt,
    messages: [{ role: "user", content: startPrompt }],
    temperature: 0.8,
  });

  return response.content;
}

/**
 * 处理用户选择
 */
export async function handleUserChoice(
  choice: string,
  context: AgentContext,
  history: ChatMessage[]
): Promise<CoachResponse> {
  // 识别用户选择
  const choiceUpper = choice.toUpperCase().trim();
  let interpretation = "";

  if (choiceUpper === "A" || choice.includes("记忆") || choice.includes("热身")) {
    interpretation = "用户选择了记忆/热身方向";
  } else if (choiceUpper === "B" || choice.includes("逻辑") || choice.includes("推理")) {
    interpretation = "用户选择了逻辑推理方向";
  } else if (choiceUpper === "C" || choice.includes("随机") || choice.includes("有趣")) {
    interpretation = "用户选择了随机/有趣的训练";
  }

  // 调用 Coach 继续对话
  const enhancedMessage = interpretation 
    ? `${choice}\n\n[系统提示：${interpretation}]`
    : choice;

  return runCoachAgent(enhancedMessage, context, history);
}

/**
 * 生成题目展示话术
 */
export async function generateExercisePresentation(
  exercise: {
    prompt: string;
    difficulty: number;
    abilities: string[];
    suggestedTime?: number;
  },
  context: AgentContext
): Promise<string> {
  const systemPrompt = buildCoachSystemPrompt(context);

  const abilityNames: Record<string, string> = {
    attention: "专注力",
    memory: "记忆力",
    logic: "逻辑力",
    expression: "表达力",
    metacog: "元认知",
  };

  const abilities = exercise.abilities.map(a => abilityNames[a] || a).join(" + ");
  const timeHint = exercise.suggestedTime 
    ? `建议用时约 ${Math.ceil(exercise.suggestedTime / 60)} 分钟`
    : "不限时间";

  const presentPrompt = `请将以下题目展示给用户。

题目信息：
- 训练能力：${abilities}
- 难度：${exercise.difficulty}/5
- ${timeHint}

题目内容：
${exercise.prompt}

请用教练的口吻介绍这道题，说明训练目标，然后给出题目。`;

  const response = await generateText({
    system: systemPrompt,
    messages: [{ role: "user", content: presentPrompt }],
    temperature: 0.7,
  });

  return response.content;
}

/**
 * 生成反馈话术
 */
export async function generateFeedbackPresentation(
  feedback: {
    overallScore: number;
    label: string;
    strengthsForUser: string;
    improvementsForUser: string;
    nextTimeTipForUser: string;
  },
  context: AgentContext
): Promise<string> {
  const systemPrompt = buildCoachSystemPrompt(context);

  const feedbackPrompt = `请将以下评估结果转化为友好的反馈给用户。

评估结果：
- 总体表现：${feedback.label}（${feedback.overallScore}分）
- 优点：${feedback.strengthsForUser}
- 改进点：${feedback.improvementsForUser}
- 下次建议：${feedback.nextTimeTipForUser}

请用教练的口吻给出反馈，先肯定再建议，语气要鼓励。`;

  const response = await generateText({
    system: systemPrompt,
    messages: [{ role: "user", content: feedbackPrompt }],
    temperature: 0.7,
  });

  return response.content;
}

