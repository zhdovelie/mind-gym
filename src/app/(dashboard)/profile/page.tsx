import { auth, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Brain, Calendar, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  const profile = user?.cognitiveProfile;

  const abilities = [
    { key: "attention", name: "专注力", value: profile?.attention ?? 50, color: "ability-attention" },
    { key: "memory", name: "记忆力", value: profile?.memory ?? 50, color: "ability-memory" },
    { key: "logic", name: "逻辑力", value: profile?.logic ?? 50, color: "ability-logic" },
    { key: "expression", name: "表达力", value: profile?.expression ?? 50, color: "ability-expression" },
    { key: "metacog", name: "元认知", value: profile?.metacog ?? 50, color: "ability-metacog" },
  ];

  const averageScore = Math.round(
    abilities.reduce((sum, a) => sum + a.value, 0) / abilities.length
  );

  return (
    <div className="space-y-8 pb-20 md:pb-0 max-w-4xl mx-auto">
      {/* 用户信息 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || ""}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.name || "用户"}</h1>
              <p className="text-foreground-muted">{user?.email}</p>
              <p className="text-sm text-foreground-muted mt-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                加入于 {user?.createdAt ? formatDate(user.createdAt) : "未知"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 能力画像 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                认知能力画像
              </CardTitle>
              <CardDescription>
                {profile?.lastAssessedAt
                  ? `最近评估：${formatDate(profile.lastAssessedAt)}`
                  : "尚未进行评估"}
              </CardDescription>
            </div>
            <Link href="/assessment">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                重新评估
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* 综合得分 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-primary text-white">
              <div>
                <p className="text-3xl font-bold">{averageScore}</p>
                <p className="text-xs opacity-80">综合</p>
              </div>
            </div>
          </div>

          {/* 各维度得分 */}
          <div className="space-y-4">
            {abilities.map((ability) => (
              <div key={ability.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{ability.name}</span>
                  <span className="text-foreground-muted">{ability.value}/100</span>
                </div>
                <div className="relative">
                  <Progress value={ability.value} className="h-3" />
                  <div
                    className="absolute top-0 left-0 h-3 rounded-full transition-all"
                    style={{
                      width: `${ability.value}%`,
                      backgroundColor: `var(--${ability.color})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 能力说明 */}
          <div className="mt-6 p-4 bg-background-secondary rounded-lg">
            <h3 className="font-medium mb-2">画像解读</h3>
            <p className="text-sm text-foreground-muted">
              {averageScore >= 70
                ? "你的整体认知能力表现良好！继续保持训练习惯，可以尝试挑战更高难度的任务。"
                : averageScore >= 50
                ? "你的认知能力处于平均水平。通过持续训练，各项能力都有很大的提升空间。"
                : "建议从基础训练开始，循序渐进地提升各项认知能力。不要着急，坚持就会有收获。"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 训练建议 */}
      <Card>
        <CardHeader>
          <CardTitle>训练建议</CardTitle>
          <CardDescription>基于你的能力画像，推荐以下训练方向</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {abilities
              .sort((a, b) => a.value - b.value)
              .slice(0, 2)
              .map((ability) => (
                <div
                  key={ability.key}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <p className="font-medium">提升{ability.name}</p>
                    <p className="text-sm text-foreground-muted">
                      当前得分 {ability.value}，有较大提升空间
                    </p>
                  </div>
                  <Link href={`/workout/focus?ability=${ability.key}`}>
                    <Button size="sm">开始训练</Button>
                  </Link>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

