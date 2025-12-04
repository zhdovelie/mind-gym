"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Clock, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssessmentPage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);

  const assessmentSteps = [
    { name: "注意力测试", description: "测试你的专注和抗干扰能力", time: "5 分钟" },
    { name: "记忆力测试", description: "测试你的工作记忆容量", time: "5 分钟" },
    { name: "逻辑推理测试", description: "测试你的逻辑思维能力", time: "8 分钟" },
    { name: "语言表达测试", description: "测试你的表达和组织能力", time: "5 分钟" },
    { name: "元认知问卷", description: "了解你的学习习惯和自我认知", time: "3 分钟" },
  ];

  const handleStart = () => {
    // 开始评估，跳转到训练页面
    router.push("/workout/daily?mode=assessment");
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0 max-w-2xl mx-auto">
      {/* 标题 */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">脑力评估</h1>
        <p className="text-foreground-muted">
          全面了解你的认知能力，获得个性化的训练建议
        </p>
      </div>

      {/* 说明卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>评估说明</CardTitle>
          <CardDescription>
            这是一个全面的认知能力评估，将测试你在五个维度的表现
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">预计用时：20-30 分钟</p>
              <p className="text-sm text-foreground-muted">
                建议在安静的环境中完成，中途可以休息
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {assessmentSteps.map((step, index) => (
              <div
                key={step.name}
                className="flex items-center gap-3 p-3 border border-border rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-background-secondary flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{step.name}</p>
                  <p className="text-sm text-foreground-muted">{step.description}</p>
                </div>
                <span className="text-sm text-foreground-muted">{step.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 注意事项 */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">开始前请注意</h3>
          <ul className="space-y-2">
            {[
              "找一个安静、不被打扰的环境",
              "确保你精神状态良好，不要在疲劳时测试",
              "认真作答，结果将用于个性化你的训练",
              "这不是考试，没有及格线，放轻松就好",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 开始按钮 */}
      <Button size="lg" variant="gradient" className="w-full" onClick={handleStart}>
        开始评估
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <p className="text-center text-sm text-foreground-muted">
        评估结果仅用于个性化你的训练体验，不代表任何医学诊断
      </p>
    </div>
  );
}

