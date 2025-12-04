/**
 * Coach Agent Prompt 模板
 */

import type { AgentContext } from "@/types/ai";
import { COACH_SYSTEM_PROMPT, COACH_BEHAVIOR_PROMPT } from "./system";

/**
 * 构建 Coach 完整 System Prompt
 */
export function buildCoachSystemPrompt(context: AgentContext): string {
  const contextSection = buildContextSection(context);
  const phaseSection = buildPhaseGuidance(context.currentPhase);

  return `${COACH_SYSTEM_PROMPT}

${COACH_BEHAVIOR_PROMPT}

---
【当前上下文】
${contextSection}

---
【当前阶段指导】
${phaseSection}`;
}

/**
 * 构建用户上下文部分
 */
function buildContextSection(context: AgentContext): string {
  const parts: string[] = [];

  parts.push(`- 用户名：${context.userName || "用户"}`);

  if (context.energyLevel !== undefined) {
    parts.push(`- 精力状态：${context.energyLevel}/10`);
  }

  if (context.userGoal) {
    parts.push(`- 本次目标：${context.userGoal}`);
  }

  if (context.lastSessionSummary) {
    parts.push(`- 上次训练简要：${context.lastSessionSummary}`);
  }

  if (context.cognitiveProfile) {
    const { attention, memory, logic, expression, metacog } = context.cognitiveProfile;
    parts.push(`- 能力画像：专注力${attention} | 记忆力${memory} | 逻辑力${logic} | 表达力${expression} | 元认知${metacog}`);
  }

  if (context.recentPerformance) {
    const { averageScore, consecutiveCorrect, consecutiveWrong } = context.recentPerformance;
    parts.push(`- 近期表现：平均分${averageScore}分`);
    if (consecutiveCorrect >= 3) {
      parts.push(`  * 连续答对${consecutiveCorrect}题，考虑提高难度`);
    }
    if (consecutiveWrong >= 3) {
      parts.push(`  * 连续答错${consecutiveWrong}题，考虑降低难度或换题型`);
    }
  }

  return parts.join("\n");
}

/**
 * 构建阶段指导
 */
function buildPhaseGuidance(phase: string): string {
  const guidance: Record<string, string> = {
    start: `现在是【开场阶段】：
- 简短问候用户，可以回顾上次训练的一个亮点
- 询问用户当前精力状态（1-10分）
- 提供 2-3 个训练方向选项让用户选择
- 示例："嗨！上次我们练了逻辑推理，你在类比题上做得挺好。在开始之前，给自己打个精力分数（1-10），你现在大概在哪个区间？"`,

    warmup: `现在是【热身阶段】：
- 出 1-2 道简单的热身题
- 题目要简短，让用户快速进入状态
- 给予即时正向反馈
- 示例："好的，先来个简单的热身。请记住这串数字：7, 3, 9, 2。等下我会问你相关问题。"`,

    main: `现在是【主训练阶段】：
- 根据用户选择的方向出题
- 难度要有挑战性但不至于挫败
- 每道题后给具体反馈：先肯定 → 再指出改进点 → 给具体建议
- 如果用户卡住，按「小提示 → 大提示 → 部分答案」的顺序引导`,

    cooldown: `现在是【冷却阶段】：
- 出 1 道相对轻松的题目
- 或者做一个简短的知识点回顾
- 为反思阶段做准备
- 语气可以更放松`,

    reflect: `现在是【反思阶段】：
- 先用 1-2 句话总结本次训练表现
- 提出 1-2 个开放式反思问题：
  * "今天哪道题让你觉得最有挑战？为什么？"
  * "你用到了什么策略？哪些是有效的？"
  * "如果明天再做类似的题，你会怎么准备？"
- 认真倾听用户的回答，给予认可`,

    complete: `现在是【完成阶段】：
- 总结本次训练的收获
- 指出一个值得记住的进步点
- 给出下次训练的小期待
- 示例："今天练了工作记忆和逻辑推理，你在数字操作题上比开始时更稳了。下次我们可以试试更长的序列，期待！"`,
  };

  return guidance[phase] || guidance.start;
}

/**
 * 开场对话模板
 */
export const SESSION_START_TEMPLATE = `你现在要开启一次新的训练 session，请用下面的结构与用户对话：

1. 简短问候（1 句）+ 回顾上一轮训练的一个小亮点（如果有的话）。
2. 询问用户当前精力状态（1~10），并让用户简单描述一下此刻的感觉。
3. 给出 2~3 个可选训练方向，请用户选择其一。

输出格式示例：
---
嗨 {用户名}，上次我们练到 XXX，当时你在 YYY 上做得挺好。

在开始之前，先给自己打个精力分数（1~10），你现在大概在哪个区间？

今天你更想练哪个方向：
A. 轻量的记忆+注意热身
B. 稍微烧脑的逻辑推理
C. 跟你最近在学的内容相关的训练

直接回复字母就行，比如：B
---`;

/**
 * 出题引导模板
 */
export const PRESENT_EXERCISE_TEMPLATE = `你将把下一道题展示给用户，请遵守以下结构：

1. 用 1 句话说明这道题的训练目标（例如：这是在练你的工作记忆）。
2. 给出题干。
3. 如果有时间建议，简要说明（例如：建议你在 60 秒内完成，但不用太紧张）。
4. 用一句问题结束，例如："想好之后直接打字告诉我你的答案和思路。"

示例：
---
接下来这道题主要是在练你的【逻辑推理】，难度大概是 3/5。

{题目内容}

不用太纠结完美答案，重点是把你的思考过程写出来。准备好了就直接回复你的想法。
---`;

/**
 * 反馈转述模板
 */
export const FEEDBACK_TEMPLATE = `你将根据评估结果，给用户一个友好的反馈。

反馈规则：
1. 用 1 句话给出整体印象（不要直接说分数）。
2. 用 1~2 句话转述优点。
3. 用 1~2 句话转述可以改进的地方。
4. 用 1 句话给出下一次可以尝试的具体做法。
5. 最后问一句简短问题，引导用户回应或继续下一题。

输出示例：
---
这次你的整体思路是有方向的，不过还有一点空间可以打磨。

我觉得比较好的地方在于：{优点}
比较可惜的是：{改进点}

下次遇到类似问题时，可以尝试：{具体建议}

你觉得这个反馈贴不贴切？要不要我用一个更具体的例子再讲一遍？
---`;

/**
 * Session 收尾模板
 */
export const SESSION_END_TEMPLATE = `你要结束本次训练 session，请按照以下结构给用户一个收尾：

1. 用 1~2 句话总结今天做了哪些类型的训练（能力维度）。
2. 用 1 句话指出一个「最值得被记住的小进步」。
3. 用 1 句话指出一个「下次可以重点突破的点」。
4. 提出 1~2 个开放式问题，让用户自己反思。
5. 如果用户训练时间较短或状态不佳，用 1 句话温和地表示理解，而不是责备。

输出示例：
---
我们今天主要练了【工作记忆】和【逻辑推理】，你在 XXX 这题上的表现，说明你的 YYY 能力比上次更稳了。

我尤其想表扬你的一点是：{具体进步}
下次如果想再往前走一步，我会建议我们重点攻克：{一个薄弱点}

在结束之前，你可以想想：
- 今天哪一道题让你觉得最'卡'，原因是什么？
- 如果明天只用 5 分钟复习今天的内容，你会选哪一道题再做一次？

随便选一个问题回我 1~2 句就行，我们下次可以基于你的反思设计训练。
---`;

