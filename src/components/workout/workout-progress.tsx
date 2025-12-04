"use client";

import { cn } from "@/lib/utils";
import type { WorkoutPhase } from "@/types/workout";

export interface WorkoutProgressProps {
  currentPhase: WorkoutPhase;
  completedTasks: number;
  totalTasks: number;
  className?: string;
}

const PHASES: { key: WorkoutPhase; label: string }[] = [
  { key: "start", label: "开场" },
  { key: "warmup", label: "热身" },
  { key: "main", label: "主训练" },
  { key: "cooldown", label: "冷却" },
  { key: "reflect", label: "反思" },
];

export function WorkoutProgress({
  currentPhase,
  completedTasks,
  totalTasks,
  className,
}: WorkoutProgressProps) {
  const currentIndex = PHASES.findIndex((p) => p.key === currentPhase);

  return (
    <div className={cn("space-y-3", className)}>
      {/* 阶段进度 */}
      <div className="flex items-center justify-between">
        {PHASES.map((phase, index) => (
          <div key={phase.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  index < currentIndex
                    ? "bg-success text-white"
                    : index === currentIndex
                    ? "gradient-primary text-white"
                    : "bg-background-secondary text-foreground-muted"
                )}
              >
                {index < currentIndex ? (
                  <svg
                    className="w-4 h-4"
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
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1",
                  index <= currentIndex ? "text-foreground" : "text-foreground-muted"
                )}
              >
                {phase.label}
              </span>
            </div>
            {index < PHASES.length - 1 && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-1",
                  index < currentIndex ? "bg-success" : "bg-background-secondary"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* 任务进度 */}
      {totalTasks > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-foreground-muted">任务进度：</span>
          <div className="flex-1 h-2 bg-background-secondary rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-300"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            />
          </div>
          <span className="text-foreground">
            {completedTasks}/{totalTasks}
          </span>
        </div>
      )}
    </div>
  );
}

