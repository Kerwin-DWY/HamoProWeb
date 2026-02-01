import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useAuth } from "../auth/AuthProvider";
import { MessageSquare, Trash2 } from "lucide-react";
import { fetchUserChats, deleteUserChat } from "../api/lambdaAPI/userChatsApi";

export default function ChatsList() {
    const { chats, setChats, profile } = useUser();
    const auth = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    // Fetch chats from backend on mount
    useEffect(() => {
        if (!auth.user?.access_token) return;

        async function loadChats() {
            try {
                const userChats = await fetchUserChats(auth.user.access_token);
                setChats(userChats);
            } catch (err) {
                console.error("Failed to load chats:", err);
            } finally {
                setLoading(false);
            }
        }

        loadChats();
    }, [auth.user, setChats]);

    const handleDelete = async (chat, e) => {
        e.stopPropagation();
        
        if (!confirm(`Remove conversation with ${chat.avatarName}?`)) return;

        setDeletingId(`${chat.clientId}-${chat.avatarId}`);
        try {
            await deleteUserChat(auth.user.access_token, chat.clientId, chat.avatarId);
            setChats(prev => prev.filter(c => 
                !(c.clientId === chat.clientId && c.avatarId === chat.avatarId)
            ));
        } catch (err) {
            console.error("Failed to delete chat:", err);
            alert("Failed to remove conversation");
        } finally {
            setDeletingId(null);
        }
    };

    // Format time for display
    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="w-full max-w-3xl flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (chats.length === 0) {
        return (
            <div className="w-full max-w-3xl">
                <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-16 text-center shadow-xl">
                    <MessageSquare size={48} className="text-indigo-500 mb-6 mx-auto" />
                    <h3 className="text-xl font-semibold text-slate-800">
                        No Conversations Yet
                    </h3>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto">
                        Go to Settings and enter an invitation code from your therapist to start chatting with your AI companion.
                    </p>
                </div>
            </div>
        );
    }

    // Get user's nickname or email prefix
    const userNickname = profile?.nickname || auth.user?.profile?.email?.split('@')[0] || 'You';

    return (
        <div className="w-full max-w-3xl">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Your Conversations</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Chat with your AI therapy companions
                </p>
            </div>

            <div className="space-y-3">
                {chats.map((chat) => {
                    const chatId = `${chat.clientId}-${chat.avatarId}`;
                    const isDeleting = deletingId === chatId;
                    const lastMessage = chat.lastMessage || `Hello! I'm ${chat.avatarName}. Welcome to Hamo! I'm here to support you on your journey.`;

                    return (
                        <div
                            key={chatId}
                            className="relative w-full bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:border-slate-200 transition-all group cursor-pointer"
                            onClick={() => !isDeleting && navigate(`/chat/${chat.clientId}/${chat.avatarId}`, {
                                state: { 
                                    client: {
                                        clientId: chat.clientId,
                                        name: chat.clientName,
                                        avatarId: chat.avatarId,
                                        avatarName: chat.avatarName,
                                    } 
                                },
                            })}
                        >
                            <div className="flex items-start gap-4 p-4">
                                {/* Avatar Icon - Round with gradient */}
                                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-400 to-purple-500 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0">
                                    <MessageSquare size={24} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-base font-semibold text-slate-900">
                                                {chat.avatarName || 'AI Therapist'}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                {userNickname}
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                                            {formatTime(chat.lastMessageAt || chat.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                        {lastMessage}
                                    </p>
                                </div>
                            </div>

                            {/* Delete Button - appears on hover */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(chat, e);
                                }}
                                disabled={isDeleting}
                                className="absolute top-2 right-2 p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                title="Remove conversation"
                            >
                                {isDeleting ? (
                                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
