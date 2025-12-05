import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import type { AbilityType } from "@/types/workout"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

// 能力类型 Badge 颜色映射
const abilityColors: Record<AbilityType, string> = {
  attention: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  memory: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  logic: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  expression: "bg-green-500/10 text-green-500 border-green-500/20",
  metacog: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
}

const abilityLabels: Record<AbilityType, string> = {
  attention: "专注力",
  memory: "记忆力",
  logic: "逻辑",
  expression: "表达",
  metacog: "元认知",
}

function AbilityBadge({
  ability,
  className,
  ...props
}: { ability: AbilityType } & React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
        abilityColors[ability],
        className
      )}
      {...props}
    >
      {abilityLabels[ability]}
    </span>
  )
}

// 难度等级 Badge
const difficultyColors: Record<number, string> = {
  1: "bg-green-500/10 text-green-500 border-green-500/20",
  2: "bg-lime-500/10 text-lime-500 border-lime-500/20",
  3: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  4: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  5: "bg-red-500/10 text-red-500 border-red-500/20",
}

const difficultyLabels: Record<number, string> = {
  1: "入门",
  2: "简单",
  3: "中等",
  4: "困难",
  5: "挑战",
}

function DifficultyBadge({
  difficulty,
  className,
  ...props
}: { difficulty: number } & React.ComponentProps<"span">) {
  const level = Math.max(1, Math.min(5, difficulty))
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
        difficultyColors[level],
        className
      )}
      {...props}
    >
      Lv.{level} {difficultyLabels[level]}
    </span>
  )
}

export { Badge, badgeVariants, AbilityBadge, DifficultyBadge }
