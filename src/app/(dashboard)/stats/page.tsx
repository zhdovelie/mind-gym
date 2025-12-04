import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BarChart3, Clock, Target, TrendingUp, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // 模拟统计数据（实际应从数据库获取）
  const stats = {
    totalSessions: 0,
    totalMinutes: 0,
    totalTasks: 0,
    averageScore: 0,
    streakDays: 0,
    longestStreak: 0,
    thisWeek: {
      sessions: 0,
      minutes: 0,
      tasks: 0,
    },
    lastMonth: {
      sessions: 0,
      minutes: 0,
      averageScore: 0,
    },
  };

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const today = new Date().getDay();

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">训练统计</h1>
        <p className="text-foreground-muted">追踪你的训练进度和成长记录</p>
      </div>

      {/* 总览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stats.totalSessions}</p>
            <p className="text-sm text-foreground-muted">总训练次数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold">{stats.totalMinutes}</p>
            <p className="text-sm text-foreground-muted">总训练分钟</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <p className="text-2xl font-bold">{stats.streakDays}</p>
            <p className="text-sm text-foreground-muted">连续天数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-info" />
            </div>
            <p className="text-2xl font-bold">{stats.averageScore || "--"}</p>
            <p className="text-sm text-foreground-muted">平均得分</p>
          </CardContent>
        </Card>
      </div>

      {/* 本周训练 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            本周训练
          </CardTitle>
          <CardDescription>保持每天训练的习惯</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-6">
            {weekDays.map((day, index) => {
              const isToday = index === today;
              const trained = false; // 从数据库获取
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-foreground-muted">{day}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      trained
                        ? "bg-success text-white"
                        : isToday
                        ? "border-2 border-primary"
                        : "bg-background-secondary"
                    }`}
                  >
                    {trained && (
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
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold">{stats.thisWeek.sessions}</p>
              <p className="text-xs text-foreground-muted">训练次数</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{stats.thisWeek.minutes}</p>
              <p className="text-xs text-foreground-muted">训练分钟</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{stats.thisWeek.tasks}</p>
              <p className="text-xs text-foreground-muted">完成任务</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 能力趋势 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            能力趋势
          </CardTitle>
          <CardDescription>近 30 天的能力变化</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.totalSessions > 0 ? (
            <div className="h-48 flex items-center justify-center text-foreground-muted">
              {/* 这里可以集成图表组件 */}
              <p>图表区域 - 需要更多训练数据</p>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-foreground-muted">
              <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
              <p>还没有训练数据</p>
              <p className="text-sm">开始训练后，这里会显示你的能力变化趋势</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 成就 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            成就
          </CardTitle>
          <CardDescription>你获得的里程碑</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: "初来乍到", icon: "🎉", unlocked: true },
              { name: "连续3天", icon: "🔥", unlocked: false },
              { name: "连续7天", icon: "⭐", unlocked: false },
              { name: "完成10次", icon: "🏆", unlocked: false },
              { name: "得分90+", icon: "💯", unlocked: false },
              { name: "全能选手", icon: "🧠", unlocked: false },
            ].map((achievement) => (
              <div
                key={achievement.name}
                className={`text-center p-3 rounded-lg ${
                  achievement.unlocked
                    ? "bg-primary/10"
                    : "bg-background-secondary opacity-50"
                }`}
              >
                <p className="text-2xl mb-1">{achievement.icon}</p>
                <p className="text-xs">{achievement.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

