import Link from "next/link";
import { Dumbbell, Target, BookOpen, Shuffle, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const workoutModes = [
  {
    id: "daily",
    title: "每日训练",
    description: "10-15 分钟的日常脑力锻炼，包含热身、主训练和反思",
    icon: Dumbbell,
    color: "primary",
    time: "10-15 分钟",
    href: "/workout/daily",
    features: ["热身题目", "主训练", "反思总结"],
  },
  {
    id: "focus",
    title: "深度训练",
    description: "针对特定能力进行专项深度训练，提升薄弱环节",
    icon: Target,
    color: "success",
    time: "20-30 分钟",
    href: "/workout/focus",
    features: ["能力选择", "递进难度", "详细反馈"],
  },
  {
    id: "knowledge",
    title: "知识双修",
    description: "学习新知识的同时锻炼脑力，一举两得",
    icon: BookOpen,
    color: "info",
    time: "15-25 分钟",
    href: "/workout/knowledge",
    features: ["知识输入", "理解测试", "迁移应用"],
  },
  {
    id: "free",
    title: "自由模式",
    description: "让 AI 教练根据你的状态自动安排训练",
    icon: Shuffle,
    color: "warning",
    time: "5-20 分钟",
    href: "/workout/free",
    features: ["AI 编排", "随机挑战", "灵活时长"],
  },
];

export default function WorkoutPage() {
  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* 页面标题 */}
      <section>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">选择训练模式</h1>
        <p className="text-foreground-muted">
          根据你的时间和目标，选择合适的训练方式
        </p>
      </section>

      {/* 训练模式列表 */}
      <section className="grid md:grid-cols-2 gap-6">
        {workoutModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Card key={mode.id} hover className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-${mode.color}/10 flex items-center justify-center`}
                    style={{
                      backgroundColor: `var(--${mode.color})`,
                      opacity: 0.1,
                    }}
                  >
                    <Icon className={`w-6 h-6 text-${mode.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-foreground-muted">
                    <Clock className="w-4 h-4" />
                    <span>{mode.time}</span>
                  </div>
                </div>
                <CardTitle className="mt-4">{mode.title}</CardTitle>
                <CardDescription>{mode.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {mode.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-background-secondary rounded-md text-xs text-foreground-muted"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <Link href={mode.href}>
                  <Button className="w-full" variant={mode.id === "daily" ? "gradient" : "default"}>
                    开始训练
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* 提示 */}
      <section className="text-center text-sm text-foreground-muted">
        <p>💡 建议每天进行 10-20 分钟的训练，保持大脑活力</p>
      </section>
    </div>
  );
}

