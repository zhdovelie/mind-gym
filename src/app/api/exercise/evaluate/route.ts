import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  evaluateAnswer, 
  quickEvaluate, 
  comparativeEvaluate,
  multidimensionalEvaluate,
  generateFeedbackReport,
} from "@/lib/ai/langchain/agents";
import type { Exercise, EvaluationResult } from "@/types/exercise";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * 评估用户答案 - 使用 LangChain
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
      action = "evaluate",
      exercise,
      userAnswer,
      timeSpent,
      dimensions,
      evaluations,
    } = body as {
      action?: "evaluate" | "quick" | "compare" | "multidim" | "report";
      exercise?: Exercise;
      userAnswer?: string;
      timeSpent?: number;
      dimensions?: string[];
      evaluations?: EvaluationResult[];
    };

    let result;

    switch (action) {
      case "quick":
        // 快速评估
        if (!exercise || userAnswer === undefined) {
          return NextResponse.json(
            { error: "缺少题目或答案" },
            { status: 400 }
          );
        }
        result = await quickEvaluate(exercise, userAnswer);
        break;

      case "compare":
        // 对比评估
        if (!exercise || userAnswer === undefined || !exercise.solution) {
          return NextResponse.json(
            { error: "缺少题目、答案或参考答案" },
            { status: 400 }
          );
        }
        result = await comparativeEvaluate(exercise, userAnswer, exercise.solution);
        break;

      case "multidim":
        // 多维度评估
        if (!exercise || userAnswer === undefined || !dimensions?.length) {
          return NextResponse.json(
            { error: "缺少题目、答案或评估维度" },
            { status: 400 }
          );
        }
        result = await multidimensionalEvaluate(exercise, userAnswer, dimensions);
        break;

      case "report":
        // 生成反馈报告
        if (!evaluations?.length) {
          return NextResponse.json(
            { error: "缺少评估结果" },
            { status: 400 }
          );
        }
        result = await generateFeedbackReport(evaluations);
        break;

      default:
        // 完整评估
        if (!exercise || userAnswer === undefined) {
          return NextResponse.json(
            { error: "缺少题目或答案" },
            { status: 400 }
          );
        }
        result = await evaluateAnswer({
          exercise,
          userAnswer,
          timeSpent,
          context: {
            userName: session.user.name || "用户",
            userId: session.user.id,
            currentPhase: "main",
          },
        });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("评估错误:", error);
    return NextResponse.json(
      { error: "评估失败，请稍后重试" },
      { status: 500 }
    );
  }
}
