"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Target, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AbilityBadge, DifficultyBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AbilityType } from "@/types/workout";

export interface ExerciseCardProps {
  prompt: string;
  difficulty: number;
  abilities: AbilityType[];
  suggestedTime?: number;
  onAnswer: (answer: string) => void;
  onHint?: () => void;
  className?: string;
}

export function ExerciseCard({
  prompt,
  difficulty,
  abilities,
  suggestedTime,
  onAnswer,
  onHint,
  className,
}: ExerciseCardProps) {
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(suggestedTime || 0);
  const [isTimerActive, setIsTimerActive] = useState(!!suggestedTime);

  // 计时器
  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      onAnswer(answer.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">训练题目</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <DifficultyBadge difficulty={difficulty} />
              {abilities.map((ability) => (
                <AbilityBadge key={ability} ability={ability} />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 计时器 */}
          {suggestedTime && (
            <div
              className={cn(
                "flex items-center gap-2 text-sm",
                timeLeft < 30 ? "text-warning" : "text-foreground-muted"
              )}
            >
              <Clock className="w-4 h-4" />
              <span>剩余时间：{formatTime(timeLeft)}</span>
            </div>
          )}

          {/* 题目内容 */}
          <div className="p-4 bg-background-secondary rounded-lg">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {prompt}
            </p>
          </div>

          {/* 答案输入 */}
          <div className="space-y-3">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="在这里输入你的答案和思考过程..."
              rows={4}
              className={cn(
                "w-full resize-none rounded-lg bg-background-secondary border border-border",
                "px-4 py-3 text-sm",
                "focus:border-primary focus:ring-1 focus:ring-primary outline-none",
                "placeholder:text-foreground-muted/60"
              )}
            />

            <div className="flex items-center justify-between">
              {onHint && (
                <Button variant="ghost" size="sm" onClick={onHint}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  需要提示
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="ml-auto"
              >
                提交答案
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

