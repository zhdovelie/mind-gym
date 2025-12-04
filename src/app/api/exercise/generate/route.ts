import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  generateExercise, 
  generateAdaptiveExercise,
  generateWarmupExercise,
  generateChallengeExercise,
  generateFocusedExercise,
  generateThemedExercise,
} from "@/lib/ai/langchain/agents";
import type { AbilityType } from "@/types/workout";
import type { ExerciseType } from "@/types/exercise";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * 生成练习题 - 使用 LangChain
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
      targetAbilities,
      difficulty = 3,
      exerciseType,
      theme,
      mode,
      adaptive,
      recentPerformance,
    } = body as {
      targetAbilities?: AbilityType[];
      difficulty?: number;
      exerciseType?: ExerciseType;
      theme?: string;
      mode?: "warmup" | "challenge" | "focused" | "themed" | "adaptive" | "normal";
      adaptive?: boolean;
      recentPerformance?: {
        averageScore: number;
        weakAreas: string[];
        strongAreas: string[];
      };
    };

    let exercise;
    const context = {
      userName: session.user.name || "用户",
      userId: session.user.id,
      currentPhase: "main" as const,
    };

    // 根据模式选择生成方式
    switch (mode) {
      case "warmup":
        exercise = await generateWarmupExercise(context);
        break;

      case "challenge":
        exercise = await generateChallengeExercise(context);
        break;

      case "focused":
        if (!targetAbilities?.length) {
          return NextResponse.json(
            { error: "专项训练需要指定目标能力" },
            { status: 400 }
          );
        }
        exercise = await generateFocusedExercise(
          targetAbilities[0],
          difficulty,
          context
        );
        break;

      case "themed":
        if (!theme) {
          return NextResponse.json(
            { error: "主题训练需要指定主题" },
            { status: 400 }
          );
        }
        exercise = await generateThemedExercise(theme, {
          difficulty,
          abilities: targetAbilities,
          context,
        });
        break;

      case "adaptive":
        exercise = await generateAdaptiveExercise(context, recentPerformance);
        break;

      default:
        // 普通生成
        exercise = await generateExercise({
          type: exerciseType,
          difficulty,
          abilities: targetAbilities,
          theme,
          context,
        });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("生成题目错误:", error);
    return NextResponse.json(
      { error: "题目生成失败，请稍后重试" },
      { status: 500 }
    );
  }
}
