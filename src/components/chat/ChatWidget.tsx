"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Cách chi tiêu hợp lý",
  "Phân tích các mã cổ phiếu việt nam tiềm năng",
  "Cách lập ngân sách tiết kiệm tối ưu",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Chào anh/chị 👋 Mình cần hỗ trợ về vấn đề gì ạ?",
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const hasUserMessage = messages.some((m) => m.role === "user");
  const showSuggestions = !hasUserMessage && !loading;

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }, 0);
    return () => clearTimeout(t);
  }, [open, messages, loading]);

  const sendText = async (textRaw: string) => {
    const text = (textRaw || "").trim();
    if (!text || loading) return;

    const nextMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: String(data?.text || "") },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Xin lỗi, mình bị lỗi: ${e?.message || "unknown"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const send = () => sendText(input);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[9999] h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-lg"
        aria-label="Open chatbot"
        title="Chatbot"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Overlay + Panel */}
      {open && (
        <div className="fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          <div className="absolute bottom-5 right-5 w-[92vw] max-w-[420px] h-[70vh] max-h-[620px] bg-[#0b0b0d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="font-semibold text-white">Trợ lý AI</div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white"
                aria-label="Close chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-green-600 text-white"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {/* Suggestions (chỉ hiện khi chưa có user hỏi) */}
              {showSuggestions && (
                <div className="pt-2">
                  <div className="text-xs text-white/60 mb-2">
                    Gợi ý câu hỏi nhanh:
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendText(q)}
                        className="px-3 py-2 rounded-full text-sm bg-white/10 hover:bg-white/15 text-white border border-white/10"
                        title={q}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="text-white/70 text-sm">Đang trả lời...</div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Nhập câu hỏi..."
                className="flex-1 px-3 py-2 rounded-xl bg-black text-white border border-white/10 outline-none"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="h-10 w-10 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 text-white flex items-center justify-center"
                aria-label="Send"
                title="Gửi"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
