import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MarkdownToolbar } from './MarkdownToolbar';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  height?: number;
  onImportMarkdown?: (content: string) => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  value, 
  onChange,
  height = 400,
  onImportMarkdown 
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [markdown, setMarkdown] = React.useState(value);
  const [lastSaved, setLastSaved] = React.useState<string>('');
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 当 value prop 改变时，同步更新内部 state
  React.useEffect(() => {
    setMarkdown(value);
  }, [value]);

  // 自动保存草稿到 localStorage
  React.useEffect(() => {
    // 1.5 秒没有编辑后自动保存
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (markdown && markdown !== lastSaved) {
        localStorage.setItem('markdown-draft', markdown);
        setLastSaved(markdown);
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [markdown, lastSaved]);

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

    // 只接受 .md 和 .markdown 文件
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
        
        // 清空 file input，以便重复导入同一文件
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
      // 如果有选中文字，在两端加上标记
      newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    } else {
      // 如果没选中，插入占位符
      newText = markdown.substring(0, start) + before + placeholder + after + markdown.substring(end);
    }

    setMarkdown(newText);
    onChange(newText);

    // 修复光标位置
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
      <MarkdownToolbar onInsert={handleInsert} onImport={handleImportClick} />

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
        />

        {/* 预览区 */}
        <div
          style={{
            flex: '1',
            padding: '16px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            color: '#000000',
            fontSize: '14px',
            lineHeight: '1.6',
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
      </div>
    </div>
  );
};
