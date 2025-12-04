/**
 * Exercise Generator Prompt 模板
 */

import type { AbilityType } from "@/types/workout";
import type { ExerciseStyle, ExerciseType } from "@/types/exercise";

/**
 * 题目生成 System Prompt
 */
export const GENERATOR_SYSTEM_PROMPT = `你是一个「脑力训练设计师」。

在生成题目时，要遵守以下原则：

1. 题目必须需要动脑：
   - 避免纯记忆型题目（例如"某个定义的原文是什么？"）。
   - 鼓励解释、推理、估算、举例这种需要加工的信息处理方式。

2. 有情境感：
   - 尽量把题目放在贴近日常生活或工作的小场景里，例如：
     - 「你在和同事讨论一个产品方案……」
     - 「你准备向一个完全外行的朋友解释……」
   - 如果有用户兴趣信息，可以把题目嵌入相关场景。

3. 难度与长度：
   - 保证题干在手机上大约 1 屏即可读完。
   - 难度用 1~5 表示，其中 3 是「有点费劲但可以做出」。

4. 输出要求：
   - 使用 JSON 格式输出
   - 题干必须清晰，信息量适中
   - 不要使用高深冷门知识，重点考察思考过程
   - 题干中不要透露解析或答案`;

/**
 * 构建题目生成 Prompt
 */
export function buildGeneratorPrompt(params: {
  targetAbilities: AbilityType[];
  difficulty: number;
  style?: ExerciseStyle;
  exerciseType?: ExerciseType;
  userContext?: string;
  timeLimited?: boolean;
}): string {
  const { targetAbilities, difficulty, style, exerciseType, userContext, timeLimited } = params;

  const abilityNames: Record<string, string> = {
    attention: "注意力/专注力",
    memory: "记忆力/工作记忆",
    logic: "逻辑推理",
    expression: "语言表达",
    metacog: "元认知/反思",
  };

  const styleNames: Record<string, string> = {
    abstract: "抽象谜题",
    real_life: "真实生活情境",
    playful: "轻松有趣",
    professional: "职业/工作相关",
    academic: "学术/知识型",
  };

  const typeNames: Record<string, string> = {
    number_span: "数字广度测试",
    digit_operation: "数字运算",
    logic_puzzle: "逻辑谜题",
    analogy: "类比推理",
    deduction: "演绎推理",
    stroop: "Stroop 抗干扰任务",
    selective_attention: "选择性注意",
    reading_recall: "阅读回忆",
    expression: "语言表达",
    explanation: "概念解释",
    metacog_reflection: "元认知反思",
    creative: "创意发散",
    general: "综合题",
  };

  const abilities = targetAbilities.map(a => abilityNames[a] || a).join("、");
  const styleName = style ? styleNames[style] : "综合";
  const typeName = exerciseType ? typeNames[exerciseType] : "根据能力自动选择";

  return `请根据以下参数生成一道脑力训练题目：

【目标能力】${abilities}
【难度等级】${difficulty}/5（1=非常简单，3=中等挑战，5=非常难）
【题目风格】${styleName}
【题目类型】${typeName}
${userContext ? `【用户背景】${userContext}` : ""}
【是否限时】${timeLimited ? "是，需要标注建议时间" : "否，不限时"}

请输出一个 JSON 对象，包含以下字段：
{
  "prompt": "给用户展示的题干与说明（不含答案）",
  "answer": "参考答案或答案要点",
  "explanation": "解析说明，用于评估时参考",
  "suggestedTime": 建议作答时间（秒，整数），
  "difficulty": 实际难度（1-5），
  "abilities": ["涉及的能力标签数组"],
  "exerciseType": "题目类型标识",
  "evaluationRubric": {
    "dimensions": [
      {"name": "维度名称", "description": "评分要点", "weight": 权重0-1}
    ],
    "scoringScale": {
      "0": "完全错误的描述",
      "1": "差的描述",
      "2": "一般的描述",
      "3": "较好的描述",
      "4": "很好的描述",
      "5": "完美的描述"
    },
    "typicalMistakes": ["常见错误1", "常见错误2"]
  }
}

注意：
- prompt 字段要完整，用户只看这个字段就能理解题目
- 难度要符合要求，不要过高或过低
- 如果是记忆类题目，prompt 中要包含需要记忆的内容
- 只输出 JSON，不要有其他文字`;
}

/**
 * 不同题型的专用生成模板
 */
export const EXERCISE_TYPE_TEMPLATES: Record<string, string> = {
  number_span: `生成一道【数字广度】测试题：
- 给出一串需要记忆的数字（长度根据难度调整：难度1=4位，难度5=9位）
- 要求用户进行某种操作后复述（如：倒序、每位加2、奇偶分组等）
- 难度越高，操作越复杂`,

  logic_puzzle: `生成一道【逻辑谜题】：
- 创建一个需要多步推理的小情境
- 给出若干条件/线索
- 要求用户推断出结论
- 难度越高，条件越多、推理步骤越复杂`,

  analogy: `生成一道【类比推理】题：
- 格式：A 之于 B，正如 C 之于 ?
- 或：找出以下事物的共同规律
- 难度越高，类比关系越隐晦`,

  expression: `生成一道【语言表达】练习：
- 给出一个需要解释或描述的任务
- 设定目标受众（如：向小学生解释、向外行解释）
- 限定字数或时间
- 评估清晰度、准确性、结构性`,

  explanation: `生成一道【概念解释】练习：
- 给出一个概念（可以是日常概念或用户领域相关）
- 要求用户用简单的话解释给特定受众听
- 可以要求使用比喻或举例
- 评估准确性、易懂性`,

  metacog_reflection: `生成一道【元认知反思】题：
- 不是知识题，而是引导用户反思自己的思维过程
- 例如："回顾你刚才的解题过程，哪一步你花的时间最长？为什么？"
- 重点是培养自我觉察能力`,
};

/**
 * 多道题批量生成 Prompt
 */
export function buildBatchGeneratorPrompt(params: {
  count: number;
  abilities: AbilityType[];
  difficultyRange: [number, number];
  mix?: boolean; // 是否混合不同能力
}): string {
  const { count, abilities, difficultyRange, mix } = params;

  return `请生成 ${count} 道脑力训练题目。

【目标能力】${abilities.join("、")}
【难度范围】${difficultyRange[0]} ~ ${difficultyRange[1]}
【混合模式】${mix ? "是，每道题可以侧重不同能力" : "否，都围绕相同能力"}

请输出一个 JSON 数组，每个元素格式同单题生成。
确保：
- 题目之间有足够的差异性
- 难度要有变化，不要都一样
- 如果是混合模式，尽量覆盖多种能力`;
}

