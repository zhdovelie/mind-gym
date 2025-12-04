import Link from "next/link";
import { auth, getCurrentUser } from "@/lib/auth";
import { Brain, Dumbbell, Target, Clock, TrendingUp, Zap, BookOpen, Shuffle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default async function HomePage() {
  const session = await auth();
  const user = await getCurrentUser();

  const profile = user?.cognitiveProfile;
  const userName = user?.name || session?.user?.name || "用户";

  // 计算今日是否已训练（这里用模拟数据）
  const todayTrained = false;
  const streakDays = 0;
  const weeklyMinutes = 0;

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* 欢迎区域 */}
      <section className="text-center py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          你好，<span className="gradient-text">{userName}</span> 👋
        </h1>
        <p className="text-foreground-muted text-lg">
          {todayTrained 
            ? "今天已经训练过了，继续保持！" 
            : "今天还没有训练，来锻炼一下大脑吧！"}
        </p>
      </section>

      {/* 快速开始 */}
      <section>
        <Card className="gradient-primary border-0 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">每日训练</h2>
                  <p className="text-white/80">10-15 分钟，保持大脑活力</p>
                </div>
              </div>
              <Link href="/workout/daily">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  <Dumbbell className="w-5 h-5 mr-2" />
                  开始今日训练
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 统计概览 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{streakDays}</p>
            <p className="text-sm text-foreground-muted">连续天数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold">{weeklyMinutes}</p>
            <p className="text-sm text-foreground-muted">本周分钟</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-warning" />
            </div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-foreground-muted">完成任务</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-info" />
            </div>
            <p className="text-2xl font-bold">--</p>
            <p className="text-sm text-foreground-muted">平均得分</p>
          </CardContent>
        </Card>
      </section>

      {/* 能力画像 */}
      {profile && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                能力画像
              </CardTitle>
              <CardDescription>你的认知能力分布</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>专注力</span>
                    <span className="text-foreground-muted">{profile.attention}/100</span>
                  </div>
                  <Progress value={profile.attention} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>记忆力</span>
                    <span className="text-foreground-muted">{profile.memory}/100</span>
                  </div>
                  <Progress value={profile.memory} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>逻辑力</span>
                    <span className="text-foreground-muted">{profile.logic}/100</span>
                  </div>
                  <Progress value={profile.logic} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>表达力</span>
                    <span className="text-foreground-muted">{profile.expression}/100</span>
                  </div>
                  <Progress value={profile.expression} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>元认知</span>
                    <span className="text-foreground-muted">{profile.metacog}/100</span>
                  </div>
                  <Progress value={profile.metacog} className="h-2" />
                </div>
              </div>
              <Link href="/assessment">
                <Button variant="outline" className="w-full">
                  重新评估
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 训练模式 */}
      <section>
        <h2 className="text-xl font-bold mb-4">训练模式</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/workout/focus">
            <Card hover className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">深度训练</h3>
                    <p className="text-sm text-foreground-muted">
                      针对特定能力进行专项训练
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/workout/knowledge">
            <Card hover className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">知识双修</h3>
                    <p className="text-sm text-foreground-muted">
                      学习新知识的同时锻炼脑力
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/workout/free">
            <Card hover className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Shuffle className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">自由模式</h3>
                    <p className="text-sm text-foreground-muted">
                      让 AI 教练为你安排训练
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/assessment">
            <Card hover className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">脑力评估</h3>
                    <p className="text-sm text-foreground-muted">
                      全面评估你的认知能力
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}

