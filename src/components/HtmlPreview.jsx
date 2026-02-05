import { useState, useEffect } from 'react';
import { FileCode, Copy, Check, RefreshCw } from 'lucide-react';

export default function HtmlPreview() {
  const [input, setInput] = useState('');
  const [placeholders, setPlaceholders] = useState({});
  const [copied, setCopied] = useState(false);
  const [detectedPlaceholders, setDetectedPlaceholders] = useState([]);

  useEffect(() => {
    const regex = /\{(\d+)\}/g;
    const matches = [...input.matchAll(regex)];
    const uniquePlaceholders = [...new Set(matches.map(m => m[1]))].sort((a, b) => parseInt(a) - parseInt(b));
    setDetectedPlaceholders(uniquePlaceholders);

    const newPlaceholders = {};
    uniquePlaceholders.forEach(num => {
      if (placeholders[num] !== undefined) {
        newPlaceholders[num] = placeholders[num];
      } else {
        newPlaceholders[num] = `Value ${num}`;
      }
    });
    setPlaceholders(newPlaceholders);
  }, [input]);

  const getRenderedHtml = () => {
    let rendered = input;
    Object.keys(placeholders).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      rendered = rendered.replace(regex, placeholders[key] || '');
    });
    return rendered;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlaceholderChange = (key, value) => {
    setPlaceholders(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetPlaceholders = () => {
    const newPlaceholders = {};
    detectedPlaceholders.forEach(num => {
      newPlaceholders[num] = `Value ${num}`;
    });
    setPlaceholders(newPlaceholders);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <FileCode className="w-6 h-6 text-[#5F7C87]" />
          HTML Preview
        </h2>
        <p className="text-gray-400">Preview HTML code with placeholder support ({'{0}'}, {'{1}'}, etc.)</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Input Section */}
        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">HTML Code</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='<html><body><p>Hello {0}!</p></body></html>'
            className="flex-1 glass-dark text-gray-100 rounded-xl m-1 p-4 font-mono text-sm border-2 border-gray-700 focus:outline-none resize-none placeholder-gray-600"
          />

          {/* Placeholder Controls */}
          {detectedPlaceholders.length > 0 && (
            <div className="mt-4 glass-dark rounded-xl p-4 border-2 border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#5F7C87]">Placeholders</h3>
                <button
                  onClick={resetPlaceholders}
                  className="text-xs text-gray-400 hover:text-[#5F7C87] transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {detectedPlaceholders.map(num => (
                  <div key={num} className="flex items-center gap-2">
                    <label className="text-xs text-gray-400 w-12">{`{${num}}`}</label>
                    <input
                      type="text"
                      value={placeholders[num] || ''}
                      onChange={(e) => handlePlaceholderChange(num, e.target.value)}
                      className="flex-1 bg-black/30 text-gray-100 rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-[#5F7C87] focus:outline-none"
                      placeholder={`Value for {${num}}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {input && (
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
                    Copy HTML
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">Live Preview</label>
          
          {input ? (
            <div className="flex-1 overflow-auto rounded-xl glass-dark m-1 p-4 border-2 border-gray-700">
              <div 
                className="bg-white text-black p-4 rounded-lg min-h-full"
                style={{
                  lineHeight: '1.6',
                }}
                dangerouslySetInnerHTML={{ __html: getRenderedHtml() }}
              />
              <style>{`
                .bg-white p {
                  margin: 1em 0;
                }
                .bg-white div {
                  margin: 0.5em 0;
                }
                .bg-white br {
                  display: block;
                  margin: 0.5em 0;
                  content: "";
                }
              `}</style>
            </div>
          ) : (
            <div className="flex-1 glass-dark rounded-xl flex items-center justify-center text-gray-500">
              HTML preview will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
