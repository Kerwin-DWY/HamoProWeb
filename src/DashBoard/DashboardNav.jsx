import { Brain, User, BarChart3, MessageSquare, Settings } from "lucide-react";

const THERAPIST_TABS = [
    { key: "avatars", label: "AI Avatars", icon: Brain },
    { key: "clients", label: "Clients", icon: User },
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
];

const CLIENT_TABS = [
    { key: "chats", label: "Chats", icon: MessageSquare },
    { key: "settings", label: "Settings", icon: Settings },
];

export default function DashboardNav({ activeTab, setActiveTab, role }) {
    const tabs =
        role === "THERAPIST"
            ? THERAPIST_TABS
            : role === "CLIENT"
                ? CLIENT_TABS
                : [];

    return (
        <div className="w-full max-w-3xl px-6">
            <div className="flex justify-center bg-white/70 backdrop-blur-xl border rounded-full shadow-lg px-2 py-2">
                {tabs.map(({ key, label, icon: Icon }) => {
                    const isActive = activeTab === key;

                    return (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                                isActive
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
