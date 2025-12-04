/**
 * Exercise Generator Agent - 题目生成
 */

import { generateJson } from "../client";
import { GENERATOR_SYSTEM_PROMPT, buildGeneratorPrompt } from "../prompts/generator";
import type { AbilityType } from "@/types/workout";
import type { 
  ExerciseType, 
  ExerciseStyle, 
  GenerateExerciseResponse,
  EvaluationRubric 
} from "@/types/exercise";

export interface GenerateExerciseParams {
  targetAbilities: AbilityType[];
  difficulty: number;
  style?: ExerciseStyle;
  exerciseType?: ExerciseType;
  userContext?: string;
  timeLimited?: boolean;
}

/**
 * 生成单道练习题
 */
export async function generateExercise(
  params: GenerateExerciseParams
): Promise<GenerateExerciseResponse> {
  const prompt = buildGeneratorPrompt(params);

  const response = await generateJson<GenerateExerciseResponse>({
    system: GENERATOR_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    maxTokens: 2048,
  });

  // 确保返回的数据格式正确
  return {
    prompt: response.prompt || "",
    answer: response.answer,
    explanation: response.explanation,
    suggestedTime: response.suggestedTime,
    difficulty: response.difficulty || params.difficulty,
    abilities: response.abilities || params.targetAbilities,
    exerciseType: response.exerciseType || params.exerciseType || "general",
    evaluationRubric: response.evaluationRubric || getDefaultRubric(),
  };
}

/**
 * 批量生成练习题
 */
export async function generateExerciseBatch(params: {
  count: number;
  abilities: AbilityType[];
  difficultyRange: [number, number];
  mix?: boolean;
  userContext?: string;
}): Promise<GenerateExerciseResponse[]> {
  const { count, abilities, difficultyRange, mix = true, userContext } = params;

  const prompt = `请生成 ${count} 道脑力训练题目。

【目标能力】${abilities.join("、")}
【难度范围】${difficultyRange[0]} ~ ${difficultyRange[1]}
【混合模式】${mix ? "是，每道题可以侧重不同能力" : "否，都围绕相同能力"}
${userContext ? `【用户背景】${userContext}` : ""}

请输出一个 JSON 数组，每个元素包含：prompt, answer, explanation, suggestedTime, difficulty, abilities, exerciseType, evaluationRubric

确保：
- 题目之间有足够的差异性
- 难度要有变化，覆盖指定范围
- 如果是混合模式，尽量覆盖多种能力`;

  const response = await generateJson<GenerateExerciseResponse[]>({
    system: GENERATOR_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    maxTokens: 4096,
  });

  return response;
}

/**
 * 生成特定类型的练习题
 */
export async function generateTypedExercise(
  exerciseType: ExerciseType,
  difficulty: number,
  userContext?: string
): Promise<GenerateExerciseResponse> {
  const typeConfig = getExerciseTypeConfig(exerciseType);

  return generateExercise({
    targetAbilities: typeConfig.abilities,
    difficulty,
    exerciseType,
    style: typeConfig.defaultStyle,
    userContext,
    timeLimited: typeConfig.timeLimited,
  });
}

/**
 * 获取题型配置
 */
function getExerciseTypeConfig(type: ExerciseType): {
  abilities: AbilityType[];
  defaultStyle: ExerciseStyle;
  timeLimited: boolean;
} {
  const configs: Record<ExerciseType, {
    abilities: AbilityType[];
    defaultStyle: ExerciseStyle;
    timeLimited: boolean;
  }> = {
    number_span: {
      abilities: ["memory"],
      defaultStyle: "abstract",
      timeLimited: true,
    },
    digit_operation: {
      abilities: ["memory", "logic"],
      defaultStyle: "abstract",
      timeLimited: true,
    },
    logic_puzzle: {
      abilities: ["logic"],
      defaultStyle: "real_life",
      timeLimited: false,
    },
    analogy: {
      abilities: ["logic"],
      defaultStyle: "abstract",
      timeLimited: false,
    },
    deduction: {
      abilities: ["logic", "attention"],
      defaultStyle: "real_life",
      timeLimited: false,
    },
    stroop: {
      abilities: ["attention"],
      defaultStyle: "abstract",
      timeLimited: true,
    },
    selective_attention: {
      abilities: ["attention"],
      defaultStyle: "abstract",
      timeLimited: true,
    },
    reading_recall: {
      abilities: ["memory", "attention"],
      defaultStyle: "real_life",
      timeLimited: false,
    },
    expression: {
      abilities: ["expression"],
      defaultStyle: "real_life",
      timeLimited: false,
    },
    explanation: {
      abilities: ["expression", "metacog"],
      defaultStyle: "real_life",
      timeLimited: false,
    },
    metacog_reflection: {
      abilities: ["metacog"],
      defaultStyle: "real_life",
      timeLimited: false,
    },
    creative: {
      abilities: ["expression", "logic"],
      defaultStyle: "playful",
      timeLimited: false,
    },
    general: {
      abilities: ["logic", "expression"],
      defaultStyle: "real_life",
      timeLimited: false,
    },
  };

  return configs[type] || configs.general;
}

/**
 * 获取默认评分标准
 */
function getDefaultRubric(): EvaluationRubric {
  return {
    dimensions: [
      { name: "正确性", description: "答案是否正确", weight: 0.5 },
      { name: "思路", description: "思考过程是否清晰", weight: 0.3 },
      { name: "完整性", description: "回答是否完整", weight: 0.2 },
    ],
    scoringScale: {
      "0": "完全错误或无回答",
      "1": "有尝试但基本错误",
      "2": "部分正确",
      "3": "大部分正确",
      "4": "正确但有小瑕疵",
      "5": "完全正确且清晰",
    },
    typicalMistakes: ["理解偏差", "计算错误", "遗漏条件", "逻辑跳跃"],
  };
}

/**
 * 根据用户表现调整难度生成题目
 */
export async function generateAdaptiveExercise(params: {
  targetAbilities: AbilityType[];
  baseDifficulty: number;
  recentPerformance: {
    averageScore: number;
    consecutiveCorrect: number;
    consecutiveWrong: number;
  };
  userContext?: string;
}): Promise<GenerateExerciseResponse> {
  const { targetAbilities, baseDifficulty, recentPerformance, userContext } = params;

  // 根据表现调整难度
  let adjustedDifficulty = baseDifficulty;

  if (recentPerformance.consecutiveCorrect >= 3) {
    // 连续答对，提高难度
    adjustedDifficulty = Math.min(5, baseDifficulty + 1);
  } else if (recentPerformance.consecutiveWrong >= 2) {
    // 连续答错，降低难度
    adjustedDifficulty = Math.max(1, baseDifficulty - 1);
  } else if (recentPerformance.averageScore >= 85) {
    // 平均分高，可以稍微提高
    adjustedDifficulty = Math.min(5, baseDifficulty + 0.5);
  } else if (recentPerformance.averageScore < 50) {
    // 平均分低，降低难度
    adjustedDifficulty = Math.max(1, baseDifficulty - 0.5);
  }

  return generateExercise({
    targetAbilities,
    difficulty: Math.round(adjustedDifficulty),
    userContext,
  });
}

