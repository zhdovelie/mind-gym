# Mind Gym - AI 健脑房 🧠

在 AI 时代，锻炼你的思维肌肉。通过 AI 教练的指导，保持和提升你的脑力与学习能力。

## 项目概述

Mind Gym 是一个 AI 驱动的"健脑房"Web 应用，核心理念是 **AI 是"负重"和"教练"，而不是"代劳者"**——让用户的大脑保持在"高参与、高反馈"的状态。

### 核心功能

- 🎯 **每日训练** - 10-15 分钟的日常脑力锻炼
- 🎪 **深度训练** - 针对特定能力进行专项深度训练
- 📚 **知识双修** - 学习新知识的同时锻炼脑力
- 🎲 **自由模式** - 让 AI 教练自动安排训练
- 📊 **脑力评估** - 全面评估认知能力
- 📈 **成长记录** - 追踪训练进度和能力变化

### 认知能力维度

- **专注力** - 持续注意力和抗干扰能力
- **记忆力** - 工作记忆和信息保持能力
- **逻辑力** - 逻辑推理和问题解决能力
- **表达力** - 语言组织和清晰表达能力
- **元认知** - 自我监控和学习策略能力

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router, TypeScript) |
| UI 样式 | Tailwind CSS + Framer Motion |
| 后端 API | Next.js Route Handlers |
| 数据库 | MySQL |
| ORM | Prisma |
| 认证 | NextAuth.js (GitHub/Google/LinuxDo OAuth + 邮箱密码) |
| AI 框架 | LangChain JS (@langchain/core@1.1.2) |
| AI 服务 | OpenAI 兼容 API |
| 状态管理 | Zustand |

## 快速开始

### 环境要求

- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd mind-gym
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

复制 `env.example` 为 `.env.local` 并填写配置：

```bash
cp env.example .env.local
```

需要配置的环境变量：

```env
# 数据库
DATABASE_URL="mysql://user:password@localhost:3306/mind_gym"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GITHUB_ID=""
GITHUB_SECRET=""
GOOGLE_ID=""
GOOGLE_SECRET=""
LINUXDO_CLIENT_ID=""
LINUXDO_CLIENT_SECRET=""

# AI 服务
AI_API_KEY="your-api-key"
AI_BASE_URL="https://api.openai.com/v1"
AI_DEFAULT_MODEL="gpt-4o-mini"
```

4. **初始化数据库**

```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库结构
npm run db:push

# (可选) 填充种子数据
npm run db:seed
```

5. **启动开发服务器**

```bash
npm run dev
```

访问 http://localhost:3000

## OAuth 配置指南

### GitHub OAuth

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写应用信息：
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. 复制 Client ID 和 Client Secret 到 `.env.local`

### Google OAuth

1. 访问 https://console.cloud.google.com/apis/credentials
2. 创建 OAuth 2.0 客户端 ID
3. 添加授权的重定向 URI: `http://localhost:3000/api/auth/callback/google`
4. 复制客户端 ID 和密钥到 `.env.local`

### LinuxDo OAuth

1. 访问 https://connect.linux.do 申请 OAuth 应用
2. 配置回调 URL: `http://localhost:3000/api/auth/callback/linuxdo`
3. 复制 Client ID 和 Client Secret 到 `.env.local`

LinuxDo OAuth 端点：
- Authorization URL: `https://connect.linux.do/oauth2/authorize`
- Token URL: `https://connect.linux.do/oauth2/token`
- User Info URL: `https://connect.linux.do/api/user`

## 项目结构

```
mind-gym/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 认证页面
│   │   ├── (dashboard)/       # 主应用页面
│   │   └── api/               # API 路由
│   ├── components/            # React 组件
│   │   ├── ui/               # 基础 UI 组件
│   │   ├── chat/             # 对话组件
│   │   └── workout/          # 训练组件
│   ├── lib/
│   │   ├── ai/               # AI 服务
│   │   │   ├── langchain/   # LangChain 实现
│   │   │   │   ├── agents/  # LangChain Agents
│   │   │   │   ├── client.ts # LangChain 客户端
│   │   │   │   └── tools.ts  # 工具定义
│   │   │   ├── prompts/     # Prompt 模板
│   │   │   └── client.ts    # 原始 AI 客户端
│   │   ├── auth.ts          # 认证配置
│   │   ├── db.ts            # 数据库客户端
│   │   └── utils.ts         # 工具函数
│   ├── stores/               # 状态管理
│   └── types/                # TypeScript 类型
├── prisma/
│   ├── schema.prisma         # 数据模型
│   └── seed.ts              # 种子数据
└── ...
```

## AI Agent 架构

本项目使用 **LangChain JS** (@langchain/core@1.1.2) 实现 AI Agent 系统：

```
用户输入
    │
    ▼
┌─────────────────────────────────────────────┐
│           Coach Agent (教练总管)             │
│  - 使用 ChatOpenAI + Prompt Templates       │
│  - 理解用户意图和状态                         │
│  - 规划训练流程                              │
│  - 协调其他 Agent                           │
└──────────────────┬──────────────────────────┘
                   │
       ┌───────────┼───────────┐
       │           │           │
       ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│Generator │ │  Judge   │ │SRL Coach │
│ 题目生成  │ │ 评分反馈  │ │ 反思引导  │
│ Zod验证   │ │结构化输出 │ │ 元认知    │
└──────────┘ └──────────┘ └──────────┘
```

### LangChain 功能特点

- **ChatOpenAI**: 支持 OpenAI 兼容 API
- **Prompt Templates**: 可复用的提示词模板
- **Structured Output**: 使用 Zod schema 进行结构化输出解析
- **Streaming**: 支持流式响应
- **Tool Calling**: 定义和调用工具功能

## 主要 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai/chat` | AI 对话主入口 |
| POST | `/api/exercise/generate` | 生成练习题 |
| POST | `/api/exercise/evaluate` | 评估用户答案 |
| POST | `/api/ai/reflect` | 反思引导 |

## 脚本命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 运行 ESLint

# 数据库
npm run db:generate  # 生成 Prisma 客户端
npm run db:push      # 推送数据库结构
npm run db:migrate   # 运行迁移
npm run db:seed      # 填充种子数据
npm run db:studio    # 打开 Prisma Studio
```

## 设计原则

本项目基于认知心理学和学习科学的原则设计：

1. **主动回忆 (Retrieval Practice)** - 让用户主动从记忆中提取信息
2. **间隔重复 (Spaced Repetition)** - 在遗忘前安排复习
3. **适度困难 (Desirable Difficulties)** - 保持适当的挑战性
4. **生产性失败 (Productive Failure)** - 允许失败，从失败中学习
5. **元认知训练** - 培养自我监控和学习策略能力

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
