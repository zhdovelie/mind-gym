/**
 * AI 服务客户端 - 兼容 OpenAI API 协议
 */

import type { ChatMessage, StreamChunk } from "@/types/ai";

interface AIClientConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
}

interface GenerateTextOptions {
  model?: string;
  system?: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

interface GenerateTextResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 获取配置
function getConfig(): AIClientConfig {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  const defaultModel = process.env.AI_DEFAULT_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("AI_API_KEY 环境变量未设置");
  }

  return { apiKey, baseUrl, defaultModel };
}

/**
 * 生成文本（非流式）
 */
export async function generateText(
  options: GenerateTextOptions
): Promise<GenerateTextResponse> {
  const config = getConfig();
  const model = options.model || config.defaultModel;

  const messages = options.system
    ? [{ role: "system", content: options.system }, ...options.messages]
    : options.messages;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API 错误: ${response.status} - ${error}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0]?.message?.content || "",
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  };
}

/**
 * 生成文本（流式）
 */
export async function* generateTextStream(
  options: GenerateTextOptions
): AsyncGenerator<StreamChunk> {
  const config = getConfig();
  const model = options.model || config.defaultModel;

  const messages = options.system
    ? [{ role: "system", content: options.system }, ...options.messages]
    : options.messages;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    yield { content: "", done: true, error: `AI API 错误: ${response.status} - ${error}` };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield { content: "", done: true, error: "无法读取响应流" };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            yield { content, done: false };
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield { content: "", done: true };
}

/**
 * 构建对话消息数组
 */
export function buildMessages(
  history: ChatMessage[],
  userMessage?: string
): Array<{ role: string; content: string }> {
  const messages = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  if (userMessage) {
    messages.push({ role: "user", content: userMessage });
  }

  return messages;
}

/**
 * 生成 JSON 格式输出
 */
export async function generateJson<T>(
  options: GenerateTextOptions & { schema?: string }
): Promise<T> {
  const systemPrompt = options.system
    ? `${options.system}\n\n请严格按照 JSON 格式输出，不要包含任何其他文字。`
    : "请严格按照 JSON 格式输出，不要包含任何其他文字。";

  const response = await generateText({
    ...options,
    system: systemPrompt,
  });

  // 尝试提取 JSON
  let jsonStr = response.content;
  
  // 处理 markdown 代码块
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  try {
    return JSON.parse(jsonStr.trim()) as T;
  } catch (error) {
    console.error("JSON 解析失败:", jsonStr);
    throw new Error(`无法解析 AI 返回的 JSON: ${error}`);
  }
}

