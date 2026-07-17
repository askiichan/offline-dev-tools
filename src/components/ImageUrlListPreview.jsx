import { useMemo, useState } from 'react';
import { Images, Copy, Check, Trash2, AlertCircle, ExternalLink } from 'lucide-react';

const SAMPLE_URLS = [
  'https://lh3.googleusercontent.com/a/ACg8ocJuH0M-BADtq3qfB--fnrgMKhYNUKpaLc02fkkjSBSk-4Es8zI=s96-c',
  'https://lh3.googleusercontent.com/a/ACg8ocJ9YTxOTG0Rx0bitSskpJ5ZeAUoLO3vqsb0KEzYoPxA3wOdFg=s96-c',
  'https://lh3.googleusercontent.com/a/ACg8ocJLMhjHYaiMF0yLMbVapzKHwSBum68cz4d9ROuyVBEVoS9FnQ=s96-c',
  'https://lh3.googleusercontent.com/a/ACg8ocK5fbJpgGtNYngGe6riCqp69xqAsHKeLTftU_Vx1K224ohMfJw=s96-c',
  'https://lh3.googleusercontent.com/a/ACg8ocIxg6cG4HEro90qUWNDXlO9yul6wSuv3hf4A8W5VInIJ4cJCA=s96-c',
  'https://lh3.googleusercontent.com/a/ACg8ocJYpgVnwMSKfm6uin_nJFpV_S-DHQas5nrE71adCXaeboo5Ag=s96-c',
].join('\n');

function isImageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'data:';
  } catch {
    return false;
  }
}

export default function ImageUrlListPreview() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [failedUrls, setFailedUrls] = useState(new Set());

  const imageUrls = useMemo(() => {
    if (!input.trim()) return [];
    return input
      .split(/[\n\r,;]+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter(isImageUrl);
  }, [input]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setFailedUrls(new Set());
  };

  const loadSample = () => {
    setInput(SAMPLE_URLS);
    setFailedUrls(new Set());
  };

  const clearInput = () => {
    setInput('');
    setFailedUrls(new Set());
  };

  const copyUrls = async () => {
    try {
      await navigator.clipboard.writeText(imageUrls.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy errors
    }
  };

  const handleImageError = (url) => {
    setFailedUrls((prev) => new Set(prev).add(url));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Images className="w-6 h-6 text-[#5F7C87]" />
          Image URL Preview
        </h2>
        <p className="text-gray-400">Paste a list of image URLs and preview them instantly</p>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={loadSample}
          className="glass-dark text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          Load Sample
        </button>
        {input && (
          <button
            onClick={clearInput}
            className="flex items-center gap-2 glass-dark text-gray-400 hover:text-red-400 px-4 py-2 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Input Section */}
        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">Image URLs</label>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Paste one or more image URLs here, separated by new lines, commas, or semicolons..."
            className="flex-1 glass-dark text-gray-100 rounded-xl m-1 p-4 font-mono text-sm border-2 border-gray-700 focus:outline-none resize-none placeholder-gray-600"
          />
          <div className="mt-2 text-xs text-gray-500">
            Supports http, https, and data URIs
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-[#5F7C87]">
              Preview {imageUrls.length > 0 && `(${imageUrls.length})`}
            </label>
            {imageUrls.length > 0 && (
              <button
                onClick={copyUrls}
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
                    Copy URLs
                  </>
                )}
              </button>
            )}
          </div>

          {imageUrls.length > 0 ? (
            <div className="flex-1 overflow-auto glass-dark rounded-xl m-1 p-4 border-2 border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-black/30 border border-gray-700/50 overflow-hidden"
                  >
                    {failedUrls.has(url) ? (
                      <div className="flex flex-col items-center justify-center w-full aspect-square text-center text-gray-500 gap-2">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                        <span className="text-xs px-2 break-words">Could not load</span>
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="max-w-full max-h-40 object-contain rounded-lg"
                        onError={() => handleImageError(url)}
                        loading="lazy"
                      />
                    )}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={url}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#5F7C87] truncate w-full max-w-full"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{url}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 glass-dark rounded-xl flex flex-col items-center justify-center text-gray-500 m-1">
              <Images className="w-16 h-16 mx-auto mb-4 opacity-50 text-[#5F7C87]/30" />
              <p>Image previews will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
