import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock,
  Dumbbell,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// ============================================
// 数据定义
// ============================================

const stats = [
  { label: "坚持天数", value: "128", sub: "累计训练" },
  { label: "连续打卡", value: "18", sub: "天" },
  { label: "正确率", value: "92%", sub: "AI 纠偏" },
];

const dimensions = [
  { name: "专注力", score: 86, icon: Target, color: "text-pink-500" },
  { name: "记忆力", score: 78, icon: Brain, color: "text-blue-500" },
  { name: "逻辑力", score: 82, icon: Wand2, color: "text-purple-500" },
  { name: "表达力", score: 74, icon: MessageSquare, color: "text-green-500" },
  { name: "元认知", score: 69, icon: Activity, color: "text-yellow-500" },
];

const aiBenefits = [
  {
    icon: Sparkles,
    title: "AI 教练实时反馈",
    points: [
      "实时指出遗漏与偏差，避免「练错题」",
      "用自然语言解释思路，而不是只给分数",
      "自动记录弱项，生成下次训练重点",
    ],
  },
  {
    icon: ShieldCheck,
    title: "结构化成长路径",
    points: [
      "5 大能力雷达，清晰定位短板",
      "阶段性目标提醒，不再迷失方向",
      "复盘报告自动生成，追踪成长轨迹",
    ],
  },
  {
    icon: BarChart3,
    title: "可视化成果追踪",
    points: [
      "趋势与分布双视图，一目了然",
      "训练时长与强度追踪，量化进步",
      "周/月报导出，方便复盘分享",
    ],
  },
];

const steps = [
  {
    title: "快速评估",
    time: "6 分钟",
    description: "捕捉当前能力分布，生成基线数据与阶段目标。",
  },
  {
    title: "自适应训练",
    time: "10-15 分钟",
    description: "AI 根据反馈即时调整难度，保持「略有挑战而不挫败」。",
  },
  {
    title: "复盘巩固",
    time: "2 分钟",
    description: "生成要点与弱项提醒，自动安排下次巩固计划。",
  },
];

const trainingExamples = [
  { title: "深度训练 · 专注力", time: "12 分钟", tag: "推荐" },
  { title: "知识双修 · 逻辑力", time: "18 分钟", tag: "热门" },
  { title: "自由模式 · 表达力", time: "10 分钟", tag: "轻松" },
];

// ============================================
// 组件
// ============================================

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">Mind Gym</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">登录</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="rounded-full px-4">
              立即开始
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function SectionHero() {
  return (
    <section className="grid gap-8 lg:grid-cols-12 items-start">
      {/* 左侧：标题 + 数据 */}
      <div className="space-y-6 lg:col-span-7">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            AI 脑力训练房 · 每日训练计划
          </p>
          <h1 className="text-3xl lg:text-4xl font-semibold leading-tight">
            让 AI 做你的<span className="text-primary">脑力教练</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            通过评估、训练、复盘的闭环方式，持续提升专注、记忆、逻辑与表达。
            每天 10–20 分钟，即可完成一次高效脑力训练。
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Link href="/register">
            <Button size="lg" className="rounded-full px-6">
              立即开始训练
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <span className="text-xs text-muted-foreground">
            已完成 <span className="font-medium text-foreground">12,480+</span> 次训练
          </span>
        </div>

        {/* 数据小卡片 */}
        <div className="grid w-full gap-3 grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-muted/40 border-border/60">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {stat.label} · {stat.sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 右侧：今日训练计划卡片 */}
      <Card className="lg:col-span-5 bg-card shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              今日训练计划
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">Level 3</Badge>
          </div>
          <CardDescription className="text-xs">
            AI 已为你排好 15 分钟课程
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* 当前进度 */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">专注力 · 深度训练</span>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                进行中
              </Badge>
            </div>
            <div className="mt-2 space-y-1.5">
              <Progress value={68} className="h-1.5" />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>剩余 5 分钟</span>
                <span>难度：中等</span>
              </div>
            </div>
          </div>

          {/* AI 追问 */}
          <div className="rounded-lg border p-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium">AI 教练 · 追问</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  你在推理时跳过了一个假设：数据是否完整？补充这一点再尝试回答。
                </p>
                <div className="flex items-center gap-1 text-[10px] text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                  即时纠偏已开启
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full text-xs">
            继续训练
            <ArrowRight className="ml-1.5 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function SectionMetrics() {
  return (
    <section className="grid gap-6 lg:grid-cols-12">
      {/* 左侧：认知维度 */}
      <div className="space-y-4 lg:col-span-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">5 大认知维度</h2>
          <Badge variant="outline" className="text-[10px]">AI 生成评估报告</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dimensions.map((dim) => (
            <Card key={dim.name} className="bg-muted/40 border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <dim.icon className={`h-3.5 w-3.5 ${dim.color}`} />
                    <span className="text-xs font-medium">{dim.name}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{dim.score}/100</span>
                </div>
                <Progress value={dim.score} className="h-1.5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 右侧：训练建议 */}
      <Card className="lg:col-span-4 bg-muted/40 border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            训练节奏建议
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">·</span>
              每周 4-5 次，单次 12-18 分钟
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">·</span>
              高低强度交替，避免过载
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">·</span>
              训练后 3 小时内完成复盘
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">·</span>
              每 2 周重新测评更新计划
            </li>
          </ul>
          <Separator className="my-3" />
          <Link href="/assessment">
            <Button variant="ghost" size="sm" className="w-full text-xs h-8">
              完成测评获取个性化建议
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}

function SectionAiBenefits() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold">AI 功能优势</h2>
        <span className="text-[11px] text-muted-foreground">智能反馈 · 结构路径 · 成果可视</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {aiBenefits.map((benefit) => (
          <Card key={benefit.title} className="bg-muted/40 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <benefit.icon className="h-4 w-4 text-primary" />
                {benefit.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {benefit.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">·</span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SectionTrainingPath() {
  return (
    <section className="space-y-6">
      {/* 3 步路径 */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">3 步建立专属训练路径</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="bg-muted/40 border-border/60">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-medium">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium">{step.title}</span>
                  <Badge variant="secondary" className="text-[10px] ml-auto">
                    {step.time}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* 训练示例 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">训练示例</h2>
          <Link href="/workout">
            <Button variant="ghost" size="sm" className="text-xs h-7">
              查看全部
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {trainingExamples.map((example) => (
            <Card
              key={example.title}
              className="bg-muted/40 border-border/60 group cursor-pointer hover:border-primary/40 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[10px]">{example.tag}</Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {example.time}
                  </span>
                </div>
                <p className="text-xs font-medium">{example.title}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                  <Brain className="h-3 w-3" />
                  AI 伴随反馈
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionCTA() {
  return (
    <section>
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-7">
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60">
                Ready to Start
              </p>
              <h3 className="text-xl lg:text-2xl font-semibold">
                现在开始，留出 15 分钟给大脑
              </h3>
              <p className="text-sm text-primary-foreground/80 max-w-md">
                注册即可生成你的首个训练计划，并在训练中获得 AI 教练的即时提示与纠偏。
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/register">
                  <Button variant="secondary" className="rounded-full px-5">
                    免费体验
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="rounded-full px-5 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    我已有账号
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="lg:col-span-5 bg-primary-foreground/10 border-primary-foreground/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-primary-foreground/60">今日安排</p>
                    <p className="text-sm font-medium">15 分钟 · 专注+逻辑</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">立即开练</Badge>
                </div>
                <ul className="space-y-2 text-xs text-primary-foreground/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    6 分钟基线评估
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    8 分钟自适应训练
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    1 分钟复盘提醒
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="mx-auto max-w-6xl px-4 lg:px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Brain className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">Mind Gym</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2024 Mind Gym. AI 驱动的脑力训练平台。
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              服务条款
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              隐私政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// 主页面
// ============================================

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-6xl px-4 lg:px-6 py-10 space-y-12">
        <SectionHero />
        <SectionMetrics />
        <SectionAiBenefits />
        <SectionTrainingPath />
        <SectionCTA />
      </main>
      <Footer />
    </div>
  );
}
