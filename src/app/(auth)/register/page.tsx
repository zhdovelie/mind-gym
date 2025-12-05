"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, Github, Loader2, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 验证密码匹配
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    // 验证密码长度
    if (password.length < 6) {
      setError("密码长度至少为6位");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "注册失败");
        return;
      }

      // 注册成功后自动登录
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("注册成功，但登录失败，请手动登录");
        router.push("/login");
      } else {
        // 新用户跳转到脑力评估
        router.push("/assessment");
        router.refresh();
      }
    } catch {
      setError("注册失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    setLoadingProvider(provider);
    signIn(provider, { callbackUrl: "/assessment" });
  };

  const isButtonLoading = isLoading || loadingProvider !== null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Brain className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">创建账号</CardTitle>
          <CardDescription>
            加入 Mind Gym，开始锻炼你的大脑
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {/* OAuth 注册按钮 */}
              <Field className="grid grid-cols-3 gap-3">
                {/* GitHub */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignIn("github")}
                  disabled={isButtonLoading}
                >
                  {loadingProvider === "github" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Github />
                  )}
                  <span className="sr-only">GitHub</span>
                </Button>

                {/* Google */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={isButtonLoading}
                >
                  {loadingProvider === "google" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <svg className="size-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span className="sr-only">Google</span>
                </Button>

                {/* LinuxDo */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignIn("linuxdo")}
                  disabled={isButtonLoading}
                  className="text-orange-600 hover:text-orange-600 dark:text-orange-400"
                >
                  {loadingProvider === "linuxdo" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <MessageCircle />
                  )}
                  <span className="sr-only">LinuxDo</span>
                </Button>
              </Field>

              <FieldSeparator>或使用邮箱注册</FieldSeparator>

              {/* 错误提示 */}
              {error && (
                <FieldError>{error}</FieldError>
              )}

              {/* 昵称 */}
              <Field>
                <FieldLabel htmlFor="name">昵称</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的昵称"
                  disabled={isButtonLoading}
                />
              </Field>

              {/* 邮箱 */}
              <Field>
                <FieldLabel htmlFor="email">邮箱</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isButtonLoading}
                />
              </Field>

              {/* 密码 */}
              <Field>
                <FieldLabel htmlFor="password">密码</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少6位密码"
                  required
                  disabled={isButtonLoading}
                />
              </Field>

              {/* 确认密码 */}
              <Field>
                <FieldLabel htmlFor="confirmPassword">确认密码</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  required
                  disabled={isButtonLoading}
                />
              </Field>

              {/* 注册按钮 */}
              <Field>
                <Button type="submit" className="w-full" disabled={isButtonLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      注册中...
                    </>
                  ) : (
                    "创建账号"
                  )}
                </Button>
              </Field>

              {/* 登录链接 */}
              <FieldDescription className="text-center">
                已有账号？{" "}
                <Link href="/login" className="text-primary hover:underline">
                  立即登录
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* 服务条款 */}
      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        注册即表示您同意我们的{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
          服务条款
        </Link>{" "}
        和{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
          隐私政策
        </Link>
      </FieldDescription>
    </div>
  );
}
