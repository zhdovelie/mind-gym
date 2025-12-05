"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat/chat-interface";
import { WorkoutProgress } from "@/components/workout/workout-progress";
import { useWorkoutStore } from "@/stores/workout-store";
import type { ChatMessage } from "@/types/ai";

export default function DailyWorkoutPage() {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    sessionId,
    phase,
    messages,
    isLoading,
    completedTasks,
    startSession,
    addMessage,
    appendMessageContent,
    setLoading,
    setPhase,
    reset,
  } = useWorkoutStore();

  // 初始化会话
  useEffect(() => {
    if (!isInitialized) {
      startSession();
      initializeChat();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // 初始化对话
  const initializeChat = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          context: { currentPhase: "start" },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addMessage({
          role: "assistant",
          content: data.content,
        });
      } else {
        addMessage({
          role: "assistant",
          content: "你好！准备好开始今天的脑力训练了吗？在开始之前，给自己打个精力分数（1-10），你现在大概在哪个区间？",
        });
      }
    } catch (error) {
      console.error("初始化失败:", error);
      addMessage({
        role: "assistant",
        content: "你好！准备好开始今天的脑力训练了吗？在开始之前，给自己打个精力分数（1-10），你现在大概在哪个区间？",
      });
    } finally {
      setLoading(false);
    }
  };

  // 发送消息
  const handleSendMessage = useCallback(
    async (message: string) => {
      // 添加用户消息
      addMessage({
        role: "user",
        content: message,
      });

      setLoading(true);

      const assistantId = addMessage({
        role: "assistant",
        content: "",
      });

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            stream: true,
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context: {
              currentPhase: phase,
              sessionId,
            },
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error("请求失败");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const chunk = JSON.parse(trimmed);
              if (chunk.content) {
                appendMessageContent(assistantId, chunk.content);
              }
              if (chunk.done) {
                if (chunk.suggestedPhase && chunk.suggestedPhase !== phase) {
                  setPhase(chunk.suggestedPhase);
                }
              }
            } catch (err) {
              console.error("解析流式响应失败:", err, trimmed);
            }
          }
        }
      } catch (error) {
        console.error("发送消息失败:", error);
        appendMessageContent(
          assistantId,
          "抱歉，我遇到了一些问题。请稍后再试，或者重新开始训练。"
        );
      } finally {
        setLoading(false);
      }
    },
    [
      messages,
      phase,
      sessionId,
      addMessage,
      appendMessageContent,
      setLoading,
      setPhase,
    ]
  );

  // 退出训练
  const handleExit = () => {
    if (confirm("确定要退出训练吗？当前进度不会保存。")) {
      reset();
      router.push("/workout");
    }
  };

  // 转换消息格式
  const chatMessages: ChatMessage[] = messages.map((m, i) => ({
    id: `msg-${i}`,
    role: m.role as "user" | "assistant",
    content: m.content,
    timestamp: m.timestamp || new Date(),
  }));

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => router.push("/workout")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h1 className="font-semibold">每日训练</h1>
        <Button variant="ghost" size="icon" onClick={handleExit}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 进度条 */}
      <div className="py-4">
        <WorkoutProgress
          currentPhase={phase}
          completedTasks={completedTasks}
          totalTasks={5}
        />
      </div>

      {/* 对话区域 */}
      <div className="flex-1 min-h-0">
        <ChatInterface
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="输入你的回答..."
        />
      </div>
    </div>
  );
}

