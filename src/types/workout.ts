/**
 * 训练相关类型定义
 */

// 训练模式
export type WorkoutMode = "DAILY" | "FOCUS" | "KNOWLEDGE" | "FREE" | "ASSESSMENT";

// 训练阶段
export type WorkoutPhase = "start" | "warmup" | "main" | "cooldown" | "reflect" | "complete";

// 能力维度
export type AbilityType = "attention" | "memory" | "logic" | "expression" | "metacog";

// 认知能力画像
export interface CognitiveProfile {
  attention: number;  // 0-100
  memory: number;
  logic: number;
  expression: number;
  metacog: number;
  history?: ProfileHistoryItem[];
  lastAssessedAt?: Date;
}

// 画像历史记录项
export interface ProfileHistoryItem {
  date: string;
  attention: number;
  memory: number;
  logic: number;
  expression: number;
  metacog: number;
}

// 训练计划
export interface WorkoutPlan {
  steps: WorkoutStep[];
  totalMinutes: number;
  targetAbilities: AbilityType[];
}

// 训练步骤
export interface WorkoutStep {
  stepId: string;
  title: string;
  targetAbilities: AbilityType[];
  mode: "warmup" | "main" | "cooldown";
  estimatedMinutes: number;
  exerciseType: string;
  difficulty: number; // 1-5
  briefDescription: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
}

// 训练会话
export interface WorkoutSession {
  id: string;
  userId: string;
  mode: WorkoutMode;
  plan: WorkoutPlan;
  userMood?: number;
  userGoal?: string;
  duration?: number;
  summary?: SessionSummary;
  startedAt: Date;
  completedAt?: Date;
  tasks: TaskInstance[];
  reflection?: Reflection;
}

// 会话总结
export interface SessionSummary {
  totalTasks: number;
  completedTasks: number;
  averageScore: number;
  totalTimeMinutes: number;
  abilitiesWorked: AbilityType[];
  highlights: string[];
  improvements: string[];
  aiSummary: string;
}

// 反思记录
export interface Reflection {
  id: string;
  sessionId: string;
  userText?: string;
  aiSummary?: string;
  data?: ReflectionData;
  createdAt: Date;
}

// 反思数据
export interface ReflectionData {
  hardestTask?: string;
  bestStrategy?: string;
  nextImprovement?: string;
  emotionalState?: string;
}

// SRL反思结果
export interface ReflectionResult {
  summary: string;
  highlights: string[];
  challenges: string[];
  cognitiveInsights: string;
  recommendations: string[];
  nextSteps: string;
  metacognitivePrompts?: string[];
  createdAt?: Date;
}

// 题目实例
export interface TaskInstance {
  id: string;
  sessionId: string;
  templateId?: string;
  prompt: string;
  answer?: string;
  explanation?: string;
  difficulty: number;
  abilities: AbilityType[];
  userAnswer?: string;
  score?: number;
  scoreLabel?: string;
  feedback?: TaskFeedback;
  startedAt: Date;
  answeredAt?: Date;
  timeSpent?: number;
}

// 题目反馈
export interface TaskFeedback {
  overallScore: number;
  dimensionScores?: DimensionScore[];
  errorTypes?: string[];
  strengths: string;
  improvements: string;
  nextTimeTip: string;
}

// 维度评分
export interface DimensionScore {
  dimensionName: string;
  score: number;
  shortComment: string;
}

// 用户训练偏好
export interface UserPreferences {
  preferredDuration?: number; // 偏好训练时长（分钟）
  preferredAbilities?: AbilityType[];
  preferredDifficulty?: number;
  preferredStyle?: "serious" | "playful" | "balanced";
  notifications?: boolean;
  dailyReminder?: string; // HH:mm 格式
}

// 训练统计
export interface WorkoutStats {
  totalSessions: number;
  totalMinutes: number;
  totalTasks: number;
  averageScore: number;
  streakDays: number;
  longestStreak: number;
  lastWorkoutAt?: Date;
  weeklyStats: WeeklyStats[];
  abilityProgress: AbilityProgress[];
}

// 周统计
export interface WeeklyStats {
  weekStart: string;
  sessions: number;
  minutes: number;
  averageScore: number;
}

// 能力进步
export interface AbilityProgress {
  ability: AbilityType;
  currentScore: number;
  previousScore: number;
  change: number;
  trend: "up" | "down" | "stable";
}

