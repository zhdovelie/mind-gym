import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mind Gym - AI 健脑房",
  description: "在 AI 时代，锻炼你的思维肌肉。通过 AI 教练的指导，保持和提升你的脑力与学习能力。",
  keywords: ["脑力训练", "认知训练", "AI教练", "思维训练", "学习能力"],
  authors: [{ name: "Mind Gym" }],
  openGraph: {
    title: "Mind Gym - AI 健脑房",
    description: "在 AI 时代，锻炼你的思维肌肉",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.className} antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
