"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shuffle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const durations = [
  { value: 5, label: "5 分钟", description: "快速热身" },
  { value: 10, label: "10 分钟", description: "日常训练" },
  { value: 15, label: "15 分钟", description: "标准训练" },
  { value: 20, label: "20 分钟", description: "深度训练" },
];

export default function FreeWorkoutPage() {
  const router = useRouter();
  const [selectedDuration, setSelectedDuration] = useState(10);

  const handleStart = () => {
    router.push(`/workout/daily?mode=free&duration=${selectedDuration}`);
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* 顶部 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/workout")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">自由模式</h1>
          <p className="text-foreground-muted">让 AI 教练为你安排训练</p>
        </div>
      </div>

      {/* 说明 */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shuffle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">AI 智能编排</h3>
              <p className="text-sm text-foreground-muted">
                在自由模式中，AI 教练会根据你的能力画像和近期表现，
                自动为你安排合适的训练内容。你只需要选择训练时长，
                然后跟着教练的节奏走就好了。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 时长选择 */}
      <div>
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          选择训练时长
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {durations.map((duration) => (
            <Card
              key={duration.value}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedDuration === duration.value
                  ? "border-primary ring-2 ring-primary/20"
                  : ""
              }`}
              onClick={() => setSelectedDuration(duration.value)}
            >
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{duration.label}</p>
                <p className="text-sm text-foreground-muted">{duration.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 开始按钮 */}
      <Button size="lg" className="w-full" onClick={handleStart}>
        开始自由训练
      </Button>
    </div>
  );
}

