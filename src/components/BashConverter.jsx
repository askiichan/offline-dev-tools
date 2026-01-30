import { useState, useEffect } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

export default function BashConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    const timer = setTimeout(() => {
      const singleLine = input
        .split('\n')
        .map(line => line.trim())
        .join(' ')
        .replace(/\\\s+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      setOutput(singleLine);
    }, 300);

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
          <Terminal className="w-6 h-6 text-[#5F7C87]" />
          Bash Command Converter
        </h2>
        <p className="text-gray-400">Convert multi-line bash commands into single-line format</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Input Section */}
        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">Multi-line Command</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="python3 benchmarks/benchmark_serving.py \&#10;    --backend vllm \&#10;    --base-url http://localhost:8000"
            className="flex-1 glass-dark text-gray-100 rounded-xl m-1 p-4 font-mono text-sm border-2 border-gray-700 focus:outline-none resize-none placeholder-gray-600"
          />
        </div>

        {/* Output Section */}
        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">Single-line Output</label>
          
          {output && (
            <div className="flex-1 overflow-auto rounded-xl glass-dark m-1 p-4 border-2 border-gray-700">
              <pre className="text-gray-100 font-mono text-sm whitespace-pre-wrap break-all">
                {output}
              </pre>
            </div>
          )}

          {!output && (
            <div className="flex-1 glass-dark rounded-xl flex items-center justify-center text-gray-500">
              Single-line command will appear here
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
