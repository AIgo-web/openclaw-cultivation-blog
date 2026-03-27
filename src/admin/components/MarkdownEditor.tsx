import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { MarkdownToolbar } from './MarkdownToolbar';
import { Undo2, Redo2, Keyboard } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  height?: number;
  onImportMarkdown?: (content: string) => void;
  htmlPreview?: string; // 可选的 HTML 预览内容
}

interface HistoryState {
  content: string;
  timestamp: number;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = 400,
  onImportMarkdown,
  htmlPreview
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [markdown, setMarkdown] = useState(value);
  const [lastSaved, setLastSaved] = useState<string>('');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // 历史记录
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 当 value prop 改变时，同步更新内部 state
  useEffect(() => {
    setMarkdown(value);
  }, [value]);

  // 当 htmlPreview 变化时，设置 iframe 内容
  useEffect(() => {
    if (htmlPreview && iframeRef.current) {
      iframeRef.current.srcdoc = htmlPreview;
    }
  }, [htmlPreview]);

  // 添加到历史记录
  const addToHistory = useCallback((content: string) => {
    const newState = { content, timestamp: Date.now() };
    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), newState];
      // 限制历史记录数量
      return newHistory.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // 撤销
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const newContent = history[newIndex].content;
      setMarkdown(newContent);
      onChange(newContent);
    }
  }, [history, historyIndex, onChange]);

  // 重做
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const newContent = history[newIndex].content;
      setMarkdown(newContent);
      onChange(newContent);
    }
  }, [history, historyIndex, onChange]);

  // 自动保存草稿到 localStorage
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (markdown && markdown !== lastSaved) {
        localStorage.setItem('markdown-draft', markdown);
        setLastSaved(markdown);
        addToHistory(markdown);
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [markdown, lastSaved, addToHistory]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否在编辑器中
      if (!textareaRef.current?.contains(document.activeElement)) return;

      const isMod = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd + S - 保存草稿
      if (isMod && e.key === 's') {
        e.preventDefault();
        localStorage.setItem('markdown-draft', markdown);
        setLastSaved(markdown);
        addToHistory(markdown);
        return;
      }

      // Ctrl/Cmd + Z - 撤销
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Ctrl/Cmd + Shift + Z / Ctrl + Y - 重做
      if ((isMod && e.shiftKey && e.key === 'z') || (isMod && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Ctrl/Cmd + B - 加粗
      if (isMod && e.key === 'b') {
        e.preventDefault();
        handleInsert('**', '**', '粗体文字');
        return;
      }

      // Ctrl/Cmd + I - 斜体
      if (isMod && e.key === 'i') {
        e.preventDefault();
        handleInsert('*', '*', '斜体文字');
        return;
      }

      // Ctrl/Cmd + K - 链接
      if (isMod && e.key === 'k') {
        e.preventDefault();
        handleInsert('[', '](url)', '链接文字');
        return;
      }

      // Ctrl/Cmd + ` - 行内代码
      if (isMod && e.key === '`') {
        e.preventDefault();
        handleInsert('`', '`', '代码');
        return;
      }

      // Ctrl/Cmd + Shift + C - 代码块
      if (isMod && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handleInsert('\n```\n', '\n```\n', '代码块内容');
        return;
      }

      // Tab - 缩进
      if (e.key === 'Tab') {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newContent = markdown.substring(0, start) + '  ' + markdown.substring(end);
          setMarkdown(newContent);
          onChange(newContent);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
          }, 0);
        }
        return;
      }

      // Ctrl/Cmd + / - 注释/反注释
      if (isMod && e.key === '/') {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const selectedLines = markdown.substring(start, end).split('\n');
          const newLines = selectedLines.map(line => {
            if (line.trim().startsWith('<!--') && line.trim().endsWith('-->')) {
              return line.replace(/^(\s*)<!--\s*/, '').replace(/\s*-->$/, '');
            }
            return `<!-- ${line} -->`;
          });
          const newContent = markdown.substring(0, start) + newLines.join('\n') + markdown.substring(end);
          setMarkdown(newContent);
          onChange(newContent);
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [markdown, onChange, handleUndo, handleRedo, addToHistory]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMarkdown(newValue);
    onChange(newValue);
  };

  /**
   * 处理 Markdown 文件导入
   */
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      alert('请选择 Markdown 文件（.md 或 .markdown）');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setMarkdown(content);
        onChange(content);
        onImportMarkdown?.(content);
        addToHistory(content);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Failed to read file:', error);
        alert('文件读取失败');
      }
    };
    reader.onerror = () => {
      alert('文件读取失败');
    };
    reader.readAsText(file);
  };

  /**
   * 触发文件选择对话框
   */
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * 在 textarea 中插入 Markdown 语法
   */
  const handleInsert = (before: string, after: string, placeholder: string = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    
    let newText: string;
    if (selectedText) {
      newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    } else {
      newText = markdown.substring(0, start) + before + placeholder + after + markdown.substring(end);
    }

    setMarkdown(newText);
    onChange(newText);
    addToHistory(newText);

    setTimeout(() => {
      if (selectedText) {
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + selectedText.length;
      } else {
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + placeholder.length;
      }
      textarea.focus();
    }, 0);
  };

  const shortcuts = [
    { key: 'Ctrl/Cmd + S', desc: '保存草稿' },
    { key: 'Ctrl/Cmd + Z', desc: '撤销' },
    { key: 'Ctrl/Cmd + Y', desc: '重做' },
    { key: 'Ctrl/Cmd + B', desc: '加粗' },
    { key: 'Ctrl/Cmd + I', desc: '斜体' },
    { key: 'Ctrl/Cmd + K', desc: '插入链接' },
    { key: 'Ctrl/Cmd + `', desc: '行内代码' },
    { key: 'Tab', desc: '缩进' },
  ];

  return (
    <div 
      className="markdown-editor flex flex-col"
      style={{
        height: `${height}px`,
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />

      {/* 工具栏 */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-1">
          <MarkdownToolbar onInsert={handleInsert} onImport={handleImportClick} />
        </div>
        <div className="flex items-center gap-2">
          {/* 历史记录按钮 */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="撤销 (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="重做 (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Redo2 className="w-4 h-4 text-gray-600" />
          </button>
          {/* 快捷键提示 */}
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            title="快捷键"
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
          >
            <Keyboard className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 快捷键提示浮层 */}
      {showShortcuts && (
        <div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {shortcuts.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono text-blue-600">
                  {s.key}
                </kbd>
                <span className="text-gray-600">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 编辑器主体 */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* 编辑区 */}
        <textarea
          ref={textareaRef}
          value={markdown}
          onChange={handleChange}
          style={{
            flex: '1',
            padding: '16px',
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#000000',
            backgroundColor: '#ffffff',
            border: 'none',
            borderRight: '1px solid #ddd',
            caretColor: '#000000',
            resize: 'none',
            outline: 'none',
          }}
          placeholder="在这里写 Markdown..."
          spellCheck={false}
        />

        {/* 预览区 */}
        <div
          style={{
            flex: '1',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {htmlPreview ? (
            // HTML 预览
            <iframe
              ref={iframeRef}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block'
              }}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              title="HTML 预览"
            />
          ) : (
            // Markdown 预览
            <div
              style={{
                padding: '16px',
                overflowY: 'auto',
                color: '#000000',
                fontSize: '14px',
                lineHeight: '1.6',
                height: '100%',
              }}
            >
              <ReactMarkdown
                components={{
                  h1: (props) => <h1 style={{ color: '#000', marginTop: '1em', marginBottom: '0.5em', fontWeight: 'bold', fontSize: '1.6em' }} {...props} />,
                  h2: (props) => <h2 style={{ color: '#000', marginTop: '1em', marginBottom: '0.5em', fontWeight: 'bold', fontSize: '1.4em' }} {...props} />,
                  h3: (props) => <h3 style={{ color: '#000', marginTop: '1em', marginBottom: '0.5em', fontWeight: 'bold', fontSize: '1.2em' }} {...props} />,
                  p: (props) => <p style={{ color: '#000', marginBottom: '1em' }} {...props} />,
                  strong: (props) => <strong style={{ color: '#000', fontWeight: 'bold' }} {...props} />,
                  em: (props) => <em style={{ color: '#000', fontStyle: 'italic' }} {...props} />,
                  code: (props) => <code style={{ color: '#000', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }} {...props} />,
                  pre: (props) => <pre style={{ color: '#000', backgroundColor: '#f0f0f0', padding: '12px', borderRadius: '4px', overflowX: 'auto' }} {...props} />,
                  ul: (props) => <ul style={{ color: '#000', marginLeft: '1.5em', marginBottom: '1em' }} {...props} />,
                  ol: (props) => <ol style={{ color: '#000', marginLeft: '1.5em', marginBottom: '1em' }} {...props} />,
                  li: (props) => <li style={{ color: '#000', marginBottom: '0.5em' }} {...props} />,
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
