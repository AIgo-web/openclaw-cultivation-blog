import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { generateSafeId } from '../utils/toc';

interface MarkdownRendererProps {
  content: string;
}

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-mono transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white select-none"
      title="复制代码"
    >
      {copied ? '✓ 已复制' : '复制'}
    </button>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const preRef = React.useRef<HTMLPreElement>(null);
  return (
    <div className="relative group my-4">
      <pre ref={preRef} className="bg-gray-900 dark:bg-gray-950 rounded-xl p-4 overflow-x-auto text-sm">
        {children}
      </pre>
      <CopyButton getText={() => preRef.current?.innerText || ''} />
    </div>
  );
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  let headingIndex = 0;

  return (
    <div className="markdown-body prose prose-gray dark:prose-dark max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => {
            const id = generateSafeId(String(children), headingIndex++);
            return (
              <h1 id={id} className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 scroll-mt-20">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = generateSafeId(String(children), headingIndex++);
            return (
              <h2 id={id} className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-8 mb-3 flex items-center gap-2 scroll-mt-20">
                <span className="w-1 h-6 bg-lobster-500 rounded-full inline-block" />
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = generateSafeId(String(children), headingIndex++);
            return (
              <h3 id={id} className="text-xl font-semibold text-gray-700 dark:text-gray-200 mt-6 mb-2 scroll-mt-20">
                {children}
              </h3>
            );
          },
          p: ({ children }) => (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed my-4">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-3 text-gray-700 dark:text-gray-300 pl-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-3 text-gray-700 dark:text-gray-300 pl-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-lobster-400 bg-lobster-50 dark:bg-lobster-900/20 pl-4 py-2 my-4 rounded-r-lg italic text-gray-700 dark:text-gray-300">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-800 text-lobster-600 dark:text-lobster-300 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
          tr: ({ children, ...props }) => (
            <tr className="even:bg-gray-50 dark:even:bg-gray-900/50" {...props}>
              {children}
            </tr>
          ),
          hr: () => (
            <hr className="border-gray-200 dark:border-gray-700 my-8" />
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-white">
              {children}
            </strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-lobster-500 hover:text-lobster-700 dark:text-lobster-400 dark:hover:text-lobster-300 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
