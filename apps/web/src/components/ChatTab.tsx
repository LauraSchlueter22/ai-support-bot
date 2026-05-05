import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertCircle } from "lucide-react";
import { api } from "../lib/api.js";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ documentId: string; excerpt: string }>;
  escalated?: boolean;
};

type Props = {
  tenantId: string;
};

export default function ChatTab({ tenantId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      let fullText = "";

      await api.chat.sendMessage(input, tenantId, conversationId, (chunk) => {
        fullText += chunk;

        let displayText = fullText;
        let sources: Array<{ documentId: string; excerpt: string }> = [];
        let escalated = false;

        const sourcesMatch = fullText.match(/\[SOURCES:(.*?)\]$/s);
        if (sourcesMatch) {
          displayText = fullText.replace(/\[SOURCES:.*?\]$/s, "").trim();
          try {
            sources = JSON.parse(sourcesMatch[1]!);
          } catch {}
        }
        if (fullText.includes("[ESCALATION:]")) {
          escalated = true;
          displayText = displayText.replace(/\[ESCALATION:.*?\]/s, "").trim();
        }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: displayText, sources, escalated }
              : msg,
          ),
        );
      });
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: "Sorry, something went wrong. Please try again.",
              }
            : msg,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-800">
        <h2 className="text-2x1 font-bold text-white">Chat</h2>
        <p className="text-gray-400 mt-1">Test your support bot</p>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot size={48} className="text-gray-700 mb-4" />
            <p className="text-gray-400 font-medium">
              Ask your support bot anything
            </p>
            <p className="text-gray-600 text-sm mt-1">
              It will answer based on your uploaded documents
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === "user" ? "bg-blue-600" : "bg-gray-800"
                }`}
              >
                {message.role === "user" ? (
                  <User size={16} className="text-white" />
                ) : (
                  <Bot size={16} className="text-gray-400" />
                )}
              </div>
              <div
                className={`flex flex-col gap-2 max-w-[75%] ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-gray-900 border border-gray-800 text-gray-100 rounded-tl-sm"
                  }`}
                >
                  {message.content || (
                    <span className="flex gap-1">
                      <span
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                  )}
                </div>
                {message.escalated && (
                  <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2">
                    <AlertCircle size={14} className="text-yellow-400" />
                    <p className="text-yellow-400 text-xs">
                      This may need human support
                    </p>
                  </div>
                )}

                {message.sources && message.sources.length > 0 && (
                  <div className="space-y-1">
                    {message.sources.map((source, i) => (
                      <div
                        key={i}
                        className="bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2"
                      >
                        <p className="text-gray-500 text-xs">
                          Source: {source.excerpt}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-8 py-6 border-t border-gray-800">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            rows={1}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-x1 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-2">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
