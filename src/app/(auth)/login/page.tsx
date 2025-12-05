"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Brain, Github, Loader2, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("邮箱或密码错误");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("登录失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    setLoadingProvider(provider);
    signIn(provider, { callbackUrl });
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
          <CardTitle className="text-2xl">Mind Gym</CardTitle>
          <CardDescription>
            登录以开始你的脑力训练
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {/* OAuth 登录按钮 */}
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

              <FieldSeparator>或使用邮箱登录</FieldSeparator>

              {/* 错误提示 */}
              {error && (
                <FieldError>{error}</FieldError>
              )}

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
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">密码</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    忘记密码？
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isButtonLoading}
                />
              </Field>

              {/* 登录按钮 */}
              <Field>
                <Button type="submit" className="w-full" disabled={isButtonLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      登录中...
                    </>
                  ) : (
                    "登录"
                  )}
                </Button>
              </Field>

              {/* 注册链接 */}
              <FieldDescription className="text-center">
                还没有账号？{" "}
                <Link href="/register" className="text-primary hover:underline">
                  立即注册
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* 服务条款 */}
      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        继续即表示您同意我们的{" "}
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

function LoginLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Brain className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Mind Gym</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
