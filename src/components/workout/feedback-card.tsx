"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, getScoreColor } from "@/lib/utils";

export interface FeedbackCardProps {
  score: number;
  label: string;
  strengths: string;
  improvements: string;
  nextTip: string;
  onContinue: () => void;
  className?: string;
}

export function FeedbackCard({
  score,
  label,
  strengths,
  improvements,
  nextTip,
  onContinue,
  className,
}: FeedbackCardProps) {
  const getScoreIcon = () => {
    if (score >= 90) return <CheckCircle className="w-6 h-6 text-success" />;
    if (score >= 70) return <CheckCircle className="w-6 h-6 text-info" />;
    if (score >= 40) return <AlertCircle className="w-6 h-6 text-warning" />;
    return <XCircle className="w-6 h-6 text-error" />;
  };

  const getProgressVariant = (): "success" | "warning" | "error" | "default" => {
    if (score >= 90) return "success";
    if (score >= 70) return "default";
    if (score >= 40) return "warning";
    return "error";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getScoreIcon()}
              <div>
                <CardTitle className="text-base">{label}</CardTitle>
                <p className={cn("text-2xl font-bold", getScoreColor(score))}>
                  {score} 分
                </p>
              </div>
            </div>
          </div>
          <Progress value={score} variant={getProgressVariant()} className="mt-3" />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 优点 */}
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-success mb-1">做得好的地方</p>
                <p className="text-sm text-foreground">{strengths}</p>
              </div>
            </div>
          </div>

          {/* 改进点 */}
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-warning mb-1">可以改进的地方</p>
                <p className="text-sm text-foreground">{improvements}</p>
              </div>
            </div>
          </div>

          {/* 下次建议 */}
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary mb-1">下次试试</p>
                <p className="text-sm text-foreground">{nextTip}</p>
              </div>
            </div>
          </div>

          {/* 继续按钮 */}
          <Button onClick={onContinue} className="w-full">
            继续训练
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

