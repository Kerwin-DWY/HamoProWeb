import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useAuth } from "../auth/AuthProvider";
import { MessageSquare, ArrowRight, Sparkles, Trash2, AlertCircle } from "lucide-react";
import { fetchUserChats, deleteUserChat } from "../api/lambdaAPI/userChatsApi";

export default function ChatsList() {
    const { chats, setChats } = useUser();
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
                // Silently fail - user can still use the app
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

    return (
        <div className="w-full max-w-3xl">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Your Conversations</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Chat with your AI therapy companions
                </p>
            </div>

            <div className="space-y-4">
                {chats.map((chat) => {
                    const chatId = `${chat.clientId}-${chat.avatarId}`;
                    const isDeleting = deletingId === chatId;

                    return (
                        <div
                            key={chatId}
                            className="relative w-full bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-300 transition-all group"
                        >
                            <button
                                onClick={() =>
                                    navigate(`/chat/${chat.clientId}/${chat.avatarId}`, {
                                        state: { 
                                            client: {
                                                clientId: chat.clientId,
                                                name: chat.clientName,
                                                avatarId: chat.avatarId,
                                                avatarName: chat.avatarName,
                                            } 
                                        },
                                    })
                                }
                                className="w-full text-left"
                                disabled={isDeleting}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar Icon */}
                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                                            <Sparkles size={24} />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">
                                                {chat.avatarName}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-0.5">
                                                AI Therapy Companion
                                            </p>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                                        <ArrowRight size={24} />
                                    </div>
                                </div>
                            </button>

                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDelete(chat, e)}
                                disabled={isDeleting}
                                className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Remove conversation"
                            >
                                {isDeleting ? (
                                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Trash2 size={18} />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
