import type { Post } from '../types';

export const posts: Post[] = [
  {
    id: '1',
    title: 'OpenClaw 初体验：从安装到第一个 Agent 对话',
    summary: '第一次接触 OpenClaw，从下载安装到跑通第一次 AI 对话，踩了不少坑。这篇文章记录完整的入门流程，帮你少走弯路，快速把这只龙虾养活。',
    tags: ['新手入门', 'OpenClaw', '环境配置'],
    date: '2026-03-20',
    readTime: 8,
    category: 'tech',
    coverColor: 'from-lobster-400 to-orange-400',
    status: 'published' as const,
    content: `# OpenClaw 初体验：从安装到第一个 Agent 对话

> 万事开头难，但 OpenClaw 的第一步其实挺顺的——只要你知道坑在哪。

## OpenClaw 是什么？

OpenClaw 是一个本地运行的 **AI Agent 框架**，核心特点是：

- 🦞 运行在你自己的机器上，数据不出门
- 🔌 支持接入多种大模型（通过 models.json 配置）
- 🛠️ 可安装各种 Skill 扩展能力
- 📁 直接操作本地文件系统、执行命令

## 安装流程

### 1. 下载客户端

访问官方渠道下载对应平台的安装包（Windows / macOS / Linux 均支持）。

### 2. 配置模型

安装完成后，第一件事是配置你的 AI 模型。编辑 \`~/.openclaw/agents/main/agent/models.json\`：

\`\`\`json
{
  "models": [
    {
      "id": "your-model-id",
      "provider": "openai",
      "apiKey": "sk-xxx",
      "baseURL": "https://api.openai.com/v1"
    }
  ],
  "default": "your-model-id"
}
\`\`\`

### 3. 首次对话

配置完毕后，在输入框里说一句话，看看 Agent 怎么回应。如果能正常响应，恭喜你——龙虾养活了 🦞

## 常见坑

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 模型无响应 | API Key 配置错误 | 检查 models.json 格式 |
| 命令执行失败 | 路径权限问题 | 以管理员身份运行 |
| 中文乱码 | Windows 编码问题 | PowerShell 设置 UTF-8 |

## 小结

OpenClaw 的上手门槛不高，核心是把模型配好。接下来可以开始探索 Skill 系统，让你的 Agent 能做更多事。

---

*下一篇：Skill 系统详解 →*
`
  },
  {
    id: '2',
    title: 'OpenClaw Skill 系统详解：安装、使用与自定义',
    summary: 'Skill 是 OpenClaw 的超能力扩展包，安装一个 Skill 就能让 Agent 掌握一项新技能。本文详解 Skill 的工作原理、安装方式，以及如何自己写一个 Skill。',
    tags: ['Skill开发', 'OpenClaw', '进阶技巧'],
    date: '2026-03-18',
    readTime: 10,
    category: 'tech',
    coverColor: 'from-ocean-400 to-blue-400',
    status: 'published' as const,
    content: `# OpenClaw Skill 系统详解

## Skill 是什么？

Skill 是 OpenClaw 的**领域专家扩展包**，本质是一个包含以下内容的目录：

\`\`\`
my-skill/
├── SKILL.md        # Skill 的核心指令（Agent 会读取）
├── scripts/        # 可执行脚本
│   └── main.py
└── assets/         # 静态资源
\`\`\`

当 Agent 加载一个 Skill，它会读取 SKILL.md 中的指令，获得该领域的专业知识和操作能力。

## Skill 存储位置

OpenClaw 有两级 Skill 管理：

| 级别 | 路径 | 作用域 |
|------|------|--------|
| 用户级 | \`~/.workbuddy/skills/\` | 所有项目可用 |
| 项目级 | \`{项目}/.workbuddy/skills/\` | 仅当前项目可用 |

**推荐**：常用 Skill 装到用户级，项目专属的装到项目级。

## 安装 Skill

### 从市场安装

在 OpenClaw 界面的 Skill 市场中搜索并一键安装。

### 手动安装

\`\`\`bash
# 复制 Skill 目录到用户级
cp -r my-skill ~/.workbuddy/skills/

# 验证安装
ls ~/.workbuddy/skills/
\`\`\`

## 写一个最简单的 Skill

### SKILL.md

\`\`\`markdown
# my-greeter

当用户问候时，用这个 Skill 回应。

## 使用方式

执行以下脚本获取当前时间：

\`\`\`bash
python scripts/get_time.py
\`\`\`

根据时间段给出对应的问候语。
\`\`\`

### scripts/get_time.py

\`\`\`python
from datetime import datetime

now = datetime.now()
hour = now.hour

if 6 <= hour < 12:
    print("早上好！")
elif 12 <= hour < 18:
    print("下午好！")
else:
    print("晚上好！")
\`\`\`

## 安全提示

> ⚠️ 安装第三方 Skill 前，务必检查 SKILL.md 和 scripts/ 目录中的内容，防范潜在的安全风险（命令注入、数据外发等）。

OpenClaw 内置了 skill-scanner 可以帮助审计 Skill 安全性。

---

*下一篇：QQ Bot 集成实战 →*
`
  },
  {
    id: '3',
    title: '把 OpenClaw Agent 接入 QQ Bot：完整实战',
    summary: '通过 OpenClaw 的 QQ Bot 渠道，让 AI Agent 直接在 QQ 中响应消息。本文记录从申请 AppID 到消息收发全流程，包含 known-users.json 的 openid 配置技巧。',
    tags: ['QQ Bot', 'OpenClaw', '渠道集成'],
    date: '2026-03-15',
    readTime: 12,
    category: 'tech',
    coverColor: 'from-blue-400 to-indigo-500',
    status: 'published' as const,
    content: `# 把 OpenClaw Agent 接入 QQ Bot

## 整体架构

\`\`\`
QQ 用户发消息
    ↓
QQ Bot 平台（腾讯开放平台）
    ↓
OpenClaw QQ Bot 渠道
    ↓
OpenClaw Agent 处理
    ↓
回复消息
\`\`\`

## 前置准备

### 1. 申请 QQ Bot AppID

前往 [QQ 开放平台](https://q.qq.com) 创建应用，获取：
- \`AppID\`
- \`AppSecret\` / \`Token\`

### 2. 配置 OpenClaw

编辑 \`~/.openclaw/openclaw.json\`，添加 QQ Bot 渠道配置：

\`\`\`json
{
  "channels": {
    "qqbot": {
      "enabled": true,
      "appId": "你的AppID",
      "appSecret": "你的AppSecret"
    }
  }
}
\`\`\`

## 用户 OpenID 管理

QQ Bot 使用 openid 而非 QQ 号来标识用户。第一次收到某用户消息后，OpenClaw 会自动将其 openid 记录到：

\`\`\`
~/.openclaw/qqbot/data/known-users.json
\`\`\`

文件格式：

\`\`\`json
{
  "users": [
    {
      "openid": "B7F7B394E13E2DAA60EC841AA38491D4",
      "nickname": "尧哥",
      "firstSeen": "2026-03-10T08:00:00"
    }
  ]
}
\`\`\`

## 主动推送消息

已知 openid 后，可以通过脚本主动向用户推送消息：

\`\`\`python
# qq_push.py
import requests
import json

OPENID = "B7F7B394E13E2DAA60EC841AA38491D4"
APP_ID = "1903506261"

def push_message(content: str):
    # 调用 OpenClaw 内置推送接口
    url = "http://localhost:PORT/api/push"
    payload = {
        "channel": "qqbot",
        "openid": OPENID,
        "content": content
    }
    resp = requests.post(url, json=payload)
    return resp.json()

push_message("🦞 Agent 定时任务执行完成！")
\`\`\`

## 实际效果

接入成功后，在 QQ 中 @ Bot 或私聊，Agent 会直接响应，支持：
- 自然语言对话
- 执行 Skill 任务
- 返回文件、图片等富媒体

---
`
  },
  {
    id: '4',
    title: 'OpenClaw 自动化任务：定时 Automation 配置指南',
    summary: 'OpenClaw 支持定时自动化任务（Automation），让 Agent 在无人值守时按计划执行工作。本文详解 RRULE 规则写法、任务配置格式以及常见场景实例。',
    tags: ['Automation', 'OpenClaw', '自动化'],
    date: '2026-03-10',
    readTime: 9,
    category: 'tech',
    coverColor: 'from-green-400 to-teal-400',
    status: 'published' as const,
    content: `# OpenClaw 自动化任务配置指南

## Automation 是什么？

Automation 让 Agent 按照预设的时间计划自动执行任务，无需人工触发。典型场景：

- 每天早上汇总昨日新闻
- 每周一生成工作计划
- 每小时检查服务器状态
- 定时向 QQ 推送提醒

## 配置文件结构

每个 Automation 存储在独立目录：

\`\`\`
~/.workbuddy/automations/
└── {automation-id}/
    └── automation.toml
\`\`\`

### automation.toml 格式

\`\`\`toml
name = "每日早报"
prompt = "搜索今天的科技新闻，整理成简报推送到 QQ"
status = "ACTIVE"
cwds = ["/Users/slowdone/WorkBuddy/project"]

[schedule]
rrule = "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=8;BYMINUTE=0"
\`\`\`

## RRULE 速查表

RRULE 是 iCalendar 标准的重复规则格式：

| 场景 | RRULE |
|------|-------|
| 每小时执行 | \`FREQ=HOURLY;INTERVAL=1\` |
| 每两小时 | \`FREQ=HOURLY;INTERVAL=2\` |
| 每天早上 9 点 | \`FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;BYHOUR=9;BYMINUTE=0\` |
| 每周一早上 9 点 | \`FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0\` |
| 工作日每天 | \`FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9;BYMINUTE=0\` |

> ⚠️ OpenClaw 目前只支持 **HOURLY** 和 **WEEKLY** 两种频率，不支持 DAILY / MONTHLY。

## 实战例子

### 例 1：每天早报推送

\`\`\`toml
name = "科技早报"
prompt = "搜索今日科技新闻头条，整理 5 条摘要，通过 QQ 推送给用户"
status = "ACTIVE"
cwds = ["/Users/slowdone"]

[schedule]
rrule = "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=8;BYMINUTE=0"
\`\`\`

### 例 2：每两小时健康检查

\`\`\`toml
name = "服务健康检查"
prompt = "检查本地服务运行状态，如有异常立即通知"
status = "ACTIVE"
cwds = ["/Users/slowdone/services"]

[schedule]
rrule = "FREQ=HOURLY;INTERVAL=2"
\`\`\`

## 管理 Automation

在 OpenClaw 对话中，直接用自然语言操作：

\`\`\`
"帮我创建一个每天早上8点的科技早报任务"
"暂停科技早报任务"
"查看所有自动化任务"
\`\`\`

Agent 会自动读写 automation.toml 配置文件。

---
`
  },
  {
    id: '5',
    title: 'OpenClaw 工作记忆系统：让 Agent 跨会话记住你',
    summary: '默认情况下 Agent 每次对话都是从零开始的。通过 OpenClaw 的工作记忆系统，你可以让 Agent 记住你的偏好、项目上下文和重要决策，打造真正有"记忆"的 AI 助手。',
    tags: ['工作记忆', 'OpenClaw', '进阶技巧'],
    date: '2026-03-05',
    readTime: 7,
    category: 'tech',
    coverColor: 'from-purple-400 to-pink-400',
    status: 'published' as const,
    content: `# OpenClaw 工作记忆系统

## 为什么需要记忆？

没有记忆的 Agent 就像每天早上起床都忘了自己是谁——每次都要重新自我介绍，效率极低。

OpenClaw 的工作记忆系统通过 Markdown 文件实现跨会话的上下文持久化。

## 记忆文件结构

\`\`\`
{项目}/.workbuddy/memory/
├── MEMORY.md          # 长期记忆（精炼的核心信息）
├── 2026-03-23.md      # 今日工作日志（按日期）
├── 2026-03-22.md
└── ...
\`\`\`

## MEMORY.md：长期记忆

存放跨越多天都有价值的信息：

\`\`\`markdown
# 项目偏好

## 技术栈偏好
- 前端：React + TypeScript + Tailwind CSS
- 后端：Python FastAPI
- 数据库：PostgreSQL

## 重要约定
- 代码注释使用中文
- Git commit 信息格式：type(scope): description

## 已知配置
- OpenClaw AppID: 1903506261
- QQ 推送目标: openid B7F7B394...
\`\`\`

## 日志文件：短期记忆

每天的工作记录，追加写入：

\`\`\`markdown
# 2026-03-23

## 14:30 完成博客网站开发
- 项目路径：~/WorkBuddy/lobster-blog
- 技术栈：React + Vite + Tailwind
- 已启动 dev server: http://localhost:5173

## 15:00 修复主题描述
- 将博客主题从"水产养殖"改为"OpenClaw 技术博客"
\`\`\`

## Agent 读写记忆的时机

**读取时机**：
- 会话开始时，任务涉及历史上下文
- 回答"上次做了什么"类问题前

**写入时机**：
- 完成一项实质性工作后
- 用户告知重要偏好或约定
- 做出重要技术决策后

## 实用技巧

告诉 Agent 记住某件事：

\`\`\`
"记住：我的数据库密码存在 ~/.env 文件里，不要直接写在代码中"
"记住：这个项目用 pnpm 而不是 npm"
\`\`\`

Agent 会将其写入 MEMORY.md，下次自动读取。

---

*记忆系统是让 OpenClaw Agent 越用越顺手的关键。好好利用它！*
`
  },
];
