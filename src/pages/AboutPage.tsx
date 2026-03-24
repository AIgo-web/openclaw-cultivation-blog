export default function AboutPage() {
  const timeline = [
    { year: '2024.06', title: '初识 AI Agent', desc: '第一次接触 AI Agent 概念，开始研究各种本地化 AI 工具' },
    { year: '2024.09', title: '发现 OpenClaw', desc: '找到 OpenClaw，被它的本地运行 + Skill 扩展体系深深吸引' },
    { year: '2024.11', title: '折腾 QQ Bot', desc: '成功将 OpenClaw Agent 接入 QQ，实现消息推送与智能回复' },
    { year: '2025.01', title: '开始写 Skill', desc: '自己动手写第一个 Skill，逐渐理解 Agent 扩展的完整机制' },
    { year: '2025.06', title: '搭建自动化体系', desc: '用 Automation + QQ Push 构建了完整的个人自动化工作流' },
    { year: '2026.03', title: '创建这个博客', desc: '决定把踩过的坑和积累的经验整理成文章，分享给同样折腾 OpenClaw 的人' },
  ];

  const skills = [
    { name: 'Skill 开发', level: 82 },
    { name: 'QQ Bot 集成', level: 90 },
    { name: 'Automation 配置', level: 85 },
    { name: '工作记忆设计', level: 78 },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile */}
      <section className="mb-12">
        <div className="card p-8 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lobster-400 to-orange-400 flex items-center justify-center text-4xl flex-shrink-0 shadow-lg">
            🦞
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              OpenClaw 折腾人
            </h1>
            <p className="text-lobster-500 dark:text-lobster-400 text-sm font-medium mb-3">
              AI Agent 爱好者 · OpenClaw 深度用户
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              日常靠 OpenClaw 处理各种繁琐任务，热衷于把 AI Agent 接入各种渠道
              和工作流。这个博客记录的是一只<span className="text-lobster-500 font-medium">数字龙虾</span>
              的进化历程——每一个 Skill、每一条 Automation、每一次踩坑，
              都是它成长的痕迹。
            </p>
          </div>
        </div>
      </section>

      {/* About this blog */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-lobster-500 rounded-full inline-block" />
          关于这个博客
        </h2>
        <div className="card p-6">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            <strong className="text-gray-800 dark:text-gray-200">OpenClaw 龙虾养成计划</strong>
            专注于 OpenClaw AI Agent 的使用技巧与深度折腾，内容涵盖：
          </p>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            {[
              '🚀 OpenClaw 安装配置与入门指南',
              '🔌 Skill 开发：从零写一个专属技能包',
              '🤖 QQ Bot / 飞书等渠道集成实战',
              '⏰ Automation 定时任务配置与最佳实践',
              '🧠 工作记忆设计与跨会话上下文管理',
              '🐛 踩坑记录与解决方案备忘',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Skills */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-ocean-500 rounded-full inline-block" />
          OpenClaw 技能掌握度
        </h2>
        <div className="card p-6 space-y-4">
          {skills.map(skill => (
            <div key={skill.name}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{skill.name}</span>
                <span className="text-gray-400 dark:text-gray-500">{skill.level}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-lobster-400 to-orange-400 rounded-full transition-all duration-1000"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-5 bg-green-500 rounded-full inline-block" />
          龙虾进化史
        </h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-6">
            {timeline.map((item, index) => (
              <div key={index} className="relative pl-12">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-white dark:bg-[#1a1d27] border-2 border-lobster-400 flex items-center justify-center text-xs font-bold text-lobster-500 shadow-sm">
                  {index + 1}
                </div>
                <div className="card p-4">
                  <div className="text-xs text-lobster-500 dark:text-lobster-400 font-medium mb-1">
                    {item.year}
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-purple-500 rounded-full inline-block" />
          联系方式
        </h2>
        <div className="card p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            如果你也在玩 OpenClaw，或者有什么折腾心得想交流，欢迎来找我！
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: '🤖', label: 'OpenClaw', value: '通过 QQ Bot 直接对话' },
              { icon: '📝', label: '留言', value: '文章评论区见' },
            ].map(contact => (
              <div
                key={contact.label}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400"
              >
                <span>{contact.icon}</span>
                <span className="font-medium">{contact.label}:</span>
                <span>{contact.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
