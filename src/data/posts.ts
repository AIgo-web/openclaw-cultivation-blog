import type { Post } from '../types';

export const posts: Post[] = [
  {
    "id": "1",
    "title": "OpenClaw 初体验：从安装到第一个 Agent 对话",
    "summary": "第一次接触 OpenClaw，从下载安装到跑通第一次 AI 对话，踩了不少坑。这篇文章记录完整的入门流程，帮你少走弯路，快速把这只龙虾养活。",
    "tags": [
      "新手入门",
      "OpenClaw",
      "环境配置"
    ],
    "date": "2026-03-20",
    "readTime": 8,
    "category": "tech",
    "coverColor": "from-lobster-400 to-orange-400",
    "status": "published" as const,
    "content": "# OpenClaw 初体验：从安装到第一个 Agent 对话\n\n> 万事开头难，但 OpenClaw 的第一步其实挺顺的——只要你知道坑在哪。\n\n## OpenClaw 是什么？\n\nOpenClaw 是一个本地运行的 **AI Agent 框架**，核心特点是：\n\n- 🦞 运行在你自己的机器上，数据不出门\n- 🔌 支持接入多种大模型（通过 models.json 配置）\n- 🛠️ 可安装各种 Skill 扩展能力\n- 📁 直接操作本地文件系统、执行命令\n\n## 安装流程\n\n### 1. 下载客户端\n\n访问官方渠道下载对应平台的安装包（Windows / macOS / Linux 均支持）。\n\n### 2. 配置模型\n\n安装完成后，第一件事是配置你的 AI 模型。编辑 `~/.openclaw/agents/main/agent/models.json`：\n\n```json\n{\n  \"models\": [\n    {\n      \"id\": \"your-model-id\",\n      \"provider\": \"openai\",\n      \"apiKey\": \"sk-xxx\",\n      \"baseURL\": \"https://api.openai.com/v1\"\n    }\n  ],\n  \"default\": \"your-model-id\"\n}\n```\n\n### 3. 首次对话\n\n配置完毕后，在输入框里说一句话，看看 Agent 怎么回应。如果能正常响应，恭喜你——龙虾养活了 🦞\n\n## 常见坑\n\n| 问题 | 原因 | 解决方案 |\n|------|------|----------|\n| 模型无响应 | API Key 配置错误 | 检查 models.json 格式 |\n| 命令执行失败 | 路径权限问题 | 以管理员身份运行 |\n| 中文乱码 | Windows 编码问题 | PowerShell 设置 UTF-8 |\n\n## 小结\n\nOpenClaw 的上手门槛不高，核心是把模型配好。接下来可以开始探索 Skill 系统，让你的 Agent 能做更多事。\n\n---\n\n*下一篇：Skill 系统详解 →*\n"
  },
  {
    "id": "2",
    "title": "OpenClaw Skill 系统详解：安装、使用与自定义",
    "summary": "Skill 是 OpenClaw 的超能力扩展包，安装一个 Skill 就能让 Agent 掌握一项新技能。本文详解 Skill 的工作原理、安装方式，以及如何自己写一个 Skill。",
    "tags": [
      "Skill开发",
      "OpenClaw",
      "进阶技巧"
    ],
    "date": "2026-03-18",
    "readTime": 10,
    "category": "tech",
    "coverColor": "from-ocean-400 to-blue-400",
    "status": "published" as const,
    "content": "# OpenClaw Skill 系统详解\n\n## Skill 是什么？\n\nSkill 是 OpenClaw 的**领域专家扩展包**，本质是一个包含以下内容的目录：\n\n```\nmy-skill/\n├── SKILL.md        # Skill 的核心指令（Agent 会读取）\n├── scripts/        # 可执行脚本\n│   └── main.py\n└── assets/         # 静态资源\n```\n\n当 Agent 加载一个 Skill，它会读取 SKILL.md 中的指令，获得该领域的专业知识和操作能力。\n\n## Skill 存储位置\n\nOpenClaw 有两级 Skill 管理：\n\n| 级别 | 路径 | 作用域 |\n|------|------|--------|\n| 用户级 | `~/.workbuddy/skills/` | 所有项目可用 |\n| 项目级 | `{项目}/.workbuddy/skills/` | 仅当前项目可用 |\n\n**推荐**：常用 Skill 装到用户级，项目专属的装到项目级。\n\n## 安装 Skill\n\n### 从市场安装\n\n在 OpenClaw 界面的 Skill 市场中搜索并一键安装。\n\n### 手动安装\n\n```bash\n# 复制 Skill 目录到用户级\ncp -r my-skill ~/.workbuddy/skills/\n\n# 验证安装\nls ~/.workbuddy/skills/\n```\n\n## 写一个最简单的 Skill\n\n### SKILL.md\n\n```markdown\n# my-greeter\n\n当用户问候时，用这个 Skill 回应。\n\n## 使用方式\n\n执行以下脚本获取当前时间：\n\n```bash\npython scripts/get_time.py\n```\n\n根据时间段给出对应的问候语。\n```\n\n### scripts/get_time.py\n\n```python\nfrom datetime import datetime\n\nnow = datetime.now()\nhour = now.hour\n\nif 6 <= hour < 12:\n    print(\"早上好！\")\nelif 12 <= hour < 18:\n    print(\"下午好！\")\nelse:\n    print(\"晚上好！\")\n```\n\n## 安全提示\n\n> ⚠️ 安装第三方 Skill 前，务必检查 SKILL.md 和 scripts/ 目录中的内容，防范潜在的安全风险（命令注入、数据外发等）。\n\nOpenClaw 内置了 skill-scanner 可以帮助审计 Skill 安全性。\n\n---\n\n*下一篇：QQ Bot 集成实战 →*\n"
  },
  {
    "id": "3",
    "title": "把 OpenClaw Agent 接入 QQ Bot：完整实战",
    "summary": "通过 OpenClaw 的 QQ Bot 渠道，让 AI Agent 直接在 QQ 中响应消息。本文记录从申请 AppID 到消息收发全流程，包含 known-users.json 的 openid 配置技巧。",
    "tags": [
      "QQ Bot",
      "OpenClaw",
      "渠道集成"
    ],
    "date": "2026-03-15",
    "readTime": 12,
    "category": "tech",
    "coverColor": "from-blue-400 to-indigo-500",
    "status": "published" as const,
    "content": "# 把 OpenClaw Agent 接入 QQ Bot\n\n## 整体架构\n\n```\nQQ 用户发消息\n    ↓\nQQ Bot 平台（腾讯开放平台）\n    ↓\nOpenClaw QQ Bot 渠道\n    ↓\nOpenClaw Agent 处理\n    ↓\n回复消息\n```\n\n## 前置准备\n\n### 1. 申请 QQ Bot AppID\n\n前往 [QQ 开放平台](https://q.qq.com) 创建应用，获取：\n- `AppID`\n- `AppSecret` / `Token`\n\n### 2. 配置 OpenClaw\n\n编辑 `~/.openclaw/openclaw.json`，添加 QQ Bot 渠道配置：\n\n```json\n{\n  \"channels\": {\n    \"qqbot\": {\n      \"enabled\": true,\n      \"appId\": \"你的AppID\",\n      \"appSecret\": \"你的AppSecret\"\n    }\n  }\n}\n```\n\n## 用户 OpenID 管理\n\nQQ Bot 使用 openid 而非 QQ 号来标识用户。第一次收到某用户消息后，OpenClaw 会自动将其 openid 记录到：\n\n```\n~/.openclaw/qqbot/data/known-users.json\n```\n\n文件格式：\n\n```json\n{\n  \"users\": [\n    {\n      \"openid\": \"B7F7B394E13E2DAA60EC841AA38491D4\",\n      \"nickname\": \"尧哥\",\n      \"firstSeen\": \"2026-03-10T08:00:00\"\n    }\n  ]\n}\n```\n\n## 主动推送消息\n\n已知 openid 后，可以通过脚本主动向用户推送消息：\n\n```python\n# qq_push.py\nimport requests\nimport json\n\nOPENID = \"B7F7B394E13E2DAA60EC841AA38491D4\"\nAPP_ID = \"1903506261\"\n\ndef push_message(content: str):\n    # 调用 OpenClaw 内置推送接口\n    url = \"http://localhost:PORT/api/push\"\n    payload = {\n        \"channel\": \"qqbot\",\n        \"openid\": OPENID,\n        \"content\": content\n    }\n    resp = requests.post(url, json=payload)\n    return resp.json()\n\npush_message(\"🦞 Agent 定时任务执行完成！\")\n```\n\n## 实际效果\n\n接入成功后，在 QQ 中 @ Bot 或私聊，Agent 会直接响应，支持：\n- 自然语言对话\n- 执行 Skill 任务\n- 返回文件、图片等富媒体\n\n---\n"
  },
  {
    "id": "4",
    "title": "OpenClaw 自动化任务：定时 Automation 配置指南",
    "summary": "OpenClaw 支持定时自动化任务（Automation），让 Agent 在无人值守时按计划执行工作。本文详解 RRULE 规则写法、任务配置格式以及常见场景实例。",
    "tags": [
      "Automation",
      "OpenClaw",
      "自动化"
    ],
    "date": "2026-03-10",
    "readTime": 9,
    "category": "tech",
    "coverColor": "from-green-400 to-teal-400",
    "status": "published" as const,
    "content": "# OpenClaw 自动化任务配置指南\n\n## Automation 是什么？\n\nAutomation 让 Agent 按照预设的时间计划自动执行任务，无需人工触发。典型场景：\n\n- 每天早上汇总昨日新闻\n- 每周一生成工作计划\n- 每小时检查服务器状态\n- 定时向 QQ 推送提醒\n\n## 配置文件结构\n\n每个 Automation 存储在独立目录：\n\n```\n~/.workbuddy/automations/\n└── {automation-id}/\n    └── automation.toml\n```\n\n### automation.toml 格式\n\n```toml\nname = \"每日早报\"\nprompt = \"搜索今天的科技新闻，整理成简报推送到 QQ\"\nstatus = \"ACTIVE\"\ncwds = [\"/Users/slowdone/WorkBuddy/project\"]\n\n[schedule]\nrrule = \"FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=8;BYMINUTE=0\"\n```\n\n## RRULE 速查表\n\nRRULE 是 iCalendar 标准的重复规则格式：\n\n| 场景 | RRULE |\n|------|-------|\n| 每小时执行 | `FREQ=HOURLY;INTERVAL=1` |\n| 每两小时 | `FREQ=HOURLY;INTERVAL=2` |\n| 每天早上 9 点 | `FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;BYHOUR=9;BYMINUTE=0` |\n| 每周一早上 9 点 | `FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0` |\n| 工作日每天 | `FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9;BYMINUTE=0` |\n\n> ⚠️ OpenClaw 目前只支持 **HOURLY** 和 **WEEKLY** 两种频率，不支持 DAILY / MONTHLY。\n\n## 实战例子\n\n### 例 1：每天早报推送\n\n```toml\nname = \"科技早报\"\nprompt = \"搜索今日科技新闻头条，整理 5 条摘要，通过 QQ 推送给用户\"\nstatus = \"ACTIVE\"\ncwds = [\"/Users/slowdone\"]\n\n[schedule]\nrrule = \"FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=8;BYMINUTE=0\"\n```\n\n### 例 2：每两小时健康检查\n\n```toml\nname = \"服务健康检查\"\nprompt = \"检查本地服务运行状态，如有异常立即通知\"\nstatus = \"ACTIVE\"\ncwds = [\"/Users/slowdone/services\"]\n\n[schedule]\nrrule = \"FREQ=HOURLY;INTERVAL=2\"\n```\n\n## 管理 Automation\n\n在 OpenClaw 对话中，直接用自然语言操作：\n\n```\n\"帮我创建一个每天早上8点的科技早报任务\"\n\"暂停科技早报任务\"\n\"查看所有自动化任务\"\n```\n\nAgent 会自动读写 automation.toml 配置文件。\n\n---\n"
  },
  {
    "id": "5",
    "title": "OpenClaw 工作记忆系统：让 Agent 跨会话记住你",
    "summary": "默认情况下 Agent 每次对话都是从零开始的。通过 OpenClaw 的工作记忆系统，你可以让 Agent 记住你的偏好、项目上下文和重要决策，打造真正有\"记忆\"的 AI 助手。",
    "tags": [
      "工作记忆",
      "OpenClaw",
      "进阶技巧"
    ],
    "date": "2026-03-05",
    "readTime": 7,
    "category": "tech",
    "coverColor": "from-purple-400 to-pink-400",
    "status": "published" as const,
    "content": "# OpenClaw 工作记忆系统\n\n## 为什么需要记忆？\n\n没有记忆的 Agent 就像每天早上起床都忘了自己是谁——每次都要重新自我介绍，效率极低。\n\nOpenClaw 的工作记忆系统通过 Markdown 文件实现跨会话的上下文持久化。\n\n## 记忆文件结构\n\n```\n{项目}/.workbuddy/memory/\n├── MEMORY.md          # 长期记忆（精炼的核心信息）\n├── 2026-03-23.md      # 今日工作日志（按日期）\n├── 2026-03-22.md\n└── ...\n```\n\n## MEMORY.md：长期记忆\n\n存放跨越多天都有价值的信息：\n\n```markdown\n# 项目偏好\n\n## 技术栈偏好\n- 前端：React + TypeScript + Tailwind CSS\n- 后端：Python FastAPI\n- 数据库：PostgreSQL\n\n## 重要约定\n- 代码注释使用中文\n- Git commit 信息格式：type(scope): description\n\n## 已知配置\n- OpenClaw AppID: 1903506261\n- QQ 推送目标: openid B7F7B394...\n```\n\n## 日志文件：短期记忆\n\n每天的工作记录，追加写入：\n\n```markdown\n# 2026-03-23\n\n## 14:30 完成博客网站开发\n- 项目路径：~/WorkBuddy/lobster-blog\n- 技术栈：React + Vite + Tailwind\n- 已启动 dev server: http://localhost:5173\n\n## 15:00 修复主题描述\n- 将博客主题从\"水产养殖\"改为\"OpenClaw 技术博客\"\n```\n\n## Agent 读写记忆的时机\n\n**读取时机**：\n- 会话开始时，任务涉及历史上下文\n- 回答\"上次做了什么\"类问题前\n\n**写入时机**：\n- 完成一项实质性工作后\n- 用户告知重要偏好或约定\n- 做出重要技术决策后\n\n## 实用技巧\n\n告诉 Agent 记住某件事：\n\n```\n\"记住：我的数据库密码存在 ~/.env 文件里，不要直接写在代码中\"\n\"记住：这个项目用 pnpm 而不是 npm\"\n```\n\nAgent 会将其写入 MEMORY.md，下次自动读取。\n\n---\n\n*记忆系统是让 OpenClaw Agent 越用越顺手的关键。好好利用它！*\n"
  },
  {
    "id": "post-1774322390982",
    "title": "OpenClaw  AI Agent 赚钱思路与案例",
    "summary": "OpenClaw 是一个开源的 AI 代理平台，允许用户：\n- 部署自己的 AI 助手（基于 Claude、GPT 等）\n- 连接多种通讯渠道（微信、QQ、Telegram、Discord、飞书等）\n- 自动化处理日常任务\n- 构建可扩展的 AI 服务",
    "content": "# OpenClaw / AI Agent 赚钱思路与案例\n\n**日期**: 2026-03-24 \n**主题**: 使用 OpenClaw 及 AI 代理技术赚钱的 20 种方式\n\n---\n\n## 🚀 OpenClaw 简介\n\nOpenClaw 是一个开源的 AI 代理平台，允许用户：\n- 部署自己的 AI 助手（基于 Claude、GPT 等）\n- 连接多种通讯渠道（QQ、Telegram、Discord、飞书等）\n- 自动化处理日常任务\n- 构建可扩展的 AI 服务\n\n---\n\n## 💰 20 条 OpenClaw / AI Agent 赚钱思路\n\n### 一、内容创作与营销（1-5）\n\n1. **AI 自媒体运营**\n   - 使用 OpenClaw 管理多个社交平台账号\n   - 自动生成每日热点内容、图文、短视频脚本\n   - 变现：平台流量分成、广告收入\n\n2. **SEO 内容工厂**\n   - 批量生成 SEO 优化文章\n   - 自动发布到 WordPress/微信公众号\n   - 变现：联盟营销、广告点击\n\n3. **AI 新闻简报服务**\n   - 每日自动收集特定领域新闻\n   - 生成摘要并推送给付费订阅用户\n   - 变现：订阅费（$5-50/月）\n\n4. **自动化的社媒营销**\n   - 管理客户的小红书/抖音/微博账号\n   - 自动回复评论、私信、发布内容\n   - 变现：月度代运营费（¥3000-20000/月）\n\n5. **AI 文案代写服务**\n   - 接单后使用 AI 快速生成文案\n   - 涵盖：广告语、产品描述、邮件营销\n   - 变现：按件计费（¥50-500/篇）\n\n### 二、客服与咨询（6-10）\n\n6. **智能客服外包**\n   - 为中小电商搭建 AI 客服系统\n   - 7×24 小时自动回复客户咨询\n   - 变现：系统搭建费 + 月度维护费\n\n7. **AI 法律咨询助手**\n   - 基于法律知识库回答常见问题\n   - 辅助律师处理简单案件\n   - 变现：按咨询次数或包月收费\n\n8. **医疗健康咨询**\n   - 提供基础健康知识问答\n   - 提醒用药、预约、健康监测\n   - 变现：会员制（需注意合规）\n\n9. **教育辅导助手**\n   - 解答学生作业问题\n   - 提供个性化学习计划\n   - 变现：课程订阅、一对一辅导\n\n10. **心理咨询陪伴**\n    - 提供情感支持、倾听服务\n    - 辅助心理健康管理\n    - 变现：按时长计费\n\n### 三、技术开发（11-15）\n\n11. **AI 自动化工作流开发**\n    - 为企业定制自动化流程\n    - 整合多个 SaaS 工具（Notion、飞书、钉钉）\n    - 变现：项目开发费（¥5000-50000）\n\n12. **定制化 OpenClaw 技能开发**\n    - 开发特定领域的 Skill（技能包）\n    - 如：财务分析、代码审查、设计辅助\n    - 变现：技能包销售（$10-100/个）\n\n13. **AI 编程助手服务**\n    - 协助开发者写代码、Debug\n    - 代码审查、重构建议\n    - 变现：按小时计费（$50-200/小时）\n\n14. **自动化数据分析**\n    - 自动收集、清洗、分析数据\n    - 生成可视化报表\n    - 变现：报表定制服务\n\n15. **网站/App 自动化测试**\n    - 使用 AI 进行 UI 测试\n    - 自动生成测试报告\n    - 变现：测试服务外包\n\n### 四、电商与交易（16-20）\n\n16. **AI 选品与定价**\n    - 自动分析市场趋势\n    - 推荐热门商品、优化定价\n    - 变现：咨询服务费\n\n17. **跨境电商自动化**\n    - 自动翻译商品描述\n    - 处理多语言客服\n    - 变现：店铺运营分成\n\n18. **加密货币交易助手**\n    - 分析市场数据、新闻情绪\n    - 提供交易建议（需声明非投资建议）\n    - 变现：订阅费、交易分成\n\n19. **股票财经资讯服务**\n    - 每日盘前盘后分析\n    - 自动监控持仓股票\n    - 变现：VIP 群组订阅\n\n20. **AI 简历优化服务**\n    - 自动分析职位 JD\n    - 针对性优化简历\n    - 变现：按份收费（¥100-500/份）\n\n---\n\n## 📊 变现模式总结\n\n| 模式 | 难度 | 收入潜力 | 推荐度 |\n|------|------|----------|--------|\n| 内容创作 | ⭐⭐ | 💰💰 | ⭐⭐⭐⭐ |\n| 客服外包 | ⭐⭐⭐ | 💰💰💰 | ⭐⭐⭐⭐ |\n| 技能开发 | ⭐⭐⭐⭐ | 💰💰💰💰 | ⭐⭐⭐ |\n| 自动化工作流 | ⭐⭐⭐ | 💰💰💰💰 | ⭐⭐⭐⭐⭐ |\n| 咨询服务 | ⭐⭐ | 💰💰💰 | ⭐⭐⭐⭐ |\n\n---\n\n## 🛠️ OpenClaw 相关技能推荐\n\n1. **content-recycler** - 内容跨平台转换\n2. **wechat-article-writer** - 公众号文章自动写作\n3. **automation-workflows** - 自动化工作流设计\n4. **market-research** - 市场调研分析\n5. **copywriting** - 文案撰写\n\n---\n\n## ⚠️ 注意事项\n\n1. **合规性**：部分领域（医疗、法律、金融）需要相关资质\n2. **AI 局限性**：需要人工审核和兜底\n3. **隐私保护**：处理用户数据需遵守相关法规\n4. **服务质量**：初期可低价获客，逐步提升价格\n\n---\n\n## 🔗 相关资源\n\n- **OpenClaw GitHub**: https://github.com/openclaw/openclaw\n- **OpenClaw 文档**: https://docs.openclaw.ai\n- **技能市场**: https://clawhub.com\n\n---\n\n*整理日期: 2026-03-24*  \n*标签: #OpenClaw #AI赚钱 #自动化 #副业 #创业*",
    "date": "2026-03-24",
    "tags": [],
    "category": "tech",
    "status": "published" as const,
    "readTime": 2,
    "relatedPostIds": [
      "1",
      "2",
      "5"
    ]
  }
];
