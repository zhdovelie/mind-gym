import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  generateReflection, 
  guideReflectionDialogue,
  generateLearningPlan,
  generateSelfAssessmentQuestions,
  analyzeMetacognition,
  generateMotivation,
} from "@/lib/ai/langchain/agents";
import type { ReflectionResult } from "@/types/workout";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * 反思引导 API - 使用 LangChain
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const context = {
      userName: session.user.name || "用户",
      userId: session.user.id,
      currentPhase: "reflect" as const,
    };

    const body = await request.json();
    const { action, data } = body as {
      action: "generate" | "dialogue" | "plan" | "questions" | "analyze" | "motivate";
      data: Record<string, unknown>;
    };

    let result;

    switch (action) {
      case "generate":
        // 生成反思总结
        result = await generateReflection({
          context,
          sessionData: data.sessionData as {
            exercises: Array<{
              type: string;
              difficulty: number;
              score: number;
              timeSpent: number;
            }>;
            totalDuration: number;
            averageScore: number;
          },
          previousReflections: data.previousReflections as ReflectionResult[],
        });
        break;

      case "dialogue":
        // 引导反思对话
        result = await guideReflectionDialogue(
          data.userInput as string,
          context,
          (data.history as Array<{ role: string; content: string }>) || []
        );
        break;

      case "plan":
        // 生成学习计划
        result = await generateLearningPlan(
          context,
          data.historicalData as {
            sessionsCompleted: number;
            averageScores: Record<string, number>;
            preferredTimes: string[];
            consistencyRate: number;
          }
        );
        break;

      case "questions":
        // 生成自我评估问题
        result = await generateSelfAssessmentQuestions(
          context,
          data.focus as string
        );
        break;

      case "analyze":
        // 分析元认知水平
        result = await analyzeMetacognition(
          data.reflections as string[],
          context
        );
        break;

      case "motivate":
        // 生成激励信息
        const motivation = await generateMotivation(
          context,
          data.currentStreak as number,
          data.recentAchievements as string[]
        );
        result = { message: motivation };
        break;

      default:
        return NextResponse.json({ error: "未知操作" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("反思引导错误:", error);
    return NextResponse.json(
      { error: "服务暂时不可用，请稍后重试" },
      { status: 500 }
    );
  }
}
