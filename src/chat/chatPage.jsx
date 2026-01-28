import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { sendChatMessage, fetchChatHistory, saveChatMessage, } from "../api/lamda/hamoChatApi.js";
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

    // TODO: fetch client info by clientId + avatarId
    // OR redirect back safely

    navigate("/app", { replace: true });
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
        clientName: client.clientName,
        avatarId,
        avatarName: client.avatarName,
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
     UI
  ====================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pt-[100px] pb-10 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold">
              Chatting with {client.name}
            </h2>
            <p className="text-xs text-slate-500">
              ID: {clientId.slice(0, 8)}...
            </p>
          </div>
        </div>

        {/* Chat */}
        <div className="bg-white rounded-3xl shadow-xl border h-[70vh] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white border rounded-tl-none"
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white border px-4 py-3 rounded-2xl text-sm text-slate-600">
                  HAMO is thinking<span className="animate-pulse">...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t flex gap-3"
          >
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isThinking}
              placeholder="Type your message..."
              className="flex-1 rounded-2xl border px-4 py-3"
            />
            <button
              type="submit"
              disabled={isThinking}
              className="p-3 rounded-2xl bg-indigo-600 text-white"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
