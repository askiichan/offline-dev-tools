import { useState, useEffect, useRef } from "react";
import {
  Image,
  AlertCircle,
  Upload,
  Copy,
  Check,
  ArrowLeftRight,
} from "lucide-react";

export default function Base64ImagePreview() {
  const [mode, setMode] = useState("decode"); // 'decode' or 'encode'
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Base64 to Image (decode mode)
  useEffect(() => {
    if (mode !== "decode") return;

    if (!input.trim()) {
      setImageUrl("");
      setError("");
      return;
    }

    try {
      let base64String = input.trim();

      // Auto-detect if data URI prefix is missing
      if (!base64String.startsWith("data:image/")) {
        // Try to detect image type from base64 signature
        const signatures = {
          "/9j/": "jpeg",
          iVBORw0KGgo: "png",
          R0lGOD: "gif",
          UklGR: "webp",
        };

        let detectedType = "png"; // default
        for (const [sig, type] of Object.entries(signatures)) {
          if (base64String.startsWith(sig)) {
            detectedType = type;
            break;
          }
        }

        base64String = `data:image/${detectedType};base64,${base64String}`;
      }

      // Test if it's a valid image by creating an Image object
      const img = new window.Image();
      img.onload = () => {
        setImageUrl(base64String);
        setError("");
      };
      img.onerror = () => {
        setError("Invalid Base64 image string");
        setImageUrl("");
      };
      img.src = base64String;
    } catch (err) {
      setError("Invalid Base64 string");
      setImageUrl("");
    }
  }, [input, mode]);

  // Handle file upload for Image to Base64 (encode mode)
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setImageUrl(base64);
      setOutput(base64);
      setError("");
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const toggleMode = () => {
    setMode(mode === "decode" ? "encode" : "decode");
    setInput("");
    setOutput("");
    setImageUrl("");
    setError("");
    setCopied(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Image className="w-6 h-6 text-[#5F7C87]" />
            Base64 Image Converter
          </h2>
          <button
            onClick={toggleMode}
            className="flex items-center gap-2 px-4 py-2 bg-[#5F7C87] hover:bg-[#4a6370] text-white rounded-lg transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            {mode === "decode" ? "Switch to Encode" : "Switch to Decode"}
          </button>
        </div>
        <p className="text-gray-400">
          {mode === "decode"
            ? "Paste Base64 string to preview the image"
            : "Upload an image to convert to Base64"}
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Input Section */}
        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">
            {mode === "decode" ? "Base64 String" : "Image Upload"}
          </label>

          {mode === "decode" ? (
            <>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your Base64 encoded image string here..."
                className="flex-1 glass-dark text-gray-100 rounded-xl m-1 p-4 font-mono text-sm border-2 border-gray-700 focus:outline-none resize-none placeholder-gray-600"
              />
              <div className="mt-2 text-xs text-gray-500">
                Supports data URI format or raw Base64 string (auto-detected)
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="glass-dark border-2 border-dashed border-gray-600 hover:border-[#5F7C87] rounded-xl p-8 transition-colors flex flex-col items-center justify-center gap-4 cursor-pointer"
              >
                <Upload className="w-12 h-12 text-[#5F7C87]" />
                <div className="text-center">
                  <p className="text-gray-300 font-medium">
                    Click to upload image
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    PNG, JPG, GIF, WebP supported
                  </p>
                </div>
              </button>

              {output && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#5F7C87]">
                      Base64 Output
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#5F7C87] hover:bg-[#4a6370] text-white text-sm rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={output}
                    readOnly
                    className="flex-1 glass-dark text-gray-100 rounded-xl p-4 font-mono text-sm border-2 border-gray-700 resize-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">
            Preview
          </label>

          {error && (
            <div className="glass-dark border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 backdrop-blur-xl">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {imageUrl && !error && (
            <div className="flex-1 glass-dark rounded-xl m-1 p-2 border-2 border-gray-700 overflow-auto">
              <div className="flex items-center justify-center min-h-full">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg shadow-2xl shadow-[#5F7C87]/20"
                />
              </div>
            </div>
          )}

          {!imageUrl && !error && (
            <div className="flex-1 glass-dark rounded-xl flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Image className="w-16 h-16 mx-auto mb-4 opacity-50 text-[#5F7C87]/30" />
                <p>
                  {mode === "decode"
                    ? "Image preview will appear here"
                    : "Upload an image to see preview"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
