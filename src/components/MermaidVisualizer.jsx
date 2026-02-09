import { useState, useEffect, useRef } from 'react';
import { Network, Download, Copy, Check, Trash2, Sun, Moon } from 'lucide-react';
import mermaid from 'mermaid';
import { toPng, toJpeg, toSvg } from 'html-to-image';

export default function MermaidVisualizer() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [exportTheme, setExportTheme] = useState('dark');
  const diagramRef = useRef(null);
  const renderCountRef = useRef(0);

  // Always use dark theme config - we'll invert for light mode
  const getThemeConfig = () => {
    return {
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#5F7C87',
        primaryTextColor: '#fff',
        primaryBorderColor: '#64bee0',
        lineColor: '#64bee0',
        secondaryColor: '#4A6169',
        tertiaryColor: '#2d3748',
        background: '#1a1a1a',
        mainBkg: '#2d3748',
        secondBkg: '#1a1a1a',
        textColor: '#e5e7eb',
        border1: '#5F7C87',
        border2: '#64bee0',
        fontFamily: 'ui-monospace, monospace',
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
      securityLevel: 'loose',
    };
  };

  useEffect(() => {
    mermaid.initialize(getThemeConfig('dark'));
  }, []);

  useEffect(() => {
    if (!input.trim()) {
      if (diagramRef.current) {
        diagramRef.current.innerHTML = '';
      }
      setError('');
      return;
    }

    const timer = setTimeout(() => {
      renderDiagram();
    }, 500);

    return () => clearTimeout(timer);
  }, [input, exportTheme]);

  const renderDiagram = async () => {
    if (!input.trim() || !diagramRef.current) return;

    setRendering(true);
    setError('');

    try {
      mermaid.initialize(getThemeConfig());
      
      const cleanInput = input.replace(/```mermaid\n?/g, '').replace(/```\n?$/g, '').trim();
      
      renderCountRef.current += 1;
      const id = `mermaid-diagram-${renderCountRef.current}`;
      
      diagramRef.current.innerHTML = '';
      
      let { svg } = await mermaid.render(id, cleanInput);
      
      if (diagramRef.current) {
        diagramRef.current.innerHTML = svg;
        
        // Apply invert filter for light theme
        const svgElement = diagramRef.current.querySelector('svg');
        if (svgElement) {
          if (exportTheme === 'light') {
            // Set black background so it becomes white when inverted
            svgElement.style.backgroundColor = '#000000';
            svgElement.style.filter = 'invert(1) hue-rotate(180deg)';
          } else {
            svgElement.style.backgroundColor = 'transparent';
            svgElement.style.filter = 'none';
          }
        }
      }
      
      setError('');
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      setError('Invalid Mermaid syntax: ' + err.message);
      if (diagramRef.current) {
        diagramRef.current.innerHTML = '';
      }
    } finally {
      setRendering(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearDiagram = () => {
    setInput('');
    setError('');
    if (diagramRef.current) {
      diagramRef.current.innerHTML = '';
    }
  };

  const downloadDiagram = async (format = 'png') => {
    if (!diagramRef.current || !diagramRef.current.firstChild) {
      alert('No diagram to download');
      return;
    }

    try {
      const svgElement = diagramRef.current.querySelector('svg');
      if (!svgElement) {
        alert('No diagram found');
        return;
      }

      let dataUrl;
      const filename = `mermaid-diagram-${exportTheme}-${Date.now()}`;
      
      // For light mode: SVG already has black bg + invert filter (black→white)
      // For dark mode: use dark background
      // Use high pixel ratio (4x) for sharp exports
      const exportOptions = exportTheme === 'light' 
        ? { quality: 1.0, pixelRatio: 4 }  // Let invert filter handle colors
        : { quality: 1.0, pixelRatio: 4, backgroundColor: '#1a1a1a' };

      switch (format) {
        case 'png':
          dataUrl = await toPng(svgElement, exportOptions);
          downloadFile(dataUrl, `${filename}.png`);
          break;
        case 'jpeg':
          dataUrl = await toJpeg(svgElement, { ...exportOptions, quality: 0.95 });
          downloadFile(dataUrl, `${filename}.jpg`);
          break;
        case 'svg':
          dataUrl = await toSvg(svgElement, exportTheme === 'dark' ? { backgroundColor: '#1a1a1a' } : {});
          downloadFile(dataUrl, `${filename}.svg`);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download diagram: ' + err.message);
    }
  };

  const downloadFile = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  const sampleMermaid = `graph TB
    subgraph "Client Layer"
        WebApp[Web Application<br/>React 18 + TypeScript]
    end
    
    subgraph "API Gateway Layer"
        Gateway[Spring Security<br/>Authentication & Authorization]
    end
    
    subgraph "Backend Services"
        WebService[Spring Boot Application<br/>Java 17]
        UserService[User Management Service]
        JobService[Job Information Service]
    end
    
    subgraph "Data Layer"
        DB[(Oracle Database<br/>HR Schema)]
        Cache[(Caffeine Cache)]
    end
    
    WebApp --> Gateway
    Gateway --> WebService
    WebService --> UserService
    WebService --> JobService
    
    UserService --> DB
    UserService --> Cache
    JobService --> DB
    JobService --> Cache`;

  const loadSample = () => {
    setInput(sampleMermaid);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Network className="w-6 h-6 text-[#5F7C87]" />
          Mermaid Diagram Visualizer
        </h2>
        <p className="text-gray-400">Create and export beautiful diagrams from Mermaid syntax</p>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={loadSample}
          className="glass-dark text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          Load Sample
        </button>
        <button
          onClick={clearDiagram}
          className="glass-dark text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-400">Export Theme:</span>
          <button
            onClick={() => setExportTheme('dark')}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
              exportTheme === 'dark'
                ? 'bg-[#5F7C87] text-white shadow-lg'
                : 'glass-dark text-gray-400 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4" />
            Dark
          </button>
          <button
            onClick={() => setExportTheme('light')}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
              exportTheme === 'light'
                ? 'bg-[#5F7C87] text-white shadow-lg'
                : 'glass-dark text-gray-400 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
            Light
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">Mermaid Syntax</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="graph TD&#10;    A[Start] --> B[Process]&#10;    B --> C[End]"
            className="flex-1 glass-dark text-gray-100 rounded-xl m-1 p-4 font-mono text-sm border-2 border-gray-700 focus:outline-none resize-none placeholder-gray-600"
          />
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
                  Copy Syntax
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
          <label className="text-sm font-semibold text-[#5F7C87] mb-2">
            Diagram Preview {rendering && <span className="text-gray-500 text-xs">(Rendering...)</span>}
          </label>
          
          {error && (
            <div className="glass-dark border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4 backdrop-blur-xl">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-auto rounded-xl glass-dark m-1 p-6 border-2 border-gray-700 flex items-center justify-center">
            {!input.trim() && !error ? (
              <div className="text-gray-500 text-center">
                <Network className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Paste your Mermaid diagram syntax to visualize</p>
              </div>
            ) : (
              <div 
                ref={diagramRef} 
                className="mermaid-container w-full flex items-center justify-center"
                style={{ minHeight: '200px' }}
              />
            )}
          </div>

          {input.trim() && !error && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => downloadDiagram('png')}
                className="flex-1 bg-[#5F7C87] hover:bg-[#4A6169] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#5F7C87]/20 hover:shadow-[#5F7C87]/40 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                PNG
              </button>
              <button
                onClick={() => downloadDiagram('jpeg')}
                className="flex-1 bg-[#5F7C87] hover:bg-[#4A6169] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#5F7C87]/20 hover:shadow-[#5F7C87]/40 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                JPEG
              </button>
              <button
                onClick={() => downloadDiagram('svg')}
                className="flex-1 bg-[#5F7C87] hover:bg-[#4A6169] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#5F7C87]/20 hover:shadow-[#5F7C87]/40 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                SVG
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .mermaid-container svg {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
