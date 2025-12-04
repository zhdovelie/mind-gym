import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  runCoachAgent, 
  generateSessionStart,
  streamCoachAgent,
} from "@/lib/ai/langchain/agents";
import type { AgentContext, ChatMessage } from "@/types/ai";
import type { WorkoutPhase } from "@/types/workout";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * AI 对话主入口 - 使用 LangChain
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const {
      message,
      history = [],
      context,
      action,
      stream = false,
    } = body as {
      message?: string;
      history?: ChatMessage[];
      context?: Partial<AgentContext>;
      action?: "start" | "chat" | "end";
      stream?: boolean;
    };

    // 构建完整上下文
    const fullContext: AgentContext = {
      userName: session.user.name || "用户",
      userId: session.user.id,
      currentPhase: (context?.currentPhase as WorkoutPhase) || "start",
      ...context,
    };

    // 流式响应
    if (stream && message) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const streamGenerator = streamCoachAgent(message, fullContext, history);
            for await (const chunk of streamGenerator) {
              const data = JSON.stringify(chunk) + "\n";
              controller.enqueue(encoder.encode(data));
            }
            controller.close();
          } catch (error) {
            console.error("Stream error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    let response;

    // 根据 action 执行不同操作
    if (action === "start") {
      // 开始新会话
      const startMessage = await generateSessionStart(fullContext);
      response = {
        content: startMessage,
        phase: "start",
        metadata: { isStart: true },
      };
    } else if (message) {
      // 正常对话
      const coachResponse = await runCoachAgent(message, fullContext, history);
      response = {
        content: coachResponse.content,
        phase: coachResponse.suggestedPhase || fullContext.currentPhase,
        metadata: {
          shouldGenerateExercise: coachResponse.shouldGenerateExercise,
          shouldReflect: coachResponse.shouldReflect,
        },
      };
    } else {
      return NextResponse.json({ error: "缺少消息内容" }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("AI Chat 错误:", error);
    return NextResponse.json(
      { error: "AI 服务暂时不可用，请稍后重试" },
      { status: 500 }
    );
  }
}
