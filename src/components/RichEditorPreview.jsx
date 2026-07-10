import { useState, useMemo } from 'react';
import { PenLine, Copy, Check, Eye, Code2 } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const SAMPLE = `<h2>Welcome to the Rich Editor</h2>
<p>Type in the <strong>rich text editor</strong> on the left and see the <em>raw HTML</em> output in real-time on the right.</p>
<ul>
  <li>Format text with the toolbar</li>
  <li>Insert links, images, and videos</li>
  <li>Copy the generated HTML with one click</li>
</ul>
<blockquote>This is a blockquote example.</blockquote>`;

export default function RichEditorPreview() {
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'preview'

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => setContent(SAMPLE);

  const clearEditor = () => setContent('');

  const formattedHtml = useMemo(() => {
    if (!content.trim()) return '';
    return content
      .replace(/<p>&nbsp;<\/p>/g, '<p></p>')
      .replace(/&nbsp;/g, ' ')
      .replace(/></g, '>\n<')
      .replace(/^\s+/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }, [content]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <PenLine className="w-6 h-6 text-[#5F7C87]" />
          Rich Editor Preview
        </h2>
        <p className="text-gray-400">Write rich text and see the HTML output in real-time</p>
      </div>

      <div className="flex gap-3 mb-4">
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
          onClick={() => setViewMode('preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            viewMode === 'preview'
              ? 'bg-[#5F7C87] text-white shadow-lg'
              : 'glass-dark text-gray-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          Editor Only
        </button>
        <button
          onClick={loadSample}
          className="ml-auto glass-dark text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          Load Sample
        </button>
        {content && (
          <button
            onClick={clearEditor}
            className="glass-dark text-gray-400 hover:text-red-400 px-4 py-2 rounded-lg transition-all duration-200"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Editor Section */}
        <div
          className={`flex flex-col min-h-0 ${
            viewMode === 'split' ? 'flex-1 lg:w-1/2' : 'flex-1'
          }`}
        >
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">Rich Text Editor</label>
          <div className="flex-1 overflow-auto rounded-xl glass-dark m-1 p-0 border-2 border-gray-700 quill-dark-wrapper">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={MODULES}
              placeholder="Start typing rich text here..."
              style={{ height: '100%' }}
            />
          </div>
        </div>

        {/* HTML Output Section */}
        {viewMode === 'split' && (
          <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[#5F7C87]">HTML Output</label>
              {content && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#5F7C87] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy HTML
                    </>
                  )}
                </button>
              )}
            </div>
            {content ? (
              <pre className="flex-1 overflow-auto glass-dark rounded-xl m-1 p-4 border-2 border-gray-700 text-gray-300 font-mono text-xs whitespace-pre-wrap break-words">
                {formattedHtml}
              </pre>
            ) : (
              <div className="flex-1 glass-dark rounded-xl flex items-center justify-center text-gray-500">
                HTML output will appear here
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
