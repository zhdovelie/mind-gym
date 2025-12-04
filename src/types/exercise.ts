/**
 * 题目/练习相关类型定义
 */

import type { AbilityType } from "./workout";

// 题目类型
export type ExerciseType =
  | "number_span"      // 数字广度（工作记忆）
  | "digit_operation"  // 数字运算（工作记忆）
  | "logic_puzzle"     // 逻辑谜题
  | "analogy"          // 类比推理
  | "deduction"        // 演绎推理
  | "stroop"           // Stroop任务（注意力）
  | "selective_attention" // 选择性注意
  | "reading_recall"   // 阅读回忆
  | "expression"       // 语言表达
  | "explanation"      // 概念解释
  | "metacog_reflection" // 元认知反思
  | "creative"         // 创意思维
  | "general";         // 通用

// 题目风格
export type ExerciseStyle = 
  | "abstract"     // 抽象
  | "real_life"    // 生活情境
  | "playful"      // 轻松有趣
  | "professional" // 职业相关
  | "academic";    // 学术

// 题目模板
export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  abilityTags: AbilityType[];
  difficultyMin: number;
  difficultyMax: number;
  type: ExerciseType;
  promptTemplate: string;
  evaluationRubric: EvaluationRubric;
  suggestedTime?: number; // 秒
  isActive: boolean;
}

// 评分标准
export interface EvaluationRubric {
  dimensions: RubricDimension[];
  scoringScale: ScoringScale;
  typicalMistakes: string[];
}

// 评分维度
export interface RubricDimension {
  name: string;
  description: string;
  weight: number; // 权重 0-1
}

// 评分等级
export interface ScoringScale {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
}

// 生成题目请求
export interface GenerateExerciseRequest {
  targetAbilities: AbilityType[];
  difficulty: number;
  style?: ExerciseStyle;
  exerciseType?: ExerciseType;
  userContext?: string; // 用户背景/兴趣
  timeLimited?: boolean;
}

// 生成题目响应
export interface GenerateExerciseResponse {
  prompt: string;
  answer?: string;
  explanation?: string;
  suggestedTime?: number;
  difficulty: number;
  abilities: AbilityType[];
  exerciseType: ExerciseType;
  evaluationRubric: EvaluationRubric;
}

// 评估请求
export interface EvaluateAnswerRequest {
  prompt: string;
  userAnswer: string;
  referenceAnswer?: string;
  evaluationRubric: EvaluationRubric;
  abilities: AbilityType[];
}

// 评估响应
export interface EvaluateAnswerResponse {
  overallScore: number; // 0-100
  label: "完全正确" | "基本正确" | "部分正确" | "错误";
  dimensionScores: {
    dimensionName: string;
    score: number;
    shortComment: string;
  }[];
  errorTypes: string[];
  feedbackToUser: string;
  strengthsForUser: string;
  improvementsForUser: string;
  nextTimeTipForUser: string;
  nextHint?: string; // 如果用户想再试一次
}

// 预设题目类型配置
export const EXERCISE_TYPE_CONFIG: Record<ExerciseType, {
  name: string;
  description: string;
  defaultAbilities: AbilityType[];
  defaultDifficulty: number;
}> = {
  number_span: {
    name: "数字广度",
    description: "记忆并复述数字序列",
    defaultAbilities: ["memory"],
    defaultDifficulty: 2,
  },
  digit_operation: {
    name: "数字运算",
    description: "在心中进行数字运算",
    defaultAbilities: ["memory", "logic"],
    defaultDifficulty: 3,
  },
  logic_puzzle: {
    name: "逻辑谜题",
    description: "通过推理解决逻辑问题",
    defaultAbilities: ["logic"],
    defaultDifficulty: 3,
  },
  analogy: {
    name: "类比推理",
    description: "发现事物之间的相似关系",
    defaultAbilities: ["logic"],
    defaultDifficulty: 3,
  },
  deduction: {
    name: "演绎推理",
    description: "从已知条件推导结论",
    defaultAbilities: ["logic", "attention"],
    defaultDifficulty: 4,
  },
  stroop: {
    name: "Stroop 任务",
    description: "克服干扰做出正确反应",
    defaultAbilities: ["attention"],
    defaultDifficulty: 2,
  },
  selective_attention: {
    name: "选择性注意",
    description: "在干扰中找出目标信息",
    defaultAbilities: ["attention"],
    defaultDifficulty: 2,
  },
  reading_recall: {
    name: "阅读回忆",
    description: "阅读后回忆关键信息",
    defaultAbilities: ["memory", "attention"],
    defaultDifficulty: 3,
  },
  expression: {
    name: "语言表达",
    description: "清晰准确地表达想法",
    defaultAbilities: ["expression"],
    defaultDifficulty: 3,
  },
  explanation: {
    name: "概念解释",
    description: "用简单的话解释复杂概念",
    defaultAbilities: ["expression", "metacog"],
    defaultDifficulty: 3,
  },
  metacog_reflection: {
    name: "元认知反思",
    description: "反思自己的思维过程",
    defaultAbilities: ["metacog"],
    defaultDifficulty: 2,
  },
  creative: {
    name: "创意思维",
    description: "发散性思考，提出多种可能",
    defaultAbilities: ["expression", "logic"],
    defaultDifficulty: 3,
  },
  general: {
    name: "综合题",
    description: "综合多种能力的练习",
    defaultAbilities: ["logic", "expression"],
    defaultDifficulty: 3,
  },
};

