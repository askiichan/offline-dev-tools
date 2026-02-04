import { useState } from 'react';
import { MessageSquare, Upload, Trash2, User, Bot } from 'lucide-react';

export default function ConversationVisualizer() {
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState('');

  const handleImport = () => {
    if (!input.trim()) {
      setError('Please paste JSON array data');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      
      if (!Array.isArray(parsed)) {
        setError('Input must be a JSON array');
        return;
      }

      if (parsed.length === 0) {
        setError('Array is empty');
        return;
      }

      const validConversations = parsed.every(
        item => item && typeof item === 'object' && 'role' in item && 'text' in item
      );

      if (!validConversations) {
        setError('Each item must have "role" and "text" properties');
        return;
      }

      setConversations(parsed);
      setError('');
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
      setConversations([]);
    }
  };

  const handleClear = () => {
    setConversations([]);
    setInput('');
    setError('');
  };

  const parseAnalysisBlock = (text) => {
    const analysisRegex = /\[\[ANALYSIS_BLOCK\]\]([\s\S]*?)\[\[\/ANALYSIS_BLOCK\]\]/;
    const match = text.match(analysisRegex);
    
    if (match) {
      return {
        analysis: match[1].trim(),
        message: text.replace(analysisRegex, '').trim()
      };
    }
    
    return { analysis: null, message: text };
  };

  const renderMessage = (conv, index) => {
    const isUser = conv.role === 'user';
    const isModel = conv.role === 'model';
    const { analysis, message } = parseAnalysisBlock(conv.text);

    return (
      <div
        key={index}
        className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#5F7C87] to-[#4A6169] flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}

        <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
          {analysis && (
            <div className="mb-2 glass-dark border border-yellow-500/30 rounded-xl p-3 text-xs font-mono text-yellow-200/80 whitespace-pre-wrap">
              <div className="text-yellow-400 font-semibold mb-1">Analysis Block:</div>
              {analysis}
            </div>
          )}
          
          {message && (
            <div
              className={`rounded-2xl px-4 py-3 ${
                isUser
                  ? 'bg-[#5F7C87] text-white'
                  : 'glass-dark text-gray-100 border border-gray-700'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
            </div>
          )}

          {!message && !analysis && (
            <div className="glass-dark border border-gray-700 rounded-2xl px-4 py-3">
              <p className="text-sm text-gray-500 italic">Empty message</p>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-1 px-2">
            {isUser ? 'User' : 'Model'}
          </div>
        </div>

        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#5F7C87]" />
          Conversation Visualizer
        </h2>
        <p className="text-gray-400">Import JSON array and visualize as conversation UI</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Input Section */}
        <div className="flex-1 lg:w-2/5 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">
            JSON Array Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='[{"role":"user","text":"Hello"},{"role":"model","text":"Hi there!"}]'
            className="flex-1 glass-dark text-gray-100 rounded-xl m-1 p-4 font-mono text-sm border-2 border-gray-700 focus:outline-none resize-none placeholder-gray-600"
          />

          {error && (
            <div className="glass-dark border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mt-4 backdrop-blur-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleImport}
              className="flex-1 bg-[#5F7C87] hover:bg-[#4A6169] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-[#5F7C87]/20 hover:shadow-[#5F7C87]/40 flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Import & Visualize
            </button>
            <button
              onClick={handleClear}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Clear
            </button>
          </div>
        </div>

        {/* Conversation Display Section */}
        <div className="flex-1 lg:w-3/5 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">
            Conversation View ({conversations.length} messages)
          </label>

          <div className="flex-1 overflow-auto rounded-xl glass-dark m-1 p-6 border-2 border-gray-700">
            {conversations.length > 0 ? (
              <div className="space-y-1">
                {conversations.map((conv, index) => renderMessage(conv, index))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No conversation loaded</p>
                <p className="text-sm mt-2">Import a JSON array to visualize the conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
