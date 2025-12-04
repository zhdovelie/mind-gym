"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Target, Brain, Lightbulb, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AbilityType } from "@/types/workout";

const abilities: {
  id: AbilityType;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    id: "attention",
    name: "专注力",
    description: "提升持续注意力和抗干扰能力",
    icon: Target,
    color: "ability-attention",
  },
  {
    id: "memory",
    name: "记忆力",
    description: "增强工作记忆和信息保持能力",
    icon: Brain,
    color: "ability-memory",
  },
  {
    id: "logic",
    name: "逻辑力",
    description: "强化逻辑推理和问题解决能力",
    icon: Lightbulb,
    color: "ability-logic",
  },
  {
    id: "expression",
    name: "表达力",
    description: "提升语言组织和清晰表达能力",
    icon: MessageSquare,
    color: "ability-expression",
  },
  {
    id: "metacog",
    name: "元认知",
    description: "培养自我监控和学习策略能力",
    icon: Sparkles,
    color: "ability-metacog",
  },
];

export default function FocusWorkoutPage() {
  const router = useRouter();
  const [selectedAbility, setSelectedAbility] = useState<AbilityType | null>(null);

  const handleStart = () => {
    if (selectedAbility) {
      // 可以跳转到带参数的训练页面
      router.push(`/workout/daily?focus=${selectedAbility}`);
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* 顶部 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/workout")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">深度训练</h1>
          <p className="text-foreground-muted">选择你想要重点提升的能力</p>
        </div>
      </div>

      {/* 能力选择 */}
      <div className="grid gap-4">
        {abilities.map((ability) => {
          const Icon = ability.icon;
          const isSelected = selectedAbility === ability.id;
          return (
            <Card
              key={ability.id}
              hover
              className={`cursor-pointer transition-all ${
                isSelected ? "border-primary ring-2 ring-primary/20" : ""
              }`}
              onClick={() => setSelectedAbility(ability.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center`}
                    style={{ backgroundColor: `var(--${ability.color})`, opacity: 0.2 }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: `var(--${ability.color})` }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{ability.name}</h3>
                    <p className="text-sm text-foreground-muted">
                      {ability.description}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 开始按钮 */}
      <Button
        size="lg"
        className="w-full"
        disabled={!selectedAbility}
        onClick={handleStart}
      >
        开始深度训练
      </Button>
    </div>
  );
}

