import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/20",
        secondary: "bg-background-secondary text-foreground-muted border border-border",
        success: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        error: "bg-error/10 text-error border border-error/20",
        info: "bg-info/10 text-info border border-info/20",
        outline: "border border-border text-foreground",
        // 能力维度
        attention: "bg-ability-attention/10 text-ability-attention border border-ability-attention/20",
        memory: "bg-ability-memory/10 text-ability-memory border border-ability-memory/20",
        logic: "bg-ability-logic/10 text-ability-logic border border-ability-logic/20",
        expression: "bg-ability-expression/10 text-ability-expression border border-ability-expression/20",
        metacog: "bg-ability-metacog/10 text-ability-metacog border border-ability-metacog/20",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

// 能力徽章
interface AbilityBadgeProps {
  ability: "attention" | "memory" | "logic" | "expression" | "metacog";
  className?: string;
}

const ABILITY_LABELS: Record<string, string> = {
  attention: "专注力",
  memory: "记忆力",
  logic: "逻辑力",
  expression: "表达力",
  metacog: "元认知",
};

function AbilityBadge({ ability, className }: AbilityBadgeProps) {
  return (
    <Badge variant={ability} className={className}>
      {ABILITY_LABELS[ability]}
    </Badge>
  );
}

// 难度徽章
interface DifficultyBadgeProps {
  difficulty: number;
  className?: string;
}

function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const labels = ["", "入门", "简单", "中等", "困难", "挑战"];
  const variants: Record<number, "success" | "info" | "warning" | "error" | "secondary"> = {
    1: "success",
    2: "info",
    3: "warning",
    4: "error",
    5: "error",
  };

  return (
    <Badge variant={variants[difficulty] || "secondary"} className={className}>
      {labels[difficulty] || `难度 ${difficulty}`}
    </Badge>
  );
}

export { Badge, badgeVariants, AbilityBadge, DifficultyBadge };

