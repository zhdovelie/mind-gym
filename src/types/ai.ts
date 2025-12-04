/**
 * AI 相关类型定义
 */

import type { AbilityType, WorkoutPhase, WorkoutPlan, CognitiveProfile } from "./workout";

// 消息角色
export type MessageRole = "user" | "assistant" | "system";

// 聊天消息
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

// 消息元数据
export interface MessageMetadata {
  agentType?: AgentType;
  phase?: WorkoutPhase;
  exerciseId?: string;
  isExercise?: boolean;
  isChoice?: boolean;
  choices?: ChoiceOption[];
  feedback?: boolean;
}

// 选项
export interface ChoiceOption {
  id: string;
  label: string;
  description?: string;
}

// Agent 类型
export type AgentType = "coach" | "generator" | "judge" | "srl" | "orchestrator";

// Agent 上下文
export interface AgentContext {
  userName: string;
  userId: string;
  energyLevel?: number;
  userGoal?: string;
  currentPhase: WorkoutPhase;
  sessionId?: string;
  cognitiveProfile?: CognitiveProfile;
  lastSessionSummary?: string;
  recentPerformance?: RecentPerformance;
  preferences?: UserAgentPreferences;
}

// 最近表现
export interface RecentPerformance {
  averageScore: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  tasksCompleted: number;
  currentDifficulty: number;
}

// 用户对 Agent 的偏好
export interface UserAgentPreferences {
  communicationStyle: "formal" | "casual" | "encouraging";
  feedbackDetail: "brief" | "detailed";
  hintPreference: "minimal" | "moderate" | "generous";
}

// AI 请求基础
export interface AIRequestBase {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Chat 请求
export interface ChatRequest extends AIRequestBase {
  messages: ChatMessage[];
  systemPrompt?: string;
  context?: AgentContext;
}

// Chat 响应
export interface ChatResponse {
  content: string;
  role: "assistant";
  metadata?: MessageMetadata;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 训练计划生成请求
export interface PlanGenerationRequest {
  userName: string;
  userMood?: number;
  availableMinutes: number;
  userGoal?: string;
  cognitiveProfile?: CognitiveProfile;
  recentStats?: {
    lastTrainingDaysAgo: number;
    averageMinutesPerDay: number;
    weakAbilities: AbilityType[];
    strongAbilities: AbilityType[];
  };
  preferences?: {
    preferredAbilities?: AbilityType[];
    preferredDifficulty?: number;
  };
}

// 训练计划生成响应
export interface PlanGenerationResponse {
  plan: WorkoutPlan;
  greeting: string;
  explanation: string;
}

// 反思引导请求
export interface ReflectionRequest {
  sessionSummary: {
    totalTasks: number;
    completedTasks: number;
    averageScore: number;
    totalTimeMinutes: number;
    abilitiesWorked: AbilityType[];
    taskHighlights: {
      taskId: string;
      type: string;
      score: number;
      wasChallenge: boolean;
    }[];
  };
  consecutiveDaysLow?: boolean;
  performanceDecline?: boolean;
}

// 反思引导响应
export interface ReflectionResponse {
  overallComment: string;
  reflectionQuestions: string[];
  encouragement?: string;
}

// 流式响应块
export interface StreamChunk {
  content: string;
  done: boolean;
  error?: string;
}

// AI 服务配置
export interface AIServiceConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  timeout?: number;
  maxRetries?: number;
}

// 模型配置
export interface ModelConfig {
  name: string;
  maxTokens: number;
  contextWindow: number;
  costPer1kTokens: number;
}

// 预设模型列表
export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    name: "gpt-4o-mini",
    maxTokens: 16384,
    contextWindow: 128000,
    costPer1kTokens: 0.00015,
  },
  {
    name: "gpt-4o",
    maxTokens: 16384,
    contextWindow: 128000,
    costPer1kTokens: 0.005,
  },
  {
    name: "gpt-3.5-turbo",
    maxTokens: 4096,
    contextWindow: 16385,
    costPer1kTokens: 0.0005,
  },
];

