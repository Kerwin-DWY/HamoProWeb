import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { MessageSquare, Search, User, Bot, Clock, ChevronRight } from "lucide-react";
import { fetchClients } from "../api/lambdaAPI/clientsApi";
import { fetchChatHistory } from "../api/lambdaAPI/hamoChatApi";

export default function ChatHistorySection({ avatars }) {
    const auth = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!auth.user?.access_token) return;

        async function loadConversations() {
            try {
                // Fetch all clients
                const clients = await fetchClients(auth.user.access_token);
                
                // For each client with an avatar, check if there are messages
                const conversationsData = [];
                
                for (const client of clients) {
                    if (client.selectedAvatarId) {
                        try {
                            const history = await fetchChatHistory(
                                auth.user.access_token,
                                client.clientId,
                                client.selectedAvatarId
                            );
                            
                            // Only show if there's at least one user message
                            const userMessages = history.filter(m => m.sender === 'user');
                            if (userMessages.length > 0) {
                                const avatar = avatars?.find(a => a.avatarId === client.selectedAvatarId);
                                const lastMsg = history[history.length - 1];
                                
                                conversationsData.push({
                                    clientId: client.clientId,
                                    clientName: client.name,
                                    avatarId: client.selectedAvatarId,
                                    avatarName: avatar?.avatarName || 'AI Therapist',
                                    messageCount: history.length,
                                    lastMessage: lastMsg?.message || '',
                                    lastMessageAt: lastMsg?.createdAt,
                                    lastSender: lastMsg?.sender,
                                });
                            }
                        } catch (err) {
                            console.error(`Failed to fetch history for ${client.name}:`, err);
                        }
                    }
                }
                
                // Sort by last message time
                conversationsData.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
                setConversations(conversationsData);
            } catch (err) {
                console.error("Failed to load conversations:", err);
            } finally {
                setLoading(false);
            }
        }

        loadConversations();
    }, [auth.user, avatars]);

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // Today
        if (diff < 86400000 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        // This week
        if (diff < 604800000) {
            return date.toLocaleDateString([], { weekday: 'short' });
        }
        // Older
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const filteredConversations = conversations.filter(conv => 
        conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.avatarName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="w-full max-w-4xl flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="w-full max-w-4xl">
                <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-16 text-center shadow-xl">
                    <MessageSquare size={48} className="text-indigo-500 mb-6 mx-auto" />
                    <h3 className="text-xl font-semibold text-slate-800">
                        No Chat History Yet
                    </h3>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto">
                        Chat history will appear here once your clients start conversations with their assigned AI avatars.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Chat History</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Monitor conversations between your clients and AI avatars
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by client or avatar name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500">Active Conversations</p>
                    <p className="text-2xl font-bold text-slate-900">{conversations.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500">Total Messages</p>
                    <p className="text-2xl font-bold text-slate-900">
                        {conversations.reduce((sum, c) => sum + c.messageCount, 0)}
                    </p>
                </div>
            </div>

            {/* Conversations List */}
            <div className="space-y-3">
                {filteredConversations.map((conv) => (
                    <div
                        key={`${conv.clientId}-${conv.avatarId}`}
                        onClick={() => navigate(`/pro/chat/${conv.clientId}/${conv.avatarId}`, {
                            state: { 
                                client: {
                                    clientId: conv.clientId,
                                    name: conv.clientName,
                                    avatarId: conv.avatarId,
                                    avatarName: conv.avatarName,
                                },
                                isTherapistView: true,
                            }
                        })}
                        className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group"
                    >
                        <div className="flex items-start gap-4">
                            {/* Avatar Icons */}
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                                    <Bot size={20} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white border-2 border-white">
                                    <User size={12} />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            {conv.clientName}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            with {conv.avatarName}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <span className="text-xs text-slate-400">
                                            {formatTime(conv.lastMessageAt)}
                                        </span>
                                        <div className="mt-1 text-xs text-indigo-600 font-medium">
                                            {conv.messageCount} messages
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mt-2 line-clamp-1">
                                    <span className="text-slate-400">
                                        {conv.lastSender === 'user' ? 'Client: ' : 'AI: '}
                                    </span>
                                    {conv.lastMessage}
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="text-slate-300 group-hover:text-indigo-500 transition-colors self-center">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredConversations.length === 0 && searchQuery && (
                <div className="text-center py-12 text-slate-500">
                    No conversations match "{searchQuery}"
                </div>
            )}
        </div>
    );
}
