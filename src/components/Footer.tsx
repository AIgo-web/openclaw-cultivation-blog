export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-16 py-8 bg-white dark:bg-[#1a1d27] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          <span className="text-xl mr-2">🦞</span>
          OpenClaw 龙虾养成计划 · 记录每一次 AI Agent 进化的故事
        </p>
        <p className="text-gray-400 dark:text-gray-600 text-xs mt-2">
          Built with React + TypeScript + Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
