import { useState, useEffect } from 'react';
import { FileText, Copy, Check, Eye, Code2 } from 'lucide-react';
import { marked } from 'marked';

export default function MarkdownPreview() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'split'

  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false,
    });
  }, []);

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    const timer = setTimeout(() => {
      try {
        const html = marked.parse(input);
        setOutput(html);
      } catch (err) {
        setOutput('<p style="color: #ef4444;">Error parsing markdown: ' + err.message + '</p>');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleMarkdown = `# Welcome to Markdown Preview

## Features
- **Bold text** and *italic text*
- [Links](https://example.com)
- \`inline code\`
- Lists and more!

### Code Block
\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

> Blockquotes are supported too!

| Table | Support |
|-------|---------|
| Yes   | ✓       |
`;

  const loadSample = () => {
    setInput(sampleMarkdown);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#5F7C87]" />
          Markdown Preview
        </h2>
        <p className="text-gray-400">Write and preview markdown in real-time</p>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setViewMode('preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            viewMode === 'preview'
              ? 'bg-[#5F7C87] text-white shadow-lg'
              : 'glass-dark text-gray-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview Only
        </button>
        <button
          onClick={() => setViewMode('split')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            viewMode === 'split'
              ? 'bg-[#5F7C87] text-white shadow-lg'
              : 'glass-dark text-gray-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Split View
        </button>
        <button
          onClick={loadSample}
          className="ml-auto glass-dark text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          Load Sample
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Input Section */}
        {(viewMode === 'split' || !output) && (
          <div className={`flex-1 ${viewMode === 'split' ? 'lg:w-1/2' : ''} flex flex-col min-h-0`}>
            <label className="text-sm font-semibold text-[#5F7C87] mb-2">Markdown Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="# Start typing markdown here..."
              className="flex-1 glass-dark text-gray-100 rounded-xl m-1 p-4 font-mono text-sm border-2 border-gray-700 focus:outline-none resize-none placeholder-gray-600"
            />
          </div>
        )}

        {/* Preview Section */}
        {output && (
          <div className={`flex-1 ${viewMode === 'split' ? 'lg:w-1/2' : ''} flex flex-col min-h-0`}>
            <label className="text-sm font-semibold text-[#5F7C87] mb-2">Preview</label>
            <div className="flex-1 overflow-auto rounded-xl glass-dark m-1 p-6 border-2 border-gray-700">
              <div
                className="markdown-preview prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: output }}
                style={{
                  color: '#e5e7eb',
                  lineHeight: '1.7',
                }}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-[#5F7C87] hover:bg-[#4A6169] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-[#5F7C87]/20 hover:shadow-[#5F7C87]/40 flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Markdown
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!output && viewMode === 'preview' && (
          <div className="flex-1 glass-dark rounded-xl flex items-center justify-center text-gray-500">
            Markdown preview will appear here
          </div>
        )}
      </div>

      <style jsx>{`
        .markdown-preview h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: #5F7C87;
        }
        .markdown-preview h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: #64bee0;
        }
        .markdown-preview h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: #7dd3fc;
        }
        .markdown-preview p {
          margin-bottom: 1em;
        }
        .markdown-preview ul, .markdown-preview ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        .markdown-preview li {
          margin-bottom: 0.5em;
        }
        .markdown-preview code {
          background-color: rgba(95, 124, 135, 0.2);
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: monospace;
          font-size: 0.9em;
        }
        .markdown-preview pre {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin-bottom: 1em;
        }
        .markdown-preview pre code {
          background-color: transparent;
          padding: 0;
        }
        .markdown-preview blockquote {
          border-left: 4px solid #5F7C87;
          padding-left: 1em;
          margin-left: 0;
          margin-bottom: 1em;
          color: #9ca3af;
          font-style: italic;
        }
        .markdown-preview a {
          color: #64bee0;
          text-decoration: underline;
        }
        .markdown-preview a:hover {
          color: #7dd3fc;
        }
        .markdown-preview table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1em;
        }
        .markdown-preview th, .markdown-preview td {
          border: 1px solid #5F7C87;
          padding: 0.5em;
          text-align: left;
        }
        .markdown-preview th {
          background-color: rgba(95, 124, 135, 0.2);
          font-weight: bold;
        }
        .markdown-preview img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
        }
        .markdown-preview hr {
          border: none;
          border-top: 2px solid #5F7C87;
          margin: 1.5em 0;
        }
        .markdown-preview strong {
          font-weight: bold;
          color: #ffffff;
        }
        .markdown-preview em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
