import { useState, useRef, useEffect } from "react"
import { Send, X, Bot, Loader2, Sparkles } from "lucide-react"
import { chatWithAI } from "@/services/api"
import Markdown from "react-markdown"

interface IMessage {
  role: "user" | "assistant"
  content: string
}

const QUICK_QUESTIONS = [
  "Hôm nay có phim nào đang chiếu?",
  "Giá vé của rạp?",
  "Rạp có những loại phòng chiếu nào?",
]

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<IMessage[]>([
    {
      role: "assistant",
      content: "👋 Xin chào! Tôi là trợ lý ảo của Rạp chiếu phim Lê Độ. Tôi có thể giúp gì cho bạn?"
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (text?: string) => {
    const question = text || input.trim()
    if (!question || isLoading) return

    const userMessage: IMessage = {
      role: "user",
      content: question
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await chatWithAI(question)
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: res.answer 
      }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Đã có lỗi xảy ra. Vui lòng thử lại sau! 😔" 
      }])
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-2xl group-hover:scale-110 transition-all duration-300 border-2 border-white/20">
              <Bot className="w-6 h-6" />
            </div>
          </div>
        </button>
      )}

      {/* Chat Window - Modern Glass Design */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end p-0 md:p-6 items-end md:items-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Chat Container */}
          <div className="relative w-full h-[85vh] md:h-[680px] md:w-[420px] md:max-h-[85vh] flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 md:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl">
            <div className="relative bg-gradient-to-r from-violet-600/90 via-purple-600/90 to-indigo-600/90 backdrop-blur-xl border-b border-white/10">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      Lê Độ Chatbot
                    </h3>
                    <p className="text-white/70 text-sm">Luôn sẵn sàng hỗ trợ bạn</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area - Modern scrollbar */}
            <div className="relative flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-white/20"
                        : "bg-slate-800/80 backdrop-blur-md text-white border border-white/10"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                        <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg p-1">
                          <Bot className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm text-purple-300 font-medium">Trợ lý AI</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap"><Markdown>{msg.content}</Markdown></div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/90 rounded-2xl px-4 py-3 border border-gray-700">
                    <div className="flex items-center gap-2.5">
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                      <span className="text-sm text-gray-300">Đang trả lời...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions - Modern Pills */}
            {messages.length === 1 && (
              <div className="relative px-5 py-4 border-t border-white/10 bg-slate-800/40 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <p className="text-xs text-purple-300 font-medium">Câu hỏi gợi ý</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-xs bg-gradient-to-r from-slate-700/80 to-slate-800/80 hover:from-purple-600/80 hover:to-indigo-600/80 backdrop-blur-sm text-gray-200 hover:text-white px-4 py-2 rounded-full transition-all duration-300 border border-white/10 hover:border-white/20 shadow-lg hover:shadow-purple-500/20 hover:scale-105"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area - Modern Glass */}
            <div className="relative p-4 border-t border-white/10 bg-slate-800/40 backdrop-blur-xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập câu hỏi của bạn..."
                    disabled={isLoading}
                    className="w-full bg-slate-700/50 backdrop-blur-sm text-white placeholder-gray-400 px-5 py-3.5 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm disabled:opacity-50 transition-all duration-200 shadow-inner"
                  />
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="relative bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[56px] flex items-center justify-center shadow-lg hover:shadow-purple-500/50 border border-white/20 group overflow-hidden"
                >
                  <Send className="w-5 h-5 relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}