import { useState, useEffect } from "react";
import { MessageSquare, Search, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { fetchClients } from "../api/lambdaAPI/clientsApi";
import { fetchChatHistory } from "../api/lambdaAPI/hamoChatApi";
import { useNavigate } from "react-router-dom";

export default function ChatsSection({ avatars }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  /* ======================
     LOAD CLIENTS & BUILD CONVERSATIONS
  ====================== */
  useEffect(() => {
    if (!auth.user?.access_token) return;

    async function loadConversations() {
      try {
        setLoading(true);
        
        // Fetch all clients
        const clientsData = await fetchClients(auth.user.access_token);
        setClients(clientsData);

        // Build conversation list: each client-avatar pair is a conversation
        const convos = [];
        
        for (const client of clientsData) {
          // Each client can have multiple avatars
          const clientAvatars = client.avatars || [];
          
          for (const avatarId of clientAvatars) {
            const avatar = avatars.find(a => a.avatarId === avatarId);
            
            if (avatar) {
              // Try to get last message for this conversation
              try {
                const history = await fetchChatHistory(
                  auth.user.access_token,
                  client.clientId,
                  avatarId
                );

                const lastMessage = history.length > 0 
                  ? history[history.length - 1] 
                  : null;

                convos.push({
                  clientId: client.clientId,
                  clientName: client.name,
                  avatarId: avatarId,
                  avatarName: avatar.name,
                  avatarPersonality: avatar.personality,
                  lastMessage: lastMessage?.message || "No messages yet",
                  lastMessageTime: lastMessage?.createdAt || client.createdAt,
                  messageCount: history.length,
                  sender: lastMessage?.sender || null,
                });
              } catch (err) {
                console.error(`Failed to load history for ${client.clientId}-${avatarId}:`, err);
                // Add conversation even if history fetch fails
                convos.push({
                  clientId: client.clientId,
                  clientName: client.name,
                  avatarId: avatarId,
                  avatarName: avatar.name,
                  avatarPersonality: avatar.personality,
                  lastMessage: "No messages yet",
                  lastMessageTime: client.createdAt,
                  messageCount: 0,
                  sender: null,
                });
              }
            }
          }
        }

        // Sort by most recent activity
        convos.sort((a, b) => {
          const timeA = typeof a.lastMessageTime === 'string' 
            ? new Date(a.lastMessageTime).getTime() 
            : a.lastMessageTime;
          const timeB = typeof b.lastMessageTime === 'string' 
            ? new Date(b.lastMessageTime).getTime() 
            : b.lastMessageTime;
          return timeB - timeA;
        });

        setConversations(convos);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [auth.user, avatars]);

  /* ======================
     FILTER CONVERSATIONS
  ====================== */
  const filteredConversations = conversations.filter((convo) => {
    const query = searchQuery.toLowerCase();
    return (
      convo.clientName.toLowerCase().includes(query) ||
      convo.avatarName.toLowerCase().includes(query)
    );
  });

  /* ======================
     FORMAT TIME
  ====================== */
  const formatTime = (timestamp) => {
    const date = typeof timestamp === 'string' 
      ? new Date(timestamp) 
      : new Date(timestamp);
    
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  /* ======================
     HANDLE CHAT CLICK
  ====================== */
  const handleChatClick = (convo) => {
    navigate(`/pro/chat/${convo.clientId}/${convo.avatarId}`, {
      state: {
        client: {
          clientId: convo.clientId,
          name: convo.clientName,
          avatarId: convo.avatarId,
          avatarName: convo.avatarName,
        },
      },
    });
  };

  /* ======================
     LOADING STATE
  ====================== */
  if (loading) {
    return (
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      </div>
    );
  }

  /* ======================
     EMPTY STATE
  ====================== */
  if (conversations.length === 0) {
    return (
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">
          Chat Conversations
        </h2>
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-16 text-center shadow-xl">
          <MessageSquare size={48} className="text-indigo-500 mb-6 mx-auto" />
          <h3 className="text-xl font-semibold text-slate-800">
            No Active Conversations
          </h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Conversations will appear here when clients start chatting with their assigned avatars.
          </p>
        </div>
      </div>
    );
  }

  /* ======================
     MAIN UI
  ====================== */
  return (
    <div className="w-full max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Chat Conversations
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitor all client-avatar conversations
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-xl border">
          <MessageSquare size={16} />
          <span className="font-semibold">{conversations.length}</span>
          <span>Active</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by client or avatar name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {filteredConversations.map((convo) => (
          <button
            key={`${convo.clientId}-${convo.avatarId}`}
            onClick={() => handleChatClick(convo)}
            className="w-full bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-300 transition-all group text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Client & Avatar Info */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {convo.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-base">
                      {convo.clientName}
                    </h3>
                    <p className="text-sm text-indigo-600 font-medium">
                      ↔ {convo.avatarName}
                    </p>
                  </div>
                </div>

                {/* Last Message Preview */}
                <div className="ml-15 mt-2">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {convo.sender === "user" && (
                      <span className="text-slate-400 mr-1">Client:</span>
                    )}
                    {convo.sender === "ai" && (
                      <span className="text-indigo-500 mr-1">AI:</span>
                    )}
                    {convo.lastMessage}
                  </p>
                </div>

                {/* Metadata */}
                <div className="ml-15 mt-3 flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formatTime(convo.lastMessageTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    <span>{convo.messageCount} messages</span>
                  </div>
                </div>
              </div>

              {/* Arrow Icon */}
              <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                <ArrowRight size={20} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* No Results */}
      {filteredConversations.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-slate-500">
            No conversations match "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
