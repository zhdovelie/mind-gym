import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

/**
 * 格式化时间
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 格式化持续时间（分钟）
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
}

/**
 * 延迟函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * 截断文本
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

/**
 * 能力维度名称映射
 */
export const ABILITY_NAMES: Record<string, string> = {
  attention: "专注力",
  memory: "记忆力",
  logic: "逻辑力",
  expression: "表达力",
  metacog: "元认知",
};

/**
 * 能力维度颜色映射
 */
export const ABILITY_COLORS: Record<string, string> = {
  attention: "#f472b6",
  memory: "#60a5fa",
  logic: "#a78bfa",
  expression: "#34d399",
  metacog: "#fbbf24",
};

/**
 * 训练模式名称映射
 */
export const WORKOUT_MODE_NAMES: Record<string, string> = {
  DAILY: "每日训练",
  FOCUS: "深度训练",
  KNOWLEDGE: "知识双修",
  FREE: "自由模式",
  ASSESSMENT: "脑力评估",
};

/**
 * 分数等级标签
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return "完全正确";
  if (score >= 70) return "基本正确";
  if (score >= 40) return "部分正确";
  return "错误";
}

/**
 * 分数颜色
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return "text-success";
  if (score >= 70) return "text-info";
  if (score >= 40) return "text-warning";
  return "text-error";
}

/**
 * 难度等级描述
 */
export function getDifficultyLabel(difficulty: number): string {
  const labels = ["", "入门", "简单", "中等", "困难", "挑战"];
  return labels[difficulty] || "未知";
}

/**
 * 获取相对时间描述
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return formatDate(d);
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

