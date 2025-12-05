/**
 * LangChain 客户端配置
 * 基于 @langchain/core@1.1.2 和 @langchain/openai
 */

import { ChatOpenAI } from "@langchain/openai";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import type { ChatMessage } from "@/types/ai";

// 客户端配置
interface LangChainConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
}

// 获取配置（兼容 AI_API_KEY / OPENAI_API_KEY，以及自定义 baseURL）
function getConfig(): LangChainConfig {
  const apiKey =
    process.env.AI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  const baseUrl =
    process.env.AI_BASE_URL?.trim() ||
    process.env.OPENAI_BASE_URL?.trim() ||
    "https://api.openai.com/v1";
  const defaultModel = process.env.AI_DEFAULT_MODEL?.trim() || "gpt-4o-mini";
  const temperature = parseFloat(process.env.AI_TEMPERATURE || "0.7");
  const maxTokens = parseInt(process.env.AI_MAX_TOKENS || "2048");

  if (!apiKey) {
    throw new Error("AI_API_KEY 或 OPENAI_API_KEY 环境变量未设置");
  }

  return { apiKey, baseUrl, defaultModel, temperature, maxTokens };
}

// 创建 Chat Model 实例
export function createChatModel(options?: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}) {
  const config = getConfig();

  return new ChatOpenAI({
    apiKey: config.apiKey,
    configuration: {
      baseURL: config.baseUrl,
    },
    modelName: options?.model || config.defaultModel,
    temperature: options?.temperature ?? config.temperature,
    maxTokens: options?.maxTokens ?? config.maxTokens,
    streaming: options?.streaming ?? false,
  });
}

// 转换聊天历史为 LangChain 消息格式
export function convertToLangChainMessages(
  history: ChatMessage[]
): BaseMessage[] {
  return history.map((msg) => {
    switch (msg.role) {
      case "system":
        return new SystemMessage(msg.content);
      case "user":
        return new HumanMessage(msg.content);
      case "assistant":
        return new AIMessage(msg.content);
      default:
        return new HumanMessage(msg.content);
    }
  });
}

// 创建带系统提示的 Prompt 模板
export function createChatPromptTemplate(systemPrompt: string) {
  return ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]);
}

// 简单的文本生成
export async function generateWithLangChain(options: {
  systemPrompt: string;
  userMessage: string;
  history?: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const chatModel = createChatModel({
    model: options.model,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  });

  const messages: BaseMessage[] = [new SystemMessage(options.systemPrompt)];

  if (options.history) {
    messages.push(...convertToLangChainMessages(options.history));
  }

  messages.push(new HumanMessage(options.userMessage));

  const response = await chatModel.invoke(messages);
  return response.content as string;
}

// 流式文本生成
export async function* streamWithLangChain(options: {
  systemPrompt: string;
  userMessage: string;
  history?: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): AsyncGenerator<string> {
  const chatModel = createChatModel({
    model: options.model,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    streaming: true,
  });

  const messages: BaseMessage[] = [new SystemMessage(options.systemPrompt)];

  if (options.history) {
    messages.push(...convertToLangChainMessages(options.history));
  }

  messages.push(new HumanMessage(options.userMessage));

  const stream = await chatModel.stream(messages);

  for await (const chunk of stream) {
    if (chunk.content) {
      yield chunk.content as string;
    }
  }
}

// JSON 格式输出生成
export async function generateJsonWithLangChain<T>(options: {
  systemPrompt: string;
  userMessage: string;
  history?: ChatMessage[];
  model?: string;
  temperature?: number;
}): Promise<T> {
  const enhancedSystemPrompt = `${options.systemPrompt}

请严格按照 JSON 格式输出，不要包含任何其他文字。`;

  const response = await generateWithLangChain({
    ...options,
    systemPrompt: enhancedSystemPrompt,
    temperature: options.temperature ?? 0.3, // JSON 输出用较低温度
  });

  // 尝试提取 JSON
  let jsonStr = response;

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

export {
  SystemMessage,
  HumanMessage,
  AIMessage,
  ChatPromptTemplate,
  MessagesPlaceholder,
};

