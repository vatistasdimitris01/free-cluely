import React, { useState, useEffect, useRef } from "react"
import { useQuery } from "react-query"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ScreenshotQueue from "../components/Queue/ScreenshotQueue"
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastVariant,
  ToastMessage
} from "../components/ui/toast"
import QueueCommands from "../components/Queue/QueueCommands"
  import ModelSelector from "../components/ui/ModelSelector"
  import { Sparkles, Wand2, MessageSquare, RefreshCw, X, Send, ChevronUp, Settings2, ArrowUp, Trash2, Copy, Check, RotateCcw } from "lucide-react"

interface QueueProps {
  setView: React.Dispatch<React.SetStateAction<"queue" | "solutions" | "debug">>
}

const Queue: React.FC<QueueProps> = ({ setView }) => {
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<ToastMessage>({
    title: "",
    description: "",
    variant: "neutral"
  })

  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [tooltipHeight, setTooltipHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<{role: "user"|"gemini", text: string}[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentModel, setCurrentModel] = useState<{ provider: string; model: string }>({ provider: "gemini", model: "gemini-3-pro-preview" })

  const { data: screenshots = [], refetch } = useQuery<Array<{ path: string; preview: string }>, Error>(
    ["screenshots"],
    async () => {
      try {
        const existing = await window.electronAPI.getScreenshots()
        return existing
      } catch (error) {
        console.error("Error loading screenshots:", error)
        showToast("Error", "Failed to load existing screenshots", "error")
        return []
      }
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: true,
      refetchOnMount: true
    }
  )

  useEffect(() => {
    if (toastOpen) {
      const timer = setTimeout(() => {
        setToastOpen(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toastOpen])

  const showToast = (
    title: string,
    description: string,
    variant: ToastVariant
  ) => {
    setToastMessage({ title, description, variant })
    setToastOpen(true)
  }

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      showToast("Error", "Failed to copy text to clipboard", "error")
    }
  }

  const handleDeleteScreenshot = async (index: number) => {
    const screenshotToDelete = screenshots[index]

    try {
      const response = await window.electronAPI.deleteScreenshot(
        screenshotToDelete.path
      )

      if (response.success) {
        refetch()
      } else {
        console.error("Failed to delete screenshot:", response.error)
        showToast("Error", "Failed to delete the screenshot file", "error")
      }
    } catch (error) {
      console.error("Error deleting screenshot:", error)
    }
  }

  const abortControllerRef = useRef<AbortController | null>(null)

  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setChatLoading(false)
      showToast("Generation Aborted", "The response generation was stopped.", "neutral")
    }
  }

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return

    let userMsg = chatInput.trim()
    
    setChatInput("")
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }])
    await processChatMessage(userMsg)
  }

  const handleRegenerate = async (index: number) => {
    if (chatLoading) return
    
    // Find the user message before this AI message
    let userMsg = ""
    for (let i = index - 1; i >= 0; i--) {
      if (chatMessages[i].role === "user") {
        userMsg = chatMessages[i].text
        break
      }
    }

    if (!userMsg) return

    // Remove the old AI response and any subsequent messages if necessary
    // or just replace the one at 'index' if it's an AI message
    setChatMessages(prev => {
      const newMsgs = [...prev]
      newMsgs.splice(index, 1) // Remove the AI message
      return newMsgs
    })

    await processChatMessage(userMsg)
  }

  const processChatMessage = async (message: string) => {
    setChatLoading(true)
    abortControllerRef.current = new AbortController()

    try {
      const response = await window.electronAPI.invoke("gemini-chat", message)
      
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      setChatMessages(prev => [...prev, { role: "gemini", text: response }])
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Generation aborted by user')
      } else {
        console.error("Chat error:", error)
        showToast("Error", "Failed to get response from AI", "error")
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setChatLoading(false)
        abortControllerRef.current = null
        chatInputRef.current?.focus()
      }
    }
  }

  // Load current model configuration on mount
  useEffect(() => {
    const loadCurrentModel = async () => {
      try {
        const config = await window.electronAPI.getCurrentLlmConfig();
        setCurrentModel({ provider: config.provider, model: config.model });
      } catch (error) {
        console.error('Error loading current model config:', error);
      }
    };
    loadCurrentModel();
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (contentRef.current) {
        let contentHeight = contentRef.current.scrollHeight
        const contentWidth = contentRef.current.scrollWidth
        if (isTooltipVisible) {
          contentHeight += tooltipHeight
        }
        window.electronAPI.updateContentDimensions({
          width: contentWidth,
          height: contentHeight
        })
      }
    }

    const resizeObserver = new ResizeObserver(updateDimensions)
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }
    updateDimensions()

    const cleanupFunctions = [
      window.electronAPI.onScreenshotTaken(() => refetch()),
      window.electronAPI.onResetView(() => refetch()),
      window.electronAPI.onSolutionError((error: string) => {
        showToast(
          "Processing Failed",
          "There was an error processing your screenshots.",
          "error"
        )
        setView("queue")
        console.error("Processing error:", error)
      }),
      window.electronAPI.onProcessingNoScreenshots(() => {
        showToast(
          "No Screenshots",
          "There are no screenshots to process.",
          "neutral"
        )
      })
    ]

    return () => {
      resizeObserver.disconnect()
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [isTooltipVisible, tooltipHeight])

  // Seamless screenshot-to-LLM flow
  useEffect(() => {
    const unsubscribe = window.electronAPI.onScreenshotTaken(async (data) => {
      await refetch();
      setChatLoading(true);
      try {
        const latest = data?.path || (Array.isArray(data) && data.length > 0 && data[data.length - 1]?.path);
        if (latest) {
          const response = await window.electronAPI.invoke("analyze-image-file", latest);
          setChatMessages((msgs) => [...msgs, { role: "gemini", text: response.text }]);
        }
      } catch (err) {
        setChatMessages((msgs) => [...msgs, { role: "gemini", text: "Error: " + String(err) }]);
      } finally {
        setChatLoading(false);
      }
    });
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [refetch]);

  const handleTooltipVisibilityChange = (visible: boolean, height: number) => {
    setIsTooltipVisible(visible)
    setTooltipHeight(height)
  }

  const handleChatToggle = () => {
    if (!isChatOpen) {
      setIsSettingsOpen(false)
      setIsChatOpen(true)
    } else {
      setIsChatOpen(false)
    }
  }

  const handleSettingsToggle = () => {
    if (!isSettingsOpen) setIsChatOpen(false)
    setIsSettingsOpen(!isSettingsOpen)
  }

  const handleClearChat = () => {
    setChatMessages([])
    showToast("Chat Cleared", "The conversation history has been reset.", "neutral")
  }

  const handleModelChange = (provider: "ollama" | "gemini", model: string) => {
    setCurrentModel({ provider, model })
    const modelName = provider === "ollama" ? model : "Gemini 2.0 Flash"
    setChatMessages((msgs) => [...msgs, { 
      role: "gemini", 
      text: `Switched to ${provider === "ollama" ? "Local" : "Cloud"} ${modelName}. Ready for your questions!` 
    }])
  }

  const handleSmartToggle = async () => {
     try {
       const config = await window.electronAPI.getCurrentLlmConfig();
       const nextProvider = config.provider === 'gemini' ? 'ollama' : 'gemini';
       
       if (nextProvider === 'ollama') {
         // Switch to ollama and try to auto-select/detect models
         await window.electronAPI.invoke('switch-to-ollama');
         // After switching, the LLMHelper will have auto-detected the model
       } else {
         await window.electronAPI.invoke('switch-to-gemini');
       }
       
       const newConfig = await window.electronAPI.getCurrentLlmConfig();
       handleModelChange(newConfig.provider as "ollama" | "gemini", newConfig.model);
       
       // Show feedback
       showToast(
         "Model Switched", 
         `Now using ${newConfig.provider === 'ollama' ? 'Local (' + newConfig.model + ')' : 'Cloud Intelligence'}`, 
         "neutral"
       );
     } catch (error) {
       console.error('Error toggling smart model:', error);
       showToast("Error", "Failed to switch model provider. Make sure Ollama is running.", "error");
     }
   };

  return (
    <div
      ref={contentRef}
      style={{
        position: "relative",
        width: "100%",
        pointerEvents: "auto"
      }}
      className="select-none"
    >
      <div className="bg-transparent w-full">
        <div className="px-2 py-1 flex flex-col items-center">
          <Toast
            open={toastOpen}
            onOpenChange={setToastOpen}
            variant={toastMessage.variant}
            duration={3000}
          >
            <ToastTitle>{toastMessage.title}</ToastTitle>
            <ToastDescription>{toastMessage.description}</ToastDescription>
          </Toast>

          <div className="w-fit">
            <QueueCommands
              screenshots={screenshots}
              onTooltipVisibilityChange={handleTooltipVisibilityChange}
              onChatToggle={handleChatToggle}
              onSettingsToggle={handleSettingsToggle}
              isChatOpen={isChatOpen}
              isGenerating={chatLoading}
              onAbort={handleAbort}
            />
          </div>

          {/* Conditional Settings Interface - Ultra Minimal */}
          {isSettingsOpen && (
            <div className="mt-4 w-full max-w-sm mx-auto bg-[#1E1E1E]/95 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Preferences</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleClearChat}
                      className="group p-2 text-white/20 hover:text-red-500 transition-colors"
                      title="Clear Chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsSettingsOpen(false)} className="group p-2 -mr-2">
                      <X className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>
              <ModelSelector 
              onModelChange={handleModelChange} 
              onSettingsClose={() => setIsSettingsOpen(false)} 
            />
            </div>
          )}
          
          {/* Conditional Chat Interface - Ultra Minimal */}
          {isChatOpen && (
            <div className="mt-4 w-full max-w-2xl mx-auto relative">
              <div className="bg-[#1E1E1E]/95 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 shadow-2xl flex flex-col gap-4 overflow-hidden">
                {/* Header Area */}
                <div className="flex items-center justify-between px-2 pb-2 border-b border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Chat</span>
                  {chatMessages.length > 0 && (
                    <button 
                      onClick={handleClearChat}
                      className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-red-400/80 transition-colors"
                      title="Clear Conversation"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {/* Messages Area - High Contrast Minimal */}
                <div className="flex-1 overflow-y-auto max-h-[400px] min-h-[80px] pr-2 custom-scrollbar no-scrollbar">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/10 text-sm gap-4 py-8">
                      <p className="tracking-tight font-light text-white/30 text-lg">
                        Ask about your screen or conversation
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                            >
                            <div
                              className={`max-w-[85%] px-5 py-3 rounded-[24px] text-[13px] leading-relaxed tracking-tight prose prose-invert prose-sm ${
                                msg.role === "user" 
                                  ? "bg-[#333333] text-white font-medium prose-p:text-white prose-headings:text-white prose-code:text-white" 
                                  : "bg-transparent text-white/90 border-none prose-p:text-white/90"
                              }`}
                            >
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-2">
                              <button
                                onClick={() => handleCopy(msg.text, idx)}
                                className="p-1.5 text-white/30 hover:text-white/60 transition-colors flex items-center gap-1.5 group rounded-md hover:bg-white/5"
                                title="Copy message"
                              >
                                {copiedIndex === idx ? (
                                  <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              {msg.role === "gemini" && (
                                <button
                                  onClick={() => handleRegenerate(idx)}
                                  className={`p-1.5 text-white/30 hover:text-white/60 transition-colors flex items-center gap-1.5 group rounded-md hover:bg-white/5 ${chatLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title="Regenerate response"
                                  disabled={chatLoading}
                                >
                                  <RotateCcw className={`w-3.5 h-3.5 ${chatLoading ? 'animate-spin' : ''}`} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="px-5 py-3">
                        <span className="font-semibold text-[13px] tracking-tight text-transparent bg-clip-text bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_25%,rgba(255,255,255,1)_50%,rgba(255,255,255,0.1)_75%)] bg-[length:250%_100%] animate-shimmer">
                          Thinking
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area - Sleek Design from Image */}
                <form
                  className="relative"
                  onSubmit={e => {
                    e.preventDefault();
                    handleChatSend();
                  }}
                >
                  <div className="bg-transparent border border-white/10 rounded-[20px] p-1.5 pr-2 transition-all focus-within:border-white/20 focus-within:bg-white/5">
                    <div className="flex items-center gap-2">
                      <textarea
                        ref={chatInputRef}
                        rows={1}
                        className="flex-1 bg-transparent text-white placeholder-white/20 text-[13px] focus:outline-none transition-all resize-none interactive tracking-tight py-1.5 pl-2 max-h-24 no-scrollbar"
                        placeholder="Type your message..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSend();
                          }
                        }}
                        disabled={chatLoading}
                      />
                      <button
                        type="submit"
                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white rounded-full text-black hover:bg-white/90 transition-all disabled:opacity-0 interactive shadow-lg shadow-white/5"
                        disabled={chatLoading || !chatInput.trim()}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Queue

