import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain, Home, Dumbbell, BarChart3, User, LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">Mind Gym</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>首页</span>
            </Link>
            <Link
              href="/workout"
              className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              <Dumbbell className="w-4 h-4" />
              <span>训练</span>
            </Link>
            <Link
              href="/stats"
              className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>统计</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              <User className="w-4 h-4" />
              <span>画像</span>
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground-muted">
              {session.user.name || session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                const { signOut } = await import("@/lib/auth");
                await signOut();
              }}
            >
              <button
                type="submit"
                className="p-2 rounded-lg hover:bg-card transition-colors text-foreground-muted hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-foreground-muted"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">首页</span>
          </Link>
          <Link
            href="/workout"
            className="flex flex-col items-center gap-1 text-foreground-muted"
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-xs">训练</span>
          </Link>
          <Link
            href="/stats"
            className="flex flex-col items-center gap-1 text-foreground-muted"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">统计</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-1 text-foreground-muted"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">画像</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

