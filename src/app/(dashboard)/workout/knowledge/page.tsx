"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Upload, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function KnowledgeWorkoutPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");

  const handleStart = () => {
    if (topic.trim()) {
      router.push(`/workout/daily?mode=knowledge&topic=${encodeURIComponent(topic)}`);
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
          <h1 className="text-2xl font-bold">知识双修</h1>
          <p className="text-foreground-muted">学习知识的同时锻炼脑力</p>
        </div>
      </div>

      {/* 说明 */}
      <Card className="border-success/20 bg-success/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">边学边练</h3>
              <p className="text-sm text-foreground-muted">
                输入你想学习的主题或内容，AI 教练会围绕这个主题生成训练题目，
                帮助你在理解和记忆知识的同时，锻炼相关的认知能力。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 输入主题 */}
      <Card>
        <CardHeader>
          <CardTitle>输入学习主题</CardTitle>
          <CardDescription>
            可以是概念、技能、或任何你想学习的内容
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：机器学习基础、投资理财、心理学概念..."
            className="h-12"
          />
          
          {/* 快速选择 */}
          <div>
            <p className="text-sm text-foreground-muted mb-2">热门主题：</p>
            <div className="flex flex-wrap gap-2">
              {["编程基础", "经济学原理", "心理学入门", "历史知识", "科学常识"].map((t) => (
                <Button
                  key={t}
                  variant="outline"
                  size="sm"
                  onClick={() => setTopic(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 未来功能预告 */}
      <div className="grid md:grid-cols-2 gap-4 opacity-50">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Upload className="w-5 h-5 text-foreground-muted" />
            <div>
              <p className="text-sm font-medium">上传文档</p>
              <p className="text-xs text-foreground-muted">即将推出</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <LinkIcon className="w-5 h-5 text-foreground-muted" />
            <div>
              <p className="text-sm font-medium">导入网页</p>
              <p className="text-xs text-foreground-muted">即将推出</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 开始按钮 */}
      <Button
        size="lg"
        className="w-full"
        disabled={!topic.trim()}
        onClick={handleStart}
      >
        开始知识训练
      </Button>
    </div>
  );
}

