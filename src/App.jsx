import { useState } from "react";
import { Sparkles, Database, Image, Code, Menu, ChevronLeft, Terminal, MessageSquare, FileCode, FileText, Network } from "lucide-react";
import JsonFormatter from "./components/JsonFormatter";
import SqlFormatter from "./components/SqlFormatter";
import Base64ImagePreview from "./components/Base64ImagePreview";
import XmlFormatter from "./components/XmlFormatter";
import BashConverter from "./components/BashConverter";
import ConversationVisualizer from "./components/ConversationVisualizer";
import HtmlPreview from "./components/HtmlPreview";
import MarkdownPreview from "./components/MarkdownPreview";
import MermaidVisualizer from "./components/MermaidVisualizer";

function App() {
  const [activeTab, setActiveTab] = useState("json");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toolGroups = [
    {
      category: "Formatters",
      tools: [
        {
          id: "json",
          name: "JSON Formatter",
          icon: Sparkles,
          component: JsonFormatter,
          color: "text-blue-400",
        },
        {
          id: "sql",
          name: "SQL Formatter",
          icon: Database,
          component: SqlFormatter,
          color: "text-green-400",
        },
        {
          id: "xml",
          name: "XML Formatter",
          icon: Code,
          component: XmlFormatter,
          color: "text-orange-400",
        },
      ],
    },
    {
      category: "Previews",
      tools: [
        {
          id: "base64",
          name: "Base64 Preview",
          icon: Image,
          component: Base64ImagePreview,
          color: "text-purple-400",
        },
        {
          id: "html",
          name: "HTML Preview",
          icon: FileCode,
          component: HtmlPreview,
          color: "text-yellow-400",
        },
        {
          id: "markdown",
          name: "Markdown Preview",
          icon: FileText,
          component: MarkdownPreview,
          color: "text-indigo-400",
        },
      ],
    },
    {
      category: "Converters",
      tools: [
        {
          id: "bash",
          name: "Bash Converter",
          icon: Terminal,
          component: BashConverter,
          color: "text-cyan-400",
        },
      ],
    },
    {
      category: "Visualizers",
      tools: [
        {
          id: "conversation",
          name: "Conver. Visualizer",
          icon: MessageSquare,
          component: ConversationVisualizer,
          color: "text-pink-400",
        },
        {
          id: "mermaid",
          name: "Mermaid Diagram",
          icon: Network,
          component: MermaidVisualizer,
          color: "text-teal-400",
        },
      ],
    },
  ];

  const allTools = toolGroups.flatMap((group) => group.tools);

  const ActiveComponent =
    allTools.find((tool) => tool.id === activeTab)?.component || JsonFormatter;

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5F7C87] rounded-full mix-blend-normal filter blur-[128px] opacity-20 animate-breathe"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#5F7C87] rounded-full mix-blend-normal filter blur-[128px] opacity-20 animate-breathe"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } glass-dark transition-all duration-300 overflow-hidden flex flex-col relative z-10`}
      >
        <div className="p-6 border-b border-[#5F7C87]/20">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#64bee0] to-[#ffffff] bg-clip-text text-transparent">
            Dev Toolset
          </h1>
          <p className="text-sm text-gray-400 mt-1">Offline Developer Tools</p>
        </div>

        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {toolGroups.map((group) => (
            <div key={group.category}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                {group.category}
              </div>
              <div className="space-y-1">
                {group.tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTab(tool.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                        activeTab === tool.id
                          ? "glass text-white shadow-lg shadow-[#5F7C87]/50 tool-selected"
                          : "text-gray-500 hover:glass hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          activeTab === tool.id ? "text-[#5F7C87]" : ""
                        }`}
                      />
                      <span className="font-medium text-sm">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#5F7C87]/20">
          <div className="text-xs text-gray-500 text-center">
            v1.0.0 • Built with React + Vite
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="glass-dark border-b border-[#5F7C87]/20 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-[#5F7C87] transition-colors p-2 hover:bg-[#5F7C87]/10 rounded-lg"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">
              {allTools.find((tool) => tool.id === activeTab)?.name ||
                "Developer Tools"}
            </h2>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto h-full">
            <ActiveComponent />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
