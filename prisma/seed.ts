import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 预设题目模板
const taskTemplates = [
  {
    name: "数字广度测试",
    description: "记忆并复述一串数字，测试工作记忆容量",
    abilityTags: ["memory"],
    difficultyMin: 1,
    difficultyMax: 5,
    type: "number_span",
    promptTemplate: `请记住以下数字序列，然后按要求复述：

{{numbers}}

{{instruction}}

请直接写出你的答案。`,
    evaluationRubric: {
      dimensions: [
        { name: "准确性", description: "数字是否正确", weight: 0.7 },
        { name: "顺序", description: "顺序是否正确", weight: 0.3 },
      ],
      scoringScale: {
        "0": "完全错误",
        "1": "有少量正确",
        "2": "一半正确",
        "3": "大部分正确",
        "4": "仅有小错误",
        "5": "完全正确",
      },
      typicalMistakes: ["数字遗漏", "顺序颠倒", "数字替换"],
    },
    suggestedTime: 60,
  },
  {
    name: "数字运算",
    description: "在脑中进行多步数学运算",
    abilityTags: ["memory", "logic"],
    difficultyMin: 2,
    difficultyMax: 5,
    type: "digit_operation",
    promptTemplate: `请在脑中完成以下计算，不要使用纸笔或计算器：

{{problem}}

请写出你的答案和简要的计算过程。`,
    evaluationRubric: {
      dimensions: [
        { name: "答案正确性", description: "最终答案是否正确", weight: 0.6 },
        { name: "过程合理性", description: "计算过程是否合理", weight: 0.4 },
      ],
      scoringScale: {
        "0": "答案错误且无过程",
        "1": "答案错误但有部分正确思路",
        "2": "答案接近或过程基本正确",
        "3": "答案正确但过程有误",
        "4": "答案正确且过程基本正确",
        "5": "完全正确",
      },
      typicalMistakes: ["进位错误", "运算顺序错误", "中间步骤遗忘"],
    },
    suggestedTime: 90,
  },
  {
    name: "逻辑谜题",
    description: "通过逻辑推理解决问题",
    abilityTags: ["logic"],
    difficultyMin: 2,
    difficultyMax: 5,
    type: "logic_puzzle",
    promptTemplate: `请仔细阅读以下问题，通过逻辑推理给出答案：

{{puzzle}}

请写出你的推理过程和最终答案。`,
    evaluationRubric: {
      dimensions: [
        { name: "结论正确性", description: "最终结论是否正确", weight: 0.5 },
        { name: "推理完整性", description: "推理链条是否完整", weight: 0.3 },
        { name: "逻辑严密性", description: "推理是否有逻辑漏洞", weight: 0.2 },
      ],
      scoringScale: {
        "0": "完全错误或无推理",
        "1": "有推理尝试但方向错误",
        "2": "部分推理正确",
        "3": "推理基本正确但结论有误",
        "4": "结论正确但推理不够严密",
        "5": "推理完整严密且结论正确",
      },
      typicalMistakes: ["忽略条件", "逻辑跳跃", "假设不当", "遗漏情况"],
    },
    suggestedTime: 180,
  },
  {
    name: "类比推理",
    description: "发现事物之间的相似关系",
    abilityTags: ["logic"],
    difficultyMin: 2,
    difficultyMax: 4,
    type: "analogy",
    promptTemplate: `请找出以下类比关系中缺失的部分：

{{analogy}}

请说明你的推理过程。`,
    evaluationRubric: {
      dimensions: [
        { name: "答案正确性", description: "答案是否正确", weight: 0.6 },
        { name: "关系理解", description: "是否正确理解了类比关系", weight: 0.4 },
      ],
      scoringScale: {
        "0": "答案错误且未理解关系",
        "1": "理解了部分关系但答案错误",
        "2": "理解关系但答案不够准确",
        "3": "答案基本正确",
        "4": "答案正确且解释清晰",
        "5": "答案正确且有深入洞察",
      },
      typicalMistakes: ["表面相似性干扰", "关系理解偏差", "忽略深层结构"],
    },
    suggestedTime: 120,
  },
  {
    name: "Stroop 任务",
    description: "克服干扰做出正确反应",
    abilityTags: ["attention"],
    difficultyMin: 1,
    difficultyMax: 3,
    type: "stroop",
    promptTemplate: `请忽略文字的含义，只关注文字的{{focus}}：

{{items}}

请依次写出每个项目的答案。`,
    evaluationRubric: {
      dimensions: [
        { name: "准确率", description: "正确项目的比例", weight: 0.8 },
        { name: "抗干扰", description: "是否成功抵抗干扰", weight: 0.2 },
      ],
      scoringScale: {
        "0": "全部错误",
        "1": "少数正确",
        "2": "一半正确",
        "3": "大部分正确",
        "4": "仅个别错误",
        "5": "全部正确",
      },
      typicalMistakes: ["被干扰项影响", "规则遗忘", "粗心大意"],
    },
    suggestedTime: 60,
  },
  {
    name: "语言表达",
    description: "清晰准确地表达想法",
    abilityTags: ["expression"],
    difficultyMin: 2,
    difficultyMax: 4,
    type: "expression",
    promptTemplate: `请用简洁清晰的语言完成以下任务：

{{task}}

要求：{{requirements}}`,
    evaluationRubric: {
      dimensions: [
        { name: "清晰度", description: "表达是否清晰易懂", weight: 0.4 },
        { name: "准确性", description: "内容是否准确", weight: 0.3 },
        { name: "结构性", description: "是否有良好的组织结构", weight: 0.3 },
      ],
      scoringScale: {
        "0": "表达混乱难以理解",
        "1": "有表达但不够清晰",
        "2": "基本清晰但有明显不足",
        "3": "表达清晰但结构一般",
        "4": "表达清晰且结构良好",
        "5": "表达精准、清晰、有条理",
      },
      typicalMistakes: ["逻辑跳跃", "用词不当", "结构混乱", "信息遗漏"],
    },
    suggestedTime: 180,
  },
  {
    name: "概念解释",
    description: "用简单的话解释复杂概念",
    abilityTags: ["expression", "metacog"],
    difficultyMin: 2,
    difficultyMax: 5,
    type: "explanation",
    promptTemplate: `请你用{{target_audience}}能理解的方式，解释以下概念：

**{{concept}}**

要求：
- 避免使用专业术语（如必须使用请解释）
- 可以使用比喻或举例
- 控制在{{word_limit}}字以内`,
    evaluationRubric: {
      dimensions: [
        { name: "准确性", description: "概念解释是否准确", weight: 0.4 },
        { name: "易懂性", description: "目标受众是否能理解", weight: 0.4 },
        { name: "简洁性", description: "是否简洁不冗余", weight: 0.2 },
      ],
      scoringScale: {
        "0": "解释错误或无法理解",
        "1": "有尝试但不够准确或清晰",
        "2": "基本准确但不够易懂",
        "3": "准确且较易懂",
        "4": "准确、易懂、有好的类比",
        "5": "解释精准、生动、深入浅出",
      },
      typicalMistakes: ["概念理解偏差", "解释过于专业", "例子不恰当", "过于冗长"],
    },
    suggestedTime: 180,
  },
  {
    name: "元认知反思",
    description: "反思自己的思维过程",
    abilityTags: ["metacog"],
    difficultyMin: 1,
    difficultyMax: 3,
    type: "metacog_reflection",
    promptTemplate: `请回顾你刚才的思考过程，回答以下问题：

{{questions}}

请真诚地反思，不需要给出"完美"的答案。`,
    evaluationRubric: {
      dimensions: [
        { name: "自我觉察", description: "是否真正觉察到自己的思维", weight: 0.5 },
        { name: "深度", description: "反思是否有深度", weight: 0.3 },
        { name: "可行性", description: "改进方向是否可行", weight: 0.2 },
      ],
      scoringScale: {
        "0": "没有实质反思",
        "1": "有反思但流于表面",
        "2": "有一定觉察但不够深入",
        "3": "有较好的自我觉察",
        "4": "反思深入且有改进方向",
        "5": "深刻的自我觉察和可行的改进计划",
      },
      typicalMistakes: ["敷衍应付", "过度自责", "没有具体化", "归因外部"],
    },
    suggestedTime: 120,
  },
];

async function main() {
  console.log("开始填充种子数据...");

  // 创建题目模板
  for (const template of taskTemplates) {
    await prisma.taskTemplate.upsert({
      where: { id: template.type },
      update: template,
      create: {
        id: template.type,
        ...template,
      },
    });
    console.log(`创建/更新模板: ${template.name}`);
  }

  console.log("种子数据填充完成!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

