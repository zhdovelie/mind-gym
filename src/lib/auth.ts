import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import type { Adapter } from "next-auth/adapters";

/**
 * LinuxDo OAuth Provider
 * 自定义 OAuth2 provider 配置
 */
interface LinuxDoProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar_url: string;
  active: boolean;
  trust_level: number;
  silenced: boolean;
  groups?: Array<{
    id: number;
    name: string;
  }>;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // @ts-expect-error - Prisma 7 type compatibility with @auth/prisma-adapter
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/assessment", // 新用户首先进行脑力评估
  },
  providers: [
    // GitHub OAuth
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    // LinuxDo OAuth (自定义)
    {
      id: "linuxdo",
      name: "LinuxDo",
      type: "oauth",
      clientId: process.env.LINUXDO_CLIENT_ID,
      clientSecret: process.env.LINUXDO_CLIENT_SECRET,
      
      // OAuth2 端点配置
      authorization: {
        url: "https://connect.linux.do/oauth2/authorize",
        params: {
          scope: "read",
          response_type: "code",
        },
      },
      token: {
        url: "https://connect.linux.do/oauth2/token",
      },
      userinfo: {
        url: "https://connect.linux.do/api/user",
      },
      
      // 用户信息映射
      profile(profile: LinuxDoProfile) {
        return {
          id: String(profile.id),
          name: profile.name || profile.username,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
      
      // 样式配置（用于登录按钮）
      style: {
        logo: "https://linux.do/uploads/default/original/3X/9/d/9dd49731091ce8656e94433a26a3ef36062b3994.png",
        bg: "#f97316",
        text: "#fff",
      },
    },
    // 邮箱密码登录
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id;
      }
      
      // 保存 OAuth provider 信息
      if (account) {
        token.provider = account.provider;
      }
      
      // 处理更新 session 的情况
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // 可选：暴露 provider 信息
        // session.user.provider = token.provider as string;
      }
      return session;
    },
    async signIn({ account, profile }) {
      // 可以在这里添加额外的登录验证逻辑
      // 例如：检查 LinuxDo 用户的信任等级
      if (account?.provider === "linuxdo" && profile) {
        const linuxdoProfile = profile as unknown as LinuxDoProfile;
        // 可选：只允许特定信任等级的用户登录
        // if (linuxdoProfile.trust_level < 1) {
        //   return false;
        // }
        // 可选：检查用户是否被禁言
        if (linuxdoProfile.silenced) {
          return false;
        }
      }
      return true;
    },
  },
  events: {
    // 新用户创建时自动创建认知画像
    async createUser({ user }) {
      if (user.id) {
        await prisma.cognitiveProfile.create({
          data: {
            userId: user.id,
            attention: 50,
            memory: 50,
            logic: 50,
            expression: 50,
            metacog: 50,
          },
        });
      }
    },
  },
});

/**
 * 注册新用户
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string
) {
  // 检查用户是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("用户已存在");
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 12);

  // 创建用户
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || email.split("@")[0],
      // 同时创建默认的认知画像
      cognitiveProfile: {
        create: {
          attention: 50,
          memory: 50,
          logic: 50,
          expression: 50,
          metacog: 50,
        },
      },
    },
    include: {
      cognitiveProfile: true,
    },
  });

  return user;
}

/**
 * 获取当前用户完整信息
 */
export async function getCurrentUser() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      cognitiveProfile: true,
    },
  });

  return user;
}

/**
 * 获取用户的认知画像
 */
export async function getUserCognitiveProfile(userId: string) {
  let profile = await prisma.cognitiveProfile.findUnique({
    where: { userId },
  });

  // 如果不存在，创建默认画像
  if (!profile) {
    profile = await prisma.cognitiveProfile.create({
      data: {
        userId,
        attention: 50,
        memory: 50,
        logic: 50,
        expression: 50,
        metacog: 50,
      },
    });
  }

  return profile;
}
