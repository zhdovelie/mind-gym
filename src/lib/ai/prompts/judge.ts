/**
 * Assessment/Judge Agent Prompt 模板
 */

import type { EvaluationRubric } from "@/types/exercise";

/**
 * 评分 Agent System Prompt
 */
export const JUDGE_SYSTEM_PROMPT = `你是一个「脑力训练裁判」，也是一个注重成长的反馈教练。

你的任务不是给用户贴上"好/坏"的标签，而是：
- 帮用户看清这次作答的优点和可以改进的地方；
- 给出具体、可执行的改进建议。

评分规则：
1. 你需要给出一个 0~100 的分数，用于内部记录和可视化展示。
2. 同时给出一个标签：完全正确 / 基本正确 / 部分正确 / 错误。
3. 分数可以略微宽松，但评价要诚实。

反馈原则（Growth Mindset）：
1. 先用 1~2 句话，肯定这次作答中最有价值的部分。
2. 再指出 1~2 个最关键的改进点，避免长篇大论。
3. 给出一个「下次可以尝试的具体做法」。
4. 最后用一句话强调：这次表现只是当下状态，并不代表能力上限。

禁止：
- 不要用"你总是""你根本不懂"这类否定性的措辞。
- 不要嘲讽或贬低用户。
- 不要在 feedback 中直接写出完整答案。`;

/**
 * 构建评估 Prompt
 */
export function buildEvaluationPrompt(params: {
  prompt: string;
  userAnswer: string;
  referenceAnswer?: string;
  evaluationRubric: EvaluationRubric;
  abilities: string[];
}): string {
  const { prompt, userAnswer, referenceAnswer, evaluationRubric, abilities } = params;

  const rubricText = formatRubric(evaluationRubric);

  return `请评估用户对以下脑力训练题的作答。

【题目】
${prompt}

【用户作答】
${userAnswer}

${referenceAnswer ? `【参考答案】\n${referenceAnswer}\n` : ""}

【评分标准】
${rubricText}

【涉及能力】${abilities.join("、")}

请输出一个 JSON 对象：
{
  "overallScore": 0-100的总分,
  "label": "完全正确" | "基本正确" | "部分正确" | "错误",
  "dimensionScores": [
    {
      "dimensionName": "维度名称",
      "score": 0-5,
      "shortComment": "简短评语"
    }
  ],
  "errorTypes": ["从 typicalMistakes 中选出适用的条目"],
  "strengthsForUser": "用 1~2 句话肯定优点",
  "improvementsForUser": "用 1~2 句话指出最关键的改进点",
  "nextTimeTipForUser": "下次可以尝试的具体做法",
  "feedbackToUser": "综合反馈（3~5 句，给用户看的完整反馈）",
  "nextHint": "如果用户想再试一次，可以给的小提示（不要直接给答案）"
}

评分指南：
- 90-100：完全正确，思路清晰，表达精准
- 70-89：基本正确，有小瑕疵但核心理解到位
- 40-69：部分正确，有正确的思路但不完整或有明显错误
- 0-39：错误，未能理解题意或答案完全偏离

注意：
- 评分要客观但友善
- 反馈要具体，避免空泛
- 不要泄露完整答案`;
}

/**
 * 格式化评分标准
 */
function formatRubric(rubric: EvaluationRubric): string {
  const parts: string[] = [];

  if (rubric.dimensions?.length) {
    parts.push("评分维度：");
    rubric.dimensions.forEach((dim, i) => {
      parts.push(`${i + 1}. ${dim.name}（权重${Math.round(dim.weight * 100)}%）：${dim.description}`);
    });
  }

  if (rubric.scoringScale) {
    parts.push("\n分数等级：");
    Object.entries(rubric.scoringScale).forEach(([score, desc]) => {
      parts.push(`- ${score}分：${desc}`);
    });
  }

  if (rubric.typicalMistakes?.length) {
    parts.push("\n常见错误：");
    rubric.typicalMistakes.forEach((mistake) => {
      parts.push(`- ${mistake}`);
    });
  }

  return parts.join("\n");
}

/**
 * 简化评估（用于客观题）
 */
export function buildSimpleEvaluationPrompt(params: {
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
}): string {
  const { prompt, userAnswer, correctAnswer } = params;

  return `请评估用户答案是否正确。

【题目】${prompt}
【正确答案】${correctAnswer}
【用户答案】${userAnswer}

请判断用户答案是否正确，并输出 JSON：
{
  "isCorrect": true/false,
  "overallScore": 0-100,
  "label": "完全正确" | "基本正确" | "部分正确" | "错误",
  "briefFeedback": "一句话反馈"
}

评分标准：
- 完全正确 = 100分
- 基本正确（有小笔误）= 80分
- 部分正确（部分对）= 50分
- 错误 = 0分`;
}

/**
 * 开放式回答评估模板
 */
export const OPEN_ANSWER_EVALUATION_TEMPLATE = `你将评估一个开放式问题的回答。

开放式问题没有唯一标准答案，评估重点是：
1. 思考的深度和广度
2. 逻辑的连贯性
3. 表达的清晰度
4. 是否有独特的见解

评分时要更宽容，重点是鼓励思考和表达。`;

