import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Brain, Clock, MessageCircle, Heart } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { sendChatMessage, fetchChatHistory, saveChatMessage, } from "../api/lambdaAPI/hamoChatApi.js";
import { cleanAIText, chunkIntoMessages, } from "../utils/chatTextUtils";

export default function ChatPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const auth = useAuth();
  const [client, setClient] = useState(state?.client || null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef(null);
  const { clientId, avatarId } = useParams(); // uniquely identifies one chat instance

  useEffect(() => {
    if (client) return;

    // If no client data passed, redirect back
    console.warn("No client data found, redirecting...");
    navigate(-1);
  }, [client, navigate]);


  /* ======================
     AUTO SCROLL
  ====================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  /* ======================
     LOAD CHAT HISTORY
  ====================== */
  useEffect(() => {
    if (!auth.user?.access_token || !clientId) return;

    let cancelled = false;

    async function loadHistory() {
      try {
        const history = await fetchChatHistory(
          auth.user.access_token,
          clientId,
          avatarId
        );

        if (cancelled) return;

        if (history.length > 0) {
          setMessages(
            history.map((msg) => ({
              id: msg.createdAt,
              text: msg.message,
              sender: msg.sender,
            }))
          );
        } else {
          setMessages([
            {
              id: "greeting",
              text: "Hello, I’m your AI therapist. How are you feeling today?",
              sender: "ai",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [auth.user?.access_token, clientId]);

  /* ======================
     SEND MESSAGE
  ====================== */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;

    const token = auth.user.access_token;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsThinking(true);

    try {
      // Save user message
      await saveChatMessage(token, {
        clientId,
        avatarId,
        sender: "user",
        text: userMessage.text,
      });

      // Get AI reply
      const aiReply = await sendChatMessage(token, userMessage.text);
      const cleaned = cleanAIText(aiReply.reply);

      const chunks = chunkIntoMessages(cleaned, 3, 5).filter(Boolean);

      const aiMessages = chunks.map((chunk, index) => ({
        id: `ai-${Date.now()}-${index}`,
        text: chunk,
        sender: "ai",
      }));

      setMessages((prev) => [...prev, ...aiMessages]);

      // Save AI messages (parallel)
      await Promise.all(
        aiMessages.map((msg) =>
          saveChatMessage(token, {
            clientId,
            avatarId,
            sender: "ai",
            text: msg.text,
          })
        )
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          text: "Sorry, something went wrong.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  /* ======================
     LOADING / ERROR STATES
  ====================== */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-slate-600 mb-4">No client session found.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  /* ======================
     CALCULATE SESSION INFO
  ====================== */
  const messageCount = messages.filter(m => m.sender === "user").length;
  const sessionDuration = messages.length > 0 
    ? Math.ceil((Date.now() - (messages[0]?.id === "greeting" ? Date.now() : messages[0]?.id)) / 60000)
    : 0;

  /* ======================
     CLEAN THERAPY UI
  ====================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Minimal Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <Brain className="text-white" size={20} />
          </div>
          
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">
              {client.avatarName || "AI Therapist"}
            </h1>
          </div>

          <div className="text-xs text-slate-500">
            {messageCount} messages
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Clean Chat Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Messages Area */}
          <div className="h-[calc(100vh-200px)] overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-100 text-slate-900 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-slate-600">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Clean Input */}
          <div className="border-t border-slate-200 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isThinking}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm 
                          focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 
                          disabled:bg-slate-50 disabled:text-slate-400"
              />
              <button
                type="submit"
                disabled={isThinking || !inputText.trim()}
                className="px-5 py-3 rounded-xl bg-indigo-600 text-white
                          hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                          transition-colors flex items-center gap-2"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
