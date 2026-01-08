import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    const timer = setTimeout(() => {
      try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        setOutput(formatted);
        setError('');
      } catch (err) {
        setError('Invalid JSON: ' + err.message);
        setOutput('');
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [input]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#5F7C87]" />
          JSON Formatter
        </h2>
        <p className="text-gray-400">Beautify and validate your JSON data</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Input Section */}
        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">Input JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"name": "John", "age": 30}'
            className="flex-1 glass-dark text-gray-100 rounded-xl m-1 p-4 font-mono text-sm border-2 border-gray-700 focus:outline-none resize-none placeholder-gray-600"
          />
        </div>

        {/* Output Section */}
        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">Formatted Output</label>
          
          {error && (
            <div className="glass-dark border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4 backdrop-blur-xl">
              {error}
            </div>
          )}

          {output && (
            <div className="flex-1 overflow-auto rounded-xl glass-dark m-1 p-2 border-2 border-gray-700">
              <SyntaxHighlighter
                language="json"
                style={atomDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: 'transparent',
                  fontSize: '0.875rem',
                }}
              >
                {output}
              </SyntaxHighlighter>
            </div>
          )}

          {!output && !error && (
            <div className="flex-1 glass-dark rounded-xl flex items-center justify-center text-gray-500">
              Formatted JSON will appear here
            </div>
          )}

          {output && (
            <button
              onClick={copyToClipboard}
              className="mt-4 bg-[#5F7C87] hover:bg-[#4A6169] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-[#5F7C87]/20 hover:shadow-[#5F7C87]/40 flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy to Clipboard
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
