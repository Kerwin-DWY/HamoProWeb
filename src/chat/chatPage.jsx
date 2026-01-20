import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "react-oidc-context"; 
import {sendChatMessage} from "../api/chatApi"; 

export default function ChatPage() {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { state } = useLocation();
  const auth = useAuth();

  const [client, setClient] = useState(state?.client || null);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, I’m your AI therapist. How are you feeling today?", sender: "ai" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(!state?.client);

  // Effect to handle page refreshes (when state.client is lost)
  useEffect(() => {
    if (!client && clientId && auth.user?.access_token) {
      // In a real app, you would call your API here:
      // fetchClientById(auth.user.access_token, clientId).then(setClient)
      
      console.log("Page refreshed. Need to fetch client details for ID:", clientId);
      // For now, if you don't have a specific "fetch single client" API yet, 
      // this placeholder keeps the UI from breaking:
      setIsLoading(false); 
    } else {
      setIsLoading(false);
    }
  }, [clientId, client, auth.user]);

const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!inputText.trim()) return;

  const userMessage = {
    id: Date.now(),
    text: inputText,
    sender: "user",
  };

  // Show user message immediately
  setMessages(prev => [...prev, userMessage]);
  setInputText("");

  try {
    // Call backend Gemini API
    const aiReply = await sendChatMessage(userMessage.text);

    // Split by newline and create multiple AI messages
    const aiMessages = aiReply
      .split("\n")
      .filter(line => line.trim() !== "")
      .map((line, index) => ({
        id: Date.now() + index + 1,
        text: line.trim(),
        sender: "ai",
      }));

    // Append AI messages
    setMessages(prev => [...prev, ...aiMessages]);

    } catch (err) {
    console.error(err);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: "Sorry, something went wrong.",
        sender: "ai",
      },
    ]);
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!client && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <p className="text-slate-600 mb-4">No client session found.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
        >
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pt-[100px] pb-10 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Chatting with {client?.name || "Client"}
              </h2>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                ID: {clientId?.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 h-[70vh] flex flex-col overflow-hidden">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-slate-100 flex gap-3"
          >
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <button 
              type="submit"
              className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}